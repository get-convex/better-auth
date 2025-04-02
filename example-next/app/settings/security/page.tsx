"use client";

import EnableTwoFactor from "@/app/components/EnableTwoFactor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { authClient } from "@/app/auth-client";

export default function SecuritySettingsPage() {
  const [showEnable2FA, setShowEnable2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      await authClient.twoFactor.disable({
        password: "", // This will be handled by the backend
      });
      window.location.reload();
    } catch {
      alert("Failed to disable 2FA. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Security Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account security settings
          </p>
        </div>

        {showEnable2FA ? (
          <EnableTwoFactor />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account by requiring a
                verification code in addition to your password.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button onClick={() => setShowEnable2FA(true)} disabled={loading}>
                Enable 2FA
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisable2FA}
                disabled={loading}
              >
                Disable 2FA
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
