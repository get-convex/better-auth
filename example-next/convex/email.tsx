import "./polyfills";
import { Resend } from "resend";
import VerifyEmail from "./emails/verifyEmail";
import { render } from "@react-email/components";
import React from "react";

export const sendVerification = async ({ to }: { to: string }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = await render(<VerifyEmail verificationCode="123456" />);
  await resend.emails.send({
    from: "Test <onboarding@boboddy.business>",
    to: [to],
    subject: "hello world",
    html,
  });
};
