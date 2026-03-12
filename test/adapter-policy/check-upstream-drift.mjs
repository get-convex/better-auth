#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const UPSTREAM_OWNER = "better-auth";
const UPSTREAM_REPO = "better-auth";
const ADAPTER_FACTORY_PATH = "e2e/adapter/test/adapter-factory";
const TRACKED_FILES = [
  "basic.ts",
  "auth-flow.ts",
  "joins.ts",
  "number-id.ts",
  "uuid.ts",
  "transactions.ts",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const catalogPath = path.join(__dirname, "upstream-test-catalog.json");

function parseArgs(argv) {
  const args = new Set(argv);
  const outputIndex = argv.indexOf("--output");
  const outputPath = outputIndex >= 0 ? argv[outputIndex + 1] : undefined;
  const failOnDrift = args.has("--fail-on-drift");
  return { outputPath, failOnDrift };
}

function shortSha(sha) {
  return typeof sha === "string" ? sha.slice(0, 12) : "unknown";
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "convex-better-auth-adapter-drift-check",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GET ${url} failed (${response.status}): ${body}`);
  }
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, { headers: githubHeaders() });
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    text,
  };
}

function fileRawUrl(commit, file) {
  return `https://raw.githubusercontent.com/${UPSTREAM_OWNER}/${UPSTREAM_REPO}/${commit}/${ADAPTER_FACTORY_PATH}/${file}`;
}

function buildMarkdownSummary(result) {
  if (result.status !== "ok") {
    return [
      "## Adapter Drift Monitor",
      "",
      `Status: error`,
      "",
      "The drift monitor failed before comparison completed.",
      "",
      "```",
      result.errorMessage ?? "Unknown error",
      "```",
    ].join("\n");
  }

  const lines = [
    "## Adapter Drift Monitor",
    "",
    `Pinned commit: \`${shortSha(result.pinnedCommit)}\``,
    `Latest main: \`${shortSha(result.latestCommit)}\``,
    "",
    `Drift detected: **${result.driftDetected ? "yes" : "no"}**`,
    "",
    "| File | Pinned | Latest main | Drift |",
    "| --- | --- | --- | --- |",
  ];

  for (const entry of result.fileComparisons) {
    const pinned =
      entry.pinned.ok && entry.pinned.hash
        ? `\`${entry.pinned.hash.slice(0, 12)}\``
        : `error (${entry.pinned.status})`;
    const latest =
      entry.latest.ok && entry.latest.hash
        ? `\`${entry.latest.hash.slice(0, 12)}\``
        : `error (${entry.latest.status})`;
    lines.push(
      `| \`${entry.file}\` | ${pinned} | ${latest} | ${
        entry.changed ? "yes" : "no"
      } |`,
    );
  }

  if (result.changedFiles.length > 0) {
    lines.push("");
    lines.push("Changed files:");
    for (const file of result.changedFiles) {
      lines.push(`- \`${file}\``);
    }
  }

  return lines.join("\n");
}

async function main() {
  const { outputPath, failOnDrift } = parseArgs(process.argv.slice(2));

  let result;
  try {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
    const pinnedCommit = catalog?.source?.commit;
    if (!pinnedCommit || typeof pinnedCommit !== "string") {
      throw new Error(
        `Missing source.commit in ${path.relative(process.cwd(), catalogPath)}`,
      );
    }

    const commitInfo = await fetchJson(
      `https://api.github.com/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}/commits/main`,
    );
    const latestCommit = commitInfo?.sha;
    if (!latestCommit || typeof latestCommit !== "string") {
      throw new Error("Unable to resolve latest commit SHA for upstream main");
    }

    const fileComparisons = [];
    for (const file of TRACKED_FILES) {
      const pinnedUrl = fileRawUrl(pinnedCommit, file);
      const latestUrl = fileRawUrl(latestCommit, file);
      const [pinnedRaw, latestRaw] = await Promise.all([
        fetchText(pinnedUrl),
        fetchText(latestUrl),
      ]);

      const pinned = {
        ok: pinnedRaw.ok,
        status: pinnedRaw.status,
        hash: pinnedRaw.ok ? sha256(pinnedRaw.text) : null,
      };
      const latest = {
        ok: latestRaw.ok,
        status: latestRaw.status,
        hash: latestRaw.ok ? sha256(latestRaw.text) : null,
      };

      const changed =
        !pinned.ok ||
        !latest.ok ||
        (pinned.hash !== null &&
          latest.hash !== null &&
          pinned.hash !== latest.hash);

      fileComparisons.push({
        file,
        pinnedUrl,
        latestUrl,
        pinned,
        latest,
        changed,
      });
    }

    const changedFiles = fileComparisons
      .filter((entry) => entry.changed)
      .map((entry) => entry.file);

    result = {
      status: "ok",
      checkedAt: new Date().toISOString(),
      upstream: {
        owner: UPSTREAM_OWNER,
        repo: UPSTREAM_REPO,
        path: ADAPTER_FACTORY_PATH,
      },
      trackedFiles: TRACKED_FILES,
      pinnedCommit,
      latestCommit,
      driftDetected: changedFiles.length > 0,
      changedFiles,
      fileComparisons,
    };
  } catch (error) {
    result = {
      status: "error",
      checkedAt: new Date().toISOString(),
      driftDetected: false,
      changedFiles: [],
      fileComparisons: [],
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  result.markdownSummary = buildMarkdownSummary(result);

  if (outputPath) {
    const absoluteOutputPath = path.resolve(process.cwd(), outputPath);
    fs.writeFileSync(absoluteOutputPath, JSON.stringify(result, null, 2));
  }

  console.log(result.markdownSummary);

  if (result.status === "ok" && failOnDrift && result.driftDetected) {
    process.exit(1);
  }
}

await main();
