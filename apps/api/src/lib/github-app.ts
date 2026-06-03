import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { db } from "@repo/db/client";

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

export async function createInstallationToken(installationId: bigint) {
  const auth = getAppAuth();

  const installationAuth = await auth({
    type: "installation",
    installationId: Number(installationId),
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
    return process.env.GITHUB_TOKEN;
  }

  return createInstallationToken(installation.installationId);
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
  const token = await createInstallationToken(installationId);

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
