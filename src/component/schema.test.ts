import { describe, expect, it } from "vitest";
import schema from "./schema.js";

describe("staged component schema", () => {
  it("keeps only the generated account identity index order", () => {
    const indexNames = schema.tables.account[" indexes"]().map(
      (index) => index.indexDescriptor
    );

    expect(indexNames).toContain("issuer_accountId");
    expect(indexNames).not.toContain("accountId_issuer");
  });
});
