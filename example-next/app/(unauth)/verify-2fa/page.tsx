"use client";

import TwoFactorVerification from "@/app/(unauth)/verify-2fa/TwoFactorVerification";

export default function VerifyTwoFactorPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <TwoFactorVerification />
    </div>
  );
}
