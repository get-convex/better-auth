"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import { authClient } from "@/app/auth-client";
import QRCode from "react-qr-code";

type SetupStep = "password" | "qr" | "verify" | "backup";

export default function EnableTwoFactor() {
  const [step, setStep] = useState<SetupStep>("password");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [totpUri, setTotpUri] = useState<string>();
  const [backupCodes, setBackupCodes] = useState<string[]>();
  const [copiedIndex, setCopiedIndex] = useState<number>();

  const handlePasswordSubmit = async () => {
    try {
      setLoading(true);
      const { data } = await authClient.twoFactor.enable({
        password,
      });
      if (data?.totpURI) {
        setTotpUri(data.totpURI);
        if (data.backupCodes) {
          setBackupCodes(data.backupCodes);
        }
        setStep("qr");
      }
    } catch {
      alert("Failed to enable 2FA. Please check your password and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      await authClient.twoFactor.verifyTotp({
        code,
      });
      setStep("backup");
    } catch {
      alert("Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCode = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(undefined), 2000);
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          Enable Two-Factor Authentication
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {step === "password"
            ? "Enter your password to begin setup"
            : step === "qr"
              ? "Scan this QR code with your authenticator app"
              : step === "verify"
                ? "Enter the code from your authenticator app"
                : "Save these backup codes in a secure place"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "password" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordSubmit();
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        )}

        {step === "qr" && totpUri && (
          <div className="grid gap-4">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCode value={totpUri} />
            </div>
            <Button onClick={() => setStep("verify")}>Continue</Button>
          </div>
        )}

        {step === "verify" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyCode();
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={6}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        )}

        {step === "backup" && backupCodes && (
          <div className="grid gap-4">
            <div className="grid gap-2 p-4 bg-muted rounded-lg">
              {backupCodes.map((code, i) => (
                <div
                  key={code}
                  className="flex items-center justify-between p-2 bg-background rounded"
                >
                  <code className="text-sm">{code}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyBackupCode(code, i)}
                  >
                    {copiedIndex === i ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={() => window.location.reload()}>Done</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
