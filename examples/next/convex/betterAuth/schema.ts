import { defineSchema } from "convex/server";
import { tables } from "./generatedSchema";

// Don't add custom fields or change types to the generated schema
// here, use Better Auth's schema config for that:
// https://www.better-auth.com/docs/concepts/database#extending-core-schema
//
// Or, for tables that aren't supported for schema extension, you can track
// Better Auth tables with your own app tables using triggers:
// https://convex-better-auth.netlify.app/triggers
const schema = defineSchema({
  ...tables,
  // Spread the generated schema and add a custom index
  user: tables.user.index("custom_index", ["foo"]),
});

export default schema;
