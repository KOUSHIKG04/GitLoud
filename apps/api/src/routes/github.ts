import { Hono } from "hono";
import { db } from "@repo/db/client";
import { getCurrentUserId } from "@/lib/auth";
import {
  createAppOctokit,
  syncInstallationRepositories,
} from "@/lib/github-app";
import { getUserFeatures } from "@/lib/features";

export const githubRoutes = new Hono();

githubRoutes.get("/install-url", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const features = await getUserFeatures(userId);

  if (!features.canUsePrivateRepos) {
    return context.json(
      { error: "Private repositories are available on the Pro plan." },
      402,
    );
  }

  const appName = process.env.GITHUB_APP_NAME;

  if (!appName) {
    return context.json({ error: "GITHUB_APP_NAME is missing" }, 500);
  }

  const url = new URL(`https://github.com/apps/${appName}/installations/new`);

  // Later: replace this with signed state.
  url.searchParams.set("state", userId);

  return context.json({ url: url.toString() });
});

githubRoutes.get("/callback", async (context) => {
  try {
    const installationId = context.req.query("installation_id");
    const userId = context.req.query("state");

    if (!installationId || !userId) {
      return context.json({ error: "Missing installation_id or state" }, 400);
    }

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

    await db.gitHubInstallation.upsert({
      where: {
        installationId: BigInt(installationId),
      },
      create: {
        installationId: BigInt(installationId),
        userId,
        accountLogin,
        accountType,
        repositorySelection: installation.data.repository_selection,
      },
      update: {
        userId,
        accountLogin,
        accountType,
        repositorySelection: installation.data.repository_selection,
      },
    });

    await syncInstallationRepositories(BigInt(installationId));

    return context.redirect("http://localhost:3000/dashboard?github=connected");
  } catch (error) {
    console.error("GitHub callback failed", error);

    return context.json(
      {
        error: "GitHub callback failed",
        message: error instanceof Error ? error.message : String(error),
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

  return context.json({
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
    })),
  });
});

githubRoutes.post("/sync-installation", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const features = await getUserFeatures(userId);

  if (!features.canUsePrivateRepos) {
    return context.json(
      { error: "Private repositories are available on the Pro plan." },
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

  await db.gitHubInstallation.deleteMany({
    where: { id, userId },
  });

  return context.json({ ok: true });
});

githubRoutes.delete(
  "/installations/:installationId/repositories/:repositoryId",
  async (context) => {
    const userId = await getCurrentUserId(context.req.raw);

    if (!userId) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const installationId = context.req.param("installationId");
    const repositoryId = context.req.param("repositoryId");
    const installation = await db.gitHubInstallation.findFirst({
      where: { id: installationId, userId },
      select: { installationId: true },
    });

    if (!installation) {
      return context.json({ error: "GitHub installation not found" }, 404);
    }

    await db.gitHubInstallationRepository.deleteMany({
      where: {
        id: repositoryId,
        installationId: installation.installationId,
      },
    });

    return context.json({ ok: true });
  },
);
