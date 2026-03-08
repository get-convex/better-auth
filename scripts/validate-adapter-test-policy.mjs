#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const baseDir = path.resolve("scripts/adapter-policy");
const catalogPath = path.join(baseDir, "upstream-test-catalog.json");
const policyPath = path.join(baseDir, "convex-skip-policy.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fail(errors) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }
  process.exit(1);
}

const errors = [];

if (!fs.existsSync(catalogPath)) {
  errors.push(`Missing catalog file: ${catalogPath}`);
}
if (!fs.existsSync(policyPath)) {
  errors.push(`Missing policy file: ${policyPath}`);
}
if (errors.length) {
  fail(errors);
}

const catalog = readJson(catalogPath);
const policy = readJson(policyPath);

const testsBySuite = catalog.testsBySuite ?? {};
const knownSuites = new Set(Object.keys(testsBySuite));
const knownTests = new Set(Object.values(testsBySuite).flat());

if (knownSuites.size === 0) {
  errors.push("Catalog has no suites (testsBySuite is empty)");
}
if (knownTests.size === 0) {
  errors.push("Catalog has no tests (testsBySuite values are empty)");
}

const allTestsFromCatalog = new Set(catalog.allTests ?? []);
if (catalog.allTests) {
  for (const testName of allTestsFromCatalog) {
    if (!knownTests.has(testName)) {
      errors.push(`catalog.allTests contains unknown test: ${JSON.stringify(testName)}`);
    }
  }
  for (const testName of knownTests) {
    if (!allTestsFromCatalog.has(testName)) {
      errors.push(`catalog.allTests missing known test: ${JSON.stringify(testName)}`);
    }
  }
}

const categories = policy.categories ?? {};
const knownCategories = new Set(Object.keys(categories));
if (knownCategories.size === 0) {
  errors.push("Policy categories is empty");
}

for (const [name, info] of Object.entries(categories)) {
  if (!info || typeof info !== "object") {
    errors.push(`Category ${JSON.stringify(name)} must be an object`);
    continue;
  }
  if (!info.reason || typeof info.reason !== "string") {
    errors.push(`Category ${JSON.stringify(name)} is missing a string reason`);
  }
}

const disabledTests = policy.disabledTests ?? [];
if (!Array.isArray(disabledTests)) {
  errors.push("Policy disabledTests must be an array");
}

const seenDisabledTests = new Set();
for (const entry of disabledTests) {
  if (!entry || typeof entry !== "object") {
    errors.push(`disabledTests entry is not an object: ${JSON.stringify(entry)}`);
    continue;
  }
  const { name, category } = entry;
  if (!name || typeof name !== "string") {
    errors.push(`disabledTests entry missing name: ${JSON.stringify(entry)}`);
    continue;
  }
  if (seenDisabledTests.has(name)) {
    errors.push(`Duplicate disabled test entry: ${JSON.stringify(name)}`);
  }
  seenDisabledTests.add(name);
  if (!knownTests.has(name)) {
    errors.push(`Disabled test is not in upstream catalog: ${JSON.stringify(name)}`);
  }
  if (!category || typeof category !== "string") {
    errors.push(`Disabled test missing category: ${JSON.stringify(name)}`);
  } else if (!knownCategories.has(category)) {
    errors.push(`Disabled test has unknown category ${JSON.stringify(category)} for test ${JSON.stringify(name)}`);
  }
}

function validateSuiteEntries(entries, label) {
  if (!Array.isArray(entries)) {
    errors.push(`${label} must be an array`);
    return;
  }
  const seen = new Set();
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") {
      errors.push(`${label} entry is not an object: ${JSON.stringify(entry)}`);
      continue;
    }
    const { suite, category } = entry;
    if (!suite || typeof suite !== "string") {
      errors.push(`${label} entry missing suite: ${JSON.stringify(entry)}`);
      continue;
    }
    if (seen.has(suite)) {
      errors.push(`Duplicate ${label} suite entry: ${JSON.stringify(suite)}`);
    }
    seen.add(suite);
    if (!knownSuites.has(suite)) {
      errors.push(`${label} suite is not in upstream catalog: ${JSON.stringify(suite)}`);
    }
    if (!category || typeof category !== "string") {
      errors.push(`${label} suite missing category: ${JSON.stringify(suite)}`);
    } else if (!knownCategories.has(category)) {
      errors.push(`${label} suite has unknown category ${JSON.stringify(category)} for suite ${JSON.stringify(suite)}`);
    }
  }
}

validateSuiteEntries(policy.disabledSuites ?? [], "disabledSuites");
validateSuiteEntries(policy.notRunSuites ?? [], "notRunSuites");

if (errors.length) {
  fail(errors);
}

const byCategory = new Map();
for (const { category } of disabledTests) {
  byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
}

console.log("Adapter test policy validation passed.");
console.log(`Known suites: ${knownSuites.size}`);
console.log(`Known tests: ${knownTests.size}`);
console.log(`Disabled tests: ${disabledTests.length}`);
console.log(`Disabled suites: ${(policy.disabledSuites ?? []).length}`);
console.log(`Not-run suites: ${(policy.notRunSuites ?? []).length}`);

if (byCategory.size > 0) {
  console.log("Disabled tests by category:");
  for (const [category, count] of [...byCategory.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0])))) {
    console.log(`- ${category}: ${count}`);
  }
}
