import { Hono } from "hono";
import type {
  GitHubActivityResponse,
  GitHubInstallationsResponse,
} from "@repo/shared/github-app";
import { db } from "@repo/db/client";
import { Octokit } from "@octokit/rest";
import { getCurrentUserId } from "@/lib/auth";
import {
  createRepositoryReadToken,
  createAppOctokit,
  syncInstallationRepositories,
} from "@/lib/github-app";
import { getUserFeatures } from "@/lib/features";
import {
  createGitHubInstallState,
  verifyGitHubInstallState,
} from "@/lib/github-install-state";
import { logger } from "@/lib/logger";

export const githubRoutes = new Hono();
const githubActivityPageSize = 20;

githubRoutes.get("/install-url", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const features = await getUserFeatures(userId);

  if (!features.canUsePrivateRepos) {
    return context.json(
      { error: "Private repositories are unavailable for this account." },
      402,
    );
  }

  const appName = process.env.GITHUB_APP_NAME;

  if (!appName) {
    return context.json({ error: "GITHUB_APP_NAME is missing" }, 500);
  }

  const url = new URL(`https://github.com/apps/${appName}/installations/new`);

  try {
    url.searchParams.set("state", createGitHubInstallState(userId));
  } catch (error) {
    logger.error("GitHub installation state configuration failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return context.json(
      {
        error:
          "GitHub App state signing is not configured. Set GITHUB_APP_STATE_SECRET.",
      },
      500,
    );
  }

  return context.json({ url: url.toString() });
});

githubRoutes.get("/callback", async (context) => {
  const installationId = context.req.query("installation_id");
  const state = context.req.query("state");

  if (!installationId || !state) {
    return context.json({ error: "Missing installation_id or state" }, 400);
  }

  let userId: string;
  let numericInstallationId: bigint;

  try {
    numericInstallationId = parseInstallationId(installationId);
    userId = verifyGitHubInstallState(state).userId;
  } catch {
    return context.json({ error: "Invalid GitHub installation callback" }, 400);
  }

  try {
    const octokit = createAppOctokit();

    const installation = await octokit.apps.getInstallation({
      installation_id: Number(installationId),
    });

    const account = installation.data.account;

    if (!account) {
      return context.json({ error: "Installation account missing" }, 400);
    }

    const accountLogin = "login" in account ? account.login : account.slug;
    const accountType = "type" in account ? account.type : "Enterprise";
    const existingInstallation = await db.gitHubInstallation.findUnique({
      where: { installationId: numericInstallationId },
      select: { userId: true },
    });

    if (existingInstallation && existingInstallation.userId !== userId) {
      logger.warn("GitHub installation ownership conflict", {
        installationId,
        requestedUserId: userId,
      });

      return context.json(
        { error: "This GitHub installation is already connected." },
        409,
      );
    }

    try {
      await db.gitHubInstallation.create({
        data: {
          installationId: numericInstallationId,
          userId,
          accountLogin,
          accountType,
          repositorySelection: installation.data.repository_selection,
        },
      });
    } catch (error) {
      if ((error as { code?: unknown }).code !== "P2002") {
        throw error;
      }

      const conflictingInstallation = await db.gitHubInstallation.findUnique({
        where: {
          installationId: numericInstallationId,
        },
        select: { userId: true },
      });

      if (conflictingInstallation?.userId !== userId) {
        logger.warn("GitHub installation ownership conflict", {
          installationId,
          requestedUserId: userId,
        });

        return context.json(
          { error: "This GitHub installation is already connected." },
          409,
        );
      }

      await db.gitHubInstallation.update({
        where: {
          installationId: numericInstallationId,
        },
        data: {
          accountLogin,
          accountType,
          repositorySelection: installation.data.repository_selection,
        },
      });
    }

    await syncInstallationRepositories(numericInstallationId);

    return context.redirect(
      `${getWebAppUrl()}/dashboard/settings/github-app?github=connected`,
    );
  } catch (error) {
    logger.error("GitHub callback failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return context.json(
      {
        error: "GitHub callback failed",
      },
      500,
    );
  }
});

githubRoutes.get("/installations", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const features = await getUserFeatures(userId);
  const installations = await db.gitHubInstallation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      repositories: {
        orderBy: [{ owner: "asc" }, { repo: "asc" }],
      },
    },
  });

  const response = {
    plan: features.plan,
    canUsePrivateRepos: features.canUsePrivateRepos,
    installations: installations.map((installation) => ({
      id: installation.id,
      installationId: installation.installationId.toString(),
      accountLogin: installation.accountLogin,
      accountType: installation.accountType,
      repositorySelection: installation.repositorySelection,
      updatedAt: installation.updatedAt.toISOString(),
      repositories: installation.repositories.map((repository) => ({
        id: repository.id,
        owner: repository.owner,
        repo: repository.repo,
        repoId: repository.repoId?.toString() ?? null,
      })),
      manageUrl: getGitHubInstallationManageUrl({
        accountLogin: installation.accountLogin,
        accountType: installation.accountType,
        installationId: installation.installationId,
      }),
    })),
  } satisfies GitHubInstallationsResponse;

  return context.json(response);
});

