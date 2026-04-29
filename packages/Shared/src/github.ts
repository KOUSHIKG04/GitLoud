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
                /^\d+$/.test(Number(parts[3]).toString())
            );
        } catch {
            return false;
        }
    }, { error: "Enter a valid GitHub pull request URL" });


export function parseGithubPullRequestUrl(value: string) {

    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length !== 4) {
        throw new Error("Invalid GitHub pull request URL");
    }

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

    if (parts.length !== 4) {
        throw new Error("Invalid GitHub commit URL");
    }

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
    try {
        const url = new URL(value);
        const parts = url.pathname.split("/").filter(Boolean);

        if (url.hostname !== "github.com" || parts.length !== 4) {
            return "unknown";
        }

        if (parts[2] === "pull") {
            return "pull-request";
        }

        if (parts[2] === "commit") {
            return "commit";
        }

        return "unknown";
    } catch {
        return "unknown";
    }
}


export const githubPrOrCommitUrlSchema = z
    .url({ error: "Enter a valid GitHub URL" }).trim()
    .refine((value) => {
        try {
            const url = new URL(value);
            const parts = url.pathname.split("/").filter(Boolean);

            if (url.hostname !== "github.com") {
                return false;
            }

            const isPullRequest =
                parts.length === 4 &&
                parts[2] === "pull" &&
                Number.isInteger(Number(parts[3]));

            const isCommit =
                parts.length === 4 &&
                parts[2] === "commit" &&
                /^[a-f0-9]{7,40}$/i.test(parts[3] ?? "");

            return isPullRequest || isCommit;
        } catch {
            return false;
        }
    }, { error: "Enter a valid GitHub pull request or commit URL" });