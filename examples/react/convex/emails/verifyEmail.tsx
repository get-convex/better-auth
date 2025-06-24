import { Heading, Link, Text } from "@react-email/components";
import React from "react";
import { BaseEmail, styles } from "./components/BaseEmail";

interface VerifyEmailProps {
  url: string;
  brandName?: string;
  brandTagline?: string;
  brandLogoUrl?: string;
}

export default function VerifyEmail({
  url,
  brandName,
  brandTagline,
  brandLogoUrl,
}: VerifyEmailProps) {
  return (
    <BaseEmail
      previewText="Verify your email address"
      brandName={brandName}
      brandTagline={brandTagline}
      brandLogoUrl={brandLogoUrl}
    >
      <Heading style={styles.h1}>Verify your email</Heading>
      <Link
        href={url}
        target="_blank"
        style={{
          ...styles.link,
          display: "block",
          marginBottom: "16px",
        }}
      >
        Click here to verify your email address
      </Link>
      <Text
        style={{
          ...styles.text,
          color: "#ababab",
          marginTop: "14px",
          marginBottom: "16px",
        }}
      >
        If you didn&apos;t create an account, you can safely ignore this email.
      </Text>
    </BaseEmail>
  );
}
