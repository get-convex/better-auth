import { defineApp } from 'convex/server'
import betterAuth from './betterAuth/convex.config'
import resend from '@convex-dev/resend/convex.config'
import migrations from '@convex-dev/migrations/convex.config'

const app = defineApp()
app.use(betterAuth)
app.use(resend)
app.use(migrations)

export default app
