import "./polyfills";
import { Resend } from "resend";
import VerifyEmail from "./emails/verifyEmail";
import MagicLinkEmail from "./emails/magicLink";
import VerifyOTP from "./emails/verifyOTP";
import { render } from "@react-email/components";
import React from "react";

type SendVerificationOptions = {
  to: string;
  type?: "verification" | "magic-link" | "otp";
  verificationCode?: string;
  url?: string;
  brandName?: string;
  brandTagline?: string;
  brandLogoUrl?: string;
};

const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Test <onboarding@boboddy.business>",
    to: [to],
    subject,
    html,
  });
};

export const sendVerification = async ({
  to,
  type = "verification",
  verificationCode,
  url,
  brandName,
  brandTagline,
  brandLogoUrl,
}: SendVerificationOptions) => {
  let subject: string;
  let html: string;

  switch (type) {
    case "magic-link":
      subject = "Sign in to your account";
      html = await render(
        <MagicLinkEmail
          url={url!}
          brandName={brandName}
          brandTagline={brandTagline}
          brandLogoUrl={brandLogoUrl}
        />,
      );
      break;
    case "otp":
      subject = "Verify your email address";
      html = await render(
        <VerifyOTP
          code={verificationCode!}
          brandName={brandName}
          brandTagline={brandTagline}
          brandLogoUrl={brandLogoUrl}
        />,
      );
      break;
    default:
      subject = "Verify your email address";
      html = await render(
        <VerifyEmail
          url={url!}
          brandName={brandName}
          brandTagline={brandTagline}
          brandLogoUrl={brandLogoUrl}
        />,
      );
  }

  await sendEmail({ to, subject, html });
};
