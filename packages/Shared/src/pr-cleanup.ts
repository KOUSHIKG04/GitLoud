export type GithubFileForCleanup = {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string | null;
};

export type CleanedPullRequestFile = {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch: string | null;
    skipped: boolean;
    skipReason: string | null;
};

const GENERATED_OR_LOCK_FILES = [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lockb",
    "dist/",
    "build/",
    ".next/",
    "coverage/",
];

const BINARY_EXTENSIONS = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".svg",
    ".ico",
    ".pdf",
    ".zip",
    ".mp4",
    ".mov",
    ".woff",
    ".woff2",
    ".ttf",
];

const MAX_PATCH_LENGTH = 4000;

function isGeneratedOrLockFile(filename: string) {
    return GENERATED_OR_LOCK_FILES.some((pattern) => filename.includes(pattern));
}

function isBinaryFile(filename: string) {
    return BINARY_EXTENSIONS.some((extension) =>
        filename.toLowerCase().endsWith(extension),
    );
}

export function cleanPullRequestFiles(
    files: GithubFileForCleanup[],
): CleanedPullRequestFile[] {
    return files.map((file) => {
        if (isGeneratedOrLockFile(file.filename)) {
            return {
                ...file,
                patch: null,
                skipped: true,
                skipReason: "Generated or lock file",
            };
        }

        if (isBinaryFile(file.filename)) {
            return {
                ...file,
                patch: null,
                skipped: true,
                skipReason: "Binary or asset file",
            };
        }

        if (!file.patch) {
            return {
                ...file,
                patch: null,
                skipped: true,
                skipReason: "No text patch available",
            };
        }

        return {
            ...file,
            patch:
                file.patch.length > MAX_PATCH_LENGTH
                    ? `${file.patch.slice(0, MAX_PATCH_LENGTH)}\n\n[Patch trimmed]`
                    : file.patch,
            skipped: false,
            skipReason: null,
        };
    });
}