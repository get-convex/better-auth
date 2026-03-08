import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { tables as baseTables } from "./schema.js";

const userTableWithAdditionalFields = defineTable({
	name: v.string(),
	email: v.string(),
	emailVerified: v.boolean(),
	image: v.optional(v.union(v.null(), v.string())),
	createdAt: v.number(),
	updatedAt: v.number(),
	twoFactorEnabled: v.optional(v.union(v.null(), v.boolean())),
	isAnonymous: v.optional(v.union(v.null(), v.boolean())),
	username: v.optional(v.union(v.null(), v.string())),
	displayUsername: v.optional(v.union(v.null(), v.string())),
	phoneNumber: v.optional(v.union(v.null(), v.string())),
	phoneNumberVerified: v.optional(v.union(v.null(), v.boolean())),
	userId: v.optional(v.union(v.null(), v.string())),
	customField: v.optional(v.union(v.null(), v.string())),
	numericField: v.optional(v.union(v.null(), v.number())),
	testField: v.optional(v.union(v.null(), v.string())),
	cbDefaultValueField: v.optional(v.union(v.null(), v.string())),
	dateField: v.optional(v.union(v.null(), v.number())),
})
	.index("email_name", ["email", "name"])
	.index("name", ["name"])
	.index("userId", ["userId"])
	.index("username", ["username"])
	.index("phoneNumber", ["phoneNumber"])
	.index("customField", ["customField"])
	.index("numericField", ["numericField"])
	.index("dateField", ["dateField"]);

const schema = defineSchema({
	...baseTables,
	user: userTableWithAdditionalFields,
});

export default schema;
