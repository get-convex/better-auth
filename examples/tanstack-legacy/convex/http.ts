import { httpRouter } from 'convex/server'
import { betterAuthComponent } from './auth'
import { createAuth } from '../app/lib/auth'

const http = httpRouter()

betterAuthComponent.registerRoutes(http, createAuth)

export default http
