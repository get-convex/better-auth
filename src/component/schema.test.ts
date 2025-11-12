import { describe, it, expect } from "vitest";
import { tables } from "./schema";

describe("Schema Validation", () => {
  it("should not have duplicate table names (case-insensitive)", () => {
    const tableNames = Object.keys(tables);
    const lowerCaseNames = tableNames.map((name) => name.toLowerCase());
    const uniqueLowerCaseNames = new Set(lowerCaseNames);

    const duplicates: string[] = [];
    lowerCaseNames.forEach((lowerName, index) => {
      const firstIndex = lowerCaseNames.indexOf(lowerName);
      if (firstIndex !== index && !duplicates.includes(lowerName)) {
        duplicates.push(lowerName);
      }
    });

    if (duplicates.length > 0) {
      const duplicateDetails = duplicates.map((dup) => {
        const originalNames = tableNames.filter(
          (name) => name.toLowerCase() === dup
        );
        return `"${originalNames.join('" and "')}"`;
      });

      expect.fail(
        `Found duplicate table names (case-insensitive): ${duplicateDetails.join(", ")}.\n` +
          `Convex tables are case-sensitive, but having similar names can cause confusion.\n` +
          `This likely indicates a bug in the schema generation process.`
      );
    }

    expect(lowerCaseNames.length).toBe(uniqueLowerCaseNames.size);
  });

  it("should warn about potential naming conflicts", () => {
    const tableNames = Object.keys(tables);
    const warnings: string[] = [];

    // Check for very similar names (e.g., rateLimit vs ratelimit)
    for (let i = 0; i < tableNames.length; i++) {
      for (let j = i + 1; j < tableNames.length; j++) {
        const name1 = tableNames[i];
        const name2 = tableNames[j];
        
        // Check if names differ only in case
        if (name1.toLowerCase() === name2.toLowerCase()) {
          warnings.push(
            `Table names "${name1}" and "${name2}" differ only in casing`
          );
        }
      }
    }

    // If there are warnings, the test should fail
    if (warnings.length > 0) {
      expect.fail(
        `Schema naming conflicts detected:\n` +
          warnings.map((w) => `  - ${w}`).join("\n") +
          `\n\nPlease ensure table names are distinct even when case is ignored.`
      );
    }

    expect(warnings.length).toBe(0);
  });
});
