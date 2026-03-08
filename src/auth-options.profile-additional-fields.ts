import type { BetterAuthOptions } from "better-auth/minimal";
import { options } from "./auth-options.js";

// Test-only options used to build a schema/validator profile that supports
// additional-fields coverage in adapter tests.
export const additionalFieldsProfileOptions = {
	...options,
	user: {
		...options.user,
		additionalFields: {
			...options.user?.additionalFields,
			customField: {
				type: "string",
				required: false,
				input: false,
				defaultValue: "default-value",
			},
			numericField: {
				type: "number",
				required: false,
				defaultValue: 0,
			},
			testField: {
				type: "string",
				required: false,
				defaultValue: "test-value",
			},
			cbDefaultValueField: {
				type: "string",
				required: false,
				defaultValue: () => "advanced-test-value",
			},
			dateField: {
				type: "date",
				required: false,
			},
		},
	},
} as BetterAuthOptions;
