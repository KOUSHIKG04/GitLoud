import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { db } from "@repo/db/client";

const repositoryReadPermissions = {
  contents: "read",
  metadata: "read",
  pull_requests: "read",
} as const;

function getPrivateKey() {
  const key = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!key) {
    throw new Error("GITHUB_APP_PRIVATE_KEY is missing");
  }

  return key.replace(/\\n/g, "\n");
}

function getAppAuth() {
  if (!process.env.GITHUB_APP_ID) {
    throw new Error("GITHUB_APP_ID is missing");
  }

  return createAppAuth({
    appId: process.env.GITHUB_APP_ID,
    privateKey: getPrivateKey(),
    clientId: process.env.GITHUB_APP_CLIENT_ID,
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
  });
}

export async function createInstallationToken(
  installationId: bigint,
  options: {
    permissions?: Record<string, "read">;
    repositoryNames?: string[];
  } = {},
) {
  const auth = getAppAuth();

  const installationAuth = await auth({
    type: "installation",
    installationId: Number(installationId),
    permissions: options.permissions,
    repositoryNames: options.repositoryNames,
  });

  return installationAuth.token;
}

export async function findUserInstallationForRepo({
  userId,
  owner,
  repo,
}: {
  userId: string;
  owner: string;
  repo: string;
}) {
  return db.gitHubInstallation.findFirst({
    where: {
      userId,
      OR: [
        {
          repositorySelection: "all",
          accountLogin: {
            equals: owner,
            mode: "insensitive",
          },
        },
        {
          repositories: {
            some: {
              owner: {
                equals: owner,
                mode: "insensitive",
              },
              repo: {
                equals: repo,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    },
  });
}

export async function getGitHubTokenForRepo({
  userId,
  owner,
  repo,
}: {
  userId: string;
  owner: string;
  repo: string;
}) {
  const installation = await findUserInstallationForRepo({
    userId,
    owner,
    repo,
  });

  if (!installation) {
    return undefined;
  }

  try {
    return await createInstallationToken(installation.installationId, {
      permissions: repositoryReadPermissions,
      repositoryNames: [repo],
    });
  } catch (error) {
    if (!isMissingGitHubInstallationError(error)) {
      throw error;
    }

    await db.gitHubInstallation
      .deleteMany({
        where: {
          installationId: installation.installationId,
          userId,
        },
      })
      .catch(() => undefined);

    return undefined;
  }
}

export async function createRepositoryReadToken({
  installationId,
  repo,
}: {
  installationId: bigint;
  repo: string;
}) {
  return createInstallationToken(installationId, {
    permissions: repositoryReadPermissions,
    repositoryNames: [repo],
  });
}

export function createAppOctokit(): Octokit {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID,
      privateKey: getPrivateKey(),
      clientId: process.env.GITHUB_APP_CLIENT_ID,
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
    },
  });
}

export async function syncInstallationRepositories(installationId: bigint) {
  const token = await createInstallationToken(installationId, {
    permissions: { metadata: "read" },
  });

  const octokit = new Octokit({
    auth: token,
  });

  const repositories = await octokit.paginate(
    octokit.rest.apps.listReposAccessibleToInstallation,
    {
      per_page: 100,
    },
  );

  await db.gitHubInstallationRepository.deleteMany({
    where: { installationId },
  });

  if (repositories.length === 0) {
    return 0;
  }

  await db.gitHubInstallationRepository.createMany({
    data: repositories.map((repository) => ({
      installationId,
      owner: repository.owner.login,
      repo: repository.name,
      repoId: BigInt(repository.id),
    })),
    skipDuplicates: true,
  });

  return repositories.length;
}

export function getPublicGitHubToken() {
  return process.env.GITHUB_PUBLIC_TOKEN || undefined;
}

export function isMissingGitHubInstallationError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 404
  );
}
