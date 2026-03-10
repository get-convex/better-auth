import type { BetterAuthOptions } from "better-auth/minimal";
import { organization } from "better-auth/plugins/organization";
import { options } from "../../auth-options.js";

const renamedOneToOnePlugin = {
  id: "one-to-one-test",
  schema: {
    oneToOneTable: {
      modelName: "one_to_one_table",
      fields: {
        oneToOne: {
          type: "string",
          required: true,
          references: { field: "email", model: "user" },
          unique: true,
          fieldName: "one_to_one",
        },
      },
    },
  },
};

export const renameFieldProfileOptions = {
  ...options,
  user: {
    ...options.user,
    fields: {
      ...options.user?.fields,
      email: "email_address",
    },
  },
  plugins: [...(options.plugins ?? []), renamedOneToOnePlugin],
} as BetterAuthOptions;

export const renameModelUserCustomProfileOptions = {
  ...options,
  user: {
    ...options.user,
    modelName: "user_custom",
  },
} as BetterAuthOptions;

export const renameModelUserTableProfileOptions = {
  ...options,
  user: {
    ...options.user,
    modelName: "user_table",
  },
} as BetterAuthOptions;

export const organizationJoinsProfileOptions = {
  ...options,
  plugins: [...(options.plugins ?? []), organization({ teams: { enabled: true } })],
} as BetterAuthOptions;
