/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createServerRootRoute } from '@tanstack/react-start/server'

import { Route as rootRouteImport } from './routes/__root'
import { Route as SignUpRouteImport } from './routes/sign-up'
import { Route as SignInRouteImport } from './routes/sign-in'
import { Route as ResetPasswordRouteImport } from './routes/reset-password'
import { Route as AuthedRouteImport } from './routes/_authed'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AuthedServerRouteImport } from './routes/_authed/server'
import { Route as AuthedClientOnlyRouteImport } from './routes/_authed/client-only'
import { Route as AuthedClientOnlyIndexRouteImport } from './routes/_authed/client-only.index'
import { ServerRoute as ApiAuthSplatServerRouteImport } from './routes/api/auth/$'

const rootServerRouteImport = createServerRootRoute()

const SignUpRoute = SignUpRouteImport.update({
  id: '/sign-up',
  path: '/sign-up',
  getParentRoute: () => rootRouteImport,
} as any)
const SignInRoute = SignInRouteImport.update({
  id: '/sign-in',
  path: '/sign-in',
  getParentRoute: () => rootRouteImport,
} as any)
const ResetPasswordRoute = ResetPasswordRouteImport.update({
  id: '/reset-password',
  path: '/reset-password',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthedRoute = AuthedRouteImport.update({
  id: '/_authed',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthedServerRoute = AuthedServerRouteImport.update({
  id: '/server',
  path: '/server',
  getParentRoute: () => AuthedRoute,
} as any)
const AuthedClientOnlyRoute = AuthedClientOnlyRouteImport.update({
  id: '/client-only',
  path: '/client-only',
  getParentRoute: () => AuthedRoute,
} as any)
const AuthedClientOnlyIndexRoute = AuthedClientOnlyIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AuthedClientOnlyRoute,
} as any)
const ApiAuthSplatServerRoute = ApiAuthSplatServerRouteImport.update({
  id: '/api/auth/$',
  path: '/api/auth/$',
  getParentRoute: () => rootServerRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/reset-password': typeof ResetPasswordRoute
  '/sign-in': typeof SignInRoute
  '/sign-up': typeof SignUpRoute
  '/client-only': typeof AuthedClientOnlyRouteWithChildren
  '/server': typeof AuthedServerRoute
  '/client-only/': typeof AuthedClientOnlyIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/reset-password': typeof ResetPasswordRoute
  '/sign-in': typeof SignInRoute
  '/sign-up': typeof SignUpRoute
  '/server': typeof AuthedServerRoute
  '/client-only': typeof AuthedClientOnlyIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/_authed': typeof AuthedRouteWithChildren
  '/reset-password': typeof ResetPasswordRoute
  '/sign-in': typeof SignInRoute
  '/sign-up': typeof SignUpRoute
  '/_authed/client-only': typeof AuthedClientOnlyRouteWithChildren
  '/_authed/server': typeof AuthedServerRoute
  '/_authed/client-only/': typeof AuthedClientOnlyIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/reset-password'
    | '/sign-in'
    | '/sign-up'
    | '/client-only'
    | '/server'
    | '/client-only/'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/reset-password'
    | '/sign-in'
    | '/sign-up'
    | '/server'
    | '/client-only'
  id:
    | '__root__'
    | '/'
    | '/_authed'
    | '/reset-password'
    | '/sign-in'
    | '/sign-up'
    | '/_authed/client-only'
    | '/_authed/server'
    | '/_authed/client-only/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthedRoute: typeof AuthedRouteWithChildren
  ResetPasswordRoute: typeof ResetPasswordRoute
  SignInRoute: typeof SignInRoute
  SignUpRoute: typeof SignUpRoute
}
export interface FileServerRoutesByFullPath {
  '/api/auth/$': typeof ApiAuthSplatServerRoute
}
export interface FileServerRoutesByTo {
  '/api/auth/$': typeof ApiAuthSplatServerRoute
}
export interface FileServerRoutesById {
  __root__: typeof rootServerRouteImport
  '/api/auth/$': typeof ApiAuthSplatServerRoute
}
export interface FileServerRouteTypes {
  fileServerRoutesByFullPath: FileServerRoutesByFullPath
  fullPaths: '/api/auth/$'
  fileServerRoutesByTo: FileServerRoutesByTo
  to: '/api/auth/$'
  id: '__root__' | '/api/auth/$'
  fileServerRoutesById: FileServerRoutesById
}
export interface RootServerRouteChildren {
  ApiAuthSplatServerRoute: typeof ApiAuthSplatServerRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/sign-up': {
      id: '/sign-up'
      path: '/sign-up'
      fullPath: '/sign-up'
      preLoaderRoute: typeof SignUpRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/sign-in': {
      id: '/sign-in'
      path: '/sign-in'
      fullPath: '/sign-in'
      preLoaderRoute: typeof SignInRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/reset-password': {
      id: '/reset-password'
      path: '/reset-password'
      fullPath: '/reset-password'
      preLoaderRoute: typeof ResetPasswordRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_authed': {
      id: '/_authed'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthedRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_authed/server': {
      id: '/_authed/server'
      path: '/server'
      fullPath: '/server'
      preLoaderRoute: typeof AuthedServerRouteImport
      parentRoute: typeof AuthedRoute
    }
    '/_authed/client-only': {
      id: '/_authed/client-only'
      path: '/client-only'
      fullPath: '/client-only'
      preLoaderRoute: typeof AuthedClientOnlyRouteImport
      parentRoute: typeof AuthedRoute
    }
    '/_authed/client-only/': {
      id: '/_authed/client-only/'
      path: '/'
      fullPath: '/client-only/'
      preLoaderRoute: typeof AuthedClientOnlyIndexRouteImport
      parentRoute: typeof AuthedClientOnlyRoute
    }
  }
}
declare module '@tanstack/react-start/server' {
  interface ServerFileRoutesByPath {
    '/api/auth/$': {
      id: '/api/auth/$'
      path: '/api/auth/$'
      fullPath: '/api/auth/$'
      preLoaderRoute: typeof ApiAuthSplatServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
  }
}

interface AuthedClientOnlyRouteChildren {
  AuthedClientOnlyIndexRoute: typeof AuthedClientOnlyIndexRoute
}

const AuthedClientOnlyRouteChildren: AuthedClientOnlyRouteChildren = {
  AuthedClientOnlyIndexRoute: AuthedClientOnlyIndexRoute,
}

const AuthedClientOnlyRouteWithChildren =
  AuthedClientOnlyRoute._addFileChildren(AuthedClientOnlyRouteChildren)

interface AuthedRouteChildren {
  AuthedClientOnlyRoute: typeof AuthedClientOnlyRouteWithChildren
  AuthedServerRoute: typeof AuthedServerRoute
}

const AuthedRouteChildren: AuthedRouteChildren = {
  AuthedClientOnlyRoute: AuthedClientOnlyRouteWithChildren,
  AuthedServerRoute: AuthedServerRoute,
}

const AuthedRouteWithChildren =
  AuthedRoute._addFileChildren(AuthedRouteChildren)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthedRoute: AuthedRouteWithChildren,
  ResetPasswordRoute: ResetPasswordRoute,
  SignInRoute: SignInRoute,
  SignUpRoute: SignUpRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
const rootServerRouteChildren: RootServerRouteChildren = {
  ApiAuthSplatServerRoute: ApiAuthSplatServerRoute,
}
export const serverRouteTree = rootServerRouteImport
  ._addFileChildren(rootServerRouteChildren)
  ._addFileTypes<FileServerRouteTypes>()
