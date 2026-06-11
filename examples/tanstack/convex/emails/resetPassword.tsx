import { Heading, Link, Text } from "@react-email/components";
import { BaseEmail, styles } from "./components/BaseEmail";
import React from "react";

interface ResetPasswordEmailProps {
  url: string;
  brandName?: string;
  brandTagline?: string;
  brandLogoUrl?: string;
}

export default function ResetPasswordEmail({
  url,
  brandName,
  brandTagline,
  brandLogoUrl,
}: ResetPasswordEmailProps) {
  return (
    <BaseEmail
      previewText="Reset your password"
      brandName={brandName}
      brandTagline={brandTagline}
      brandLogoUrl={brandLogoUrl}
    >
      <Heading style={styles.h1}>Reset Your Password</Heading>
      <Link
        href={url}
        target="_blank"
        style={{
          ...styles.link,
          display: "block",
          marginBottom: "16px",
        }}
      >
        Click here to reset your password
      </Link>
      <Text
        style={{
          ...styles.text,
          color: "#ababab",
          marginTop: "14px",
          marginBottom: "16px",
        }}
      >
        If you didn&apos;t request a password reset, you can safely ignore this
        email.
      </Text>
    </BaseEmail>
  );
}
