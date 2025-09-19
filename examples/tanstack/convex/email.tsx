import { Resend } from '@convex-dev/resend'
import VerifyEmail from './emails/verifyEmail'
import MagicLinkEmail from './emails/magicLink'
import VerifyOTP from './emails/verifyOTP'
import { render } from '@react-email/components'
import React from 'react'
import ResetPasswordEmail from './emails/resetPassword'
import { components } from './_generated/api'
import { ActionCtx } from './_generated/server'

const resend: Resend = new Resend(components.resend, {
  testMode: false,
})

const sendEmail = async (
  ctx: ActionCtx,
  {
    to,
    subject,
    html,
  }: {
    to: string
    subject: string
    html: string
  },
) => {
  await resend.sendEmail(ctx, {
    from: 'Test <onboarding@boboddy.business>',
    to,
    subject,
    html,
  })
}

export const sendEmailVerification = async (
  ctx: ActionCtx,
  {
    to,
    url,
  }: {
    to: string
    url: string
  },
) => {
  await sendEmail(ctx, {
    to,
    subject: 'Verify your email address',
    html: await render(<VerifyEmail url={url} />),
  })
}

export const sendOTPVerification = async (
  ctx: ActionCtx,
  {
    to,
    code,
  }: {
    to: string
    code: string
  },
) => {
  await sendEmail(ctx, {
    to,
    subject: 'Verify your email address',
    html: await render(<VerifyOTP code={code} />),
  })
}

export const sendMagicLink = async (
  ctx: ActionCtx,
  {
    to,
    url,
  }: {
    to: string
    url: string
  },
) => {
  await sendEmail(ctx, {
    to,
    subject: 'Sign in to your account',
    html: await render(<MagicLinkEmail url={url} />),
  })
}

export const sendResetPassword = async (
  ctx: ActionCtx,
  {
    to,
    url,
  }: {
    to: string
    url: string
  },
) => {
  await sendEmail(ctx, {
    to,
    subject: 'Reset your password',
    html: await render(<ResetPasswordEmail url={url} />),
  })
}
