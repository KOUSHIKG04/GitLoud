import { z } from "zod";

export const githubPullRequestUrlSchema = z
    .url({ error: "Enter a valid URL" }).trim()
    .refine((value) => {
        try {
            const url = new URL(value);
            const parts = url.pathname.split("/").filter(Boolean);

            return (
                url.hostname === "github.com" &&
                parts.length === 4 &&
                parts[2] === "pull" &&
                Number.isInteger(Number(parts[3]))
            );
        } catch {
            return false;
        }
    }, { error: "Enter a valid GitHub pull request URL" });


export function parseGithubPullRequestUrl(value: string) {

    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);

    const [owner, repo, type, number] = parts;

    if (
        url.hostname !== "github.com" ||
        type !== "pull" ||
        !owner ||
        !repo ||
        !number
    ) {
        throw new Error("Invalid GitHub pull request URL");
    }

    return {
        owner,
        repo,
        number: Number(number),
    };
}


export function parseGithubCommitUrl(value: string) {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);

    const [owner, repo, type, sha] = parts;

    if (
        url.hostname !== "github.com" ||
        type !== "commit" ||
        !owner ||
        !repo ||
        !sha
    ) {
        throw new Error("Invalid GitHub commit URL");
    }

    return {
        owner,
        repo,
        sha,
    };
}


export function getGithubUrlType(value: string) {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);

    if (url.hostname !== "github.com") {
        return "unknown";
    }

    if (parts[2] === "pull") {
        return "pull-request";
    }

    if (parts[2] === "commit") {
        return "commit";
    }

    return "unknown";
}