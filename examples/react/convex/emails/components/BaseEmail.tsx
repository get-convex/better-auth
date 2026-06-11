import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Text,
  Img,
  Preview,
} from "@react-email/components";
import React from "react";

export interface BaseEmailProps {
  children: React.ReactNode;
  previewText: string;
  footerLinks?: Array<{ text: string; href: string }>;
  footerText?: string;
  brandName?: string;
  brandTagline?: string;
  brandLogoUrl?: string;
}

export const styles = {
  main: {
    backgroundColor: "#ffffff",
  },
  container: {
    paddingLeft: "12px",
    paddingRight: "12px",
    margin: "0 auto",
  },
  h1: {
    color: "#333",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "40px 0",
    padding: "0",
  },
  link: {
    color: "#2754C5",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
    textDecoration: "underline",
  },
  text: {
    color: "#333",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
    margin: "24px 0",
  },
  footer: {
    color: "#898989",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "12px",
    lineHeight: "22px",
    marginTop: "12px",
    marginBottom: "24px",
  },
  code: {
    display: "inline-block",
    padding: "16px 4.5%",
    width: "90.5%",
    backgroundColor: "#f4f4f4",
    borderRadius: "5px",
    border: "1px solid #eee",
    color: "#333",
  },
};

export function BaseEmail({
  children,
  previewText,
  footerLinks = [],
  footerText,
  brandName = "Better Auth",
  brandTagline = "Simple, secure authentication for your applications",
  brandLogoUrl,
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.main}>
        <Preview>{previewText}</Preview>
        <Container style={styles.container}>
          {children}

          {brandLogoUrl && (
            <Img
              src={brandLogoUrl}
              width="32"
              height="32"
              alt={`${brandName} Logo`}
            />
          )}

          <Text style={styles.footer}>
            {footerLinks.map((link, i) => (
              <React.Fragment key={link.href}>
                <Link
                  href={link.href}
                  target="_blank"
                  style={{ ...styles.link, color: "#898989" }}
                >
                  {link.text}
                </Link>
                {i < footerLinks.length - 1 && " • "}
              </React.Fragment>
            ))}
            {footerLinks.length > 0 && <br />}
            {footerText || (
              <>
                {brandName}, {brandTagline.toLowerCase()}
              </>
            )}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