githubRoutes.get("/activity", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const features = await getUserFeatures(userId);

  if (!features.canUsePrivateRepos) {
    return context.json(
      { error: "GitHub activity browser is unavailable for this account." },
      402,
    );
  }

  const repositoryId = context.req.query("repositoryId");
  const type = context.req.query("type") ?? "pull-requests";

  if (!repositoryId) {
    return context.json({ error: "repositoryId is required" }, 400);
  }

  if (type !== "pull-requests" && type !== "commits") {
    return context.json({ error: "Unsupported activity type" }, 400);
  }

  const repository = await db.gitHubInstallationRepository.findFirst({
    where: {
      id: repositoryId,
      installation: { userId },
    },
    select: {
      owner: true,
      repo: true,
      installationId: true,
    },
  });

  if (!repository) {
    return context.json({ error: "Repository was not found" }, 404);
  }

  const token = await createRepositoryReadToken({
    installationId: repository.installationId,
    repo: repository.repo,
  });
  const octokit = new Octokit({ auth: token });

  if (type === "pull-requests") {
    const pullRequests = await octokit.pulls.list({
      owner: repository.owner,
      repo: repository.repo,
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: githubActivityPageSize,
    });

    const response = {
      repository: {
        owner: repository.owner,
        repo: repository.repo,
      },
      type,
      items: pullRequests.data.map((pullRequest) => ({
        id: `pr-${pullRequest.id}`,
        sourceType: "pull-request",
        title: pullRequest.title,
        subtitle: `#${pullRequest.number} ${pullRequest.state}`,
        author: pullRequest.user?.login ?? null,
        updatedAt: pullRequest.updated_at,
        url: pullRequest.html_url,
      })),
    } satisfies GitHubActivityResponse & {
      repository: { owner: string; repo: string };
      type: "pull-requests";
    };

    return context.json(response);
  }

  const commits = await octokit.repos.listCommits({
    owner: repository.owner,
    repo: repository.repo,
    per_page: githubActivityPageSize,
  });

  const response = {
    repository: {
      owner: repository.owner,
      repo: repository.repo,
    },
    type,
    items: commits.data.map((commit) => ({
      id: `commit-${commit.sha}`,
      sourceType: "commit",
      title: commit.commit.message.split("\n")[0] || commit.sha.slice(0, 7),
      subtitle: commit.sha.slice(0, 7),
      author:
        commit.author?.login ??
        commit.commit.author?.name ??
        commit.commit.committer?.name ??
        null,
      updatedAt:
        commit.commit.author?.date ?? commit.commit.committer?.date ?? null,
      url: commit.html_url,
    })),
  } satisfies GitHubActivityResponse & {
    repository: { owner: string; repo: string };
    type: "commits";
  };

  return context.json(response);
});

githubRoutes.post("/sync-installation", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const features = await getUserFeatures(userId);

  if (!features.canUsePrivateRepos) {
    return context.json(
      { error: "Private repositories are unavailable for this account." },
      402,
    );
  }

  const installations = await db.gitHubInstallation.findMany({
    where: { userId },
    select: { installationId: true },
  });

  const synced = [];

  for (const installation of installations) {
    const repositoryCount = await syncInstallationRepositories(
      installation.installationId,
    );

    synced.push({
      installationId: installation.installationId.toString(),
      repositoryCount,
    });
  }

  return context.json({ synced });
});

githubRoutes.delete("/installations/:id", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const id = context.req.param("id");
  const installation = await db.gitHubInstallation.findFirst({
    where: { id, userId },
    select: { installationId: true },
  });

  if (!installation) {
    return context.json({ error: "GitHub installation not found" }, 404);
  }

  try {
    const octokit = createAppOctokit();

    await octokit.apps.deleteInstallation({
      installation_id: Number(installation.installationId),
    });
  } catch (error) {
    const status = getHttpStatus(error);

    if (status !== 404) {
      logger.error("GitHub installation uninstall failed", {
        installationId: installation.installationId.toString(),
        userId,
        error: error instanceof Error ? error.message : String(error),
      });

      return context.json(
        { error: "Could not uninstall the GitHub App. Try again." },
        502,
      );
    }
  }

  await db.gitHubInstallation.delete({
    where: { id },
  });

  return context.json({ ok: true });
});

function getWebAppUrl() {
  const configuredUrl = process.env.WEB_APP_URL?.trim().replace(/\/+$/, "");

  if (configuredUrl) {
    return configuredUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  throw new Error("WEB_APP_URL is missing");
}

function getGitHubInstallationManageUrl({
  accountLogin,
  accountType,
  installationId,
}: {
  accountLogin: string;
  accountType: string;
  installationId: bigint;
}) {
  if (accountType.toLowerCase() === "organization") {
    return `https://github.com/organizations/${encodeURIComponent(accountLogin)}/settings/installations/${installationId}`;
  }

  return `https://github.com/settings/installations/${installationId}`;
}

function getHttpStatus(error: unknown) {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }

  return typeof error.status === "number" ? error.status : undefined;
}

function parseInstallationId(value: string) {
  if (!/^\d+$/.test(value)) {
    throw new Error("Invalid installation id");
  }

  return BigInt(value);
}
