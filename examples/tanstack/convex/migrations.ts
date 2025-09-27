import { Migrations } from '@convex-dev/migrations'
import { components, internal } from './_generated/api'
import { DataModel } from './_generated/dataModel'
import { authComponent } from './auth'

export const migrations = new Migrations<DataModel>(components.migrations)

// Define migration functions
export const migrationAddAuthId = migrations.define({
  table: 'users',
  migrateOne: async (ctx, user) => {
    // For each user in the app users table, get the related Better Auth user id
    // and set it to the `authId` field
    if (user.authId === undefined) {
      const authUser = await authComponent.migrationGetUser(ctx, user._id)
      if (!authUser) {
        throw new Error(`Auth user not found for id ${user._id}`)
      }
      await ctx.db.patch(user._id, { authId: authUser._id })
    }
  },
})

export const migrationRemoveUserId = migrations.define({
  table: 'users',
  migrateOne: async (ctx, user) => {
    // For each user in the app users table, remove the `userId` value from the
    // related Better Auth user
    await authComponent.migrationRemoveUserId(ctx, user._id)
  },
})

// Export runnable migration functions
export const addAuthId = migrations.runner(
  internal.migrations.migrationAddAuthId,
)

export const removeUserId = migrations.runner(
  internal.migrations.migrationRemoveUserId,
)
