"use client";

import { createRandomStringGenerator } from "@better-auth/utils/random";
import { useState } from "react";
import { Button } from "./ui/button";
import { CodeBlock } from "@/components/code-block";
export const GenerateSecret = () => {
  const [generated, setGenerated] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const generateRandomString = createRandomStringGenerator("a-z", "0-9", "A-Z");

  return (
    <div className="mb-6">
      <CodeBlock
        className="mb-4"
        language="shell"
        code={`npx convex env set BETTER_AUTH_SECRET=${secret ?? "$(openssl rand -base64 32)"}`}
      />

      <Button
        variant="outline"
        size="sm"
        disabled={generated}
        onClick={() => {
          setSecret(generateRandomString(32));
          setGenerated(true);
          setTimeout(() => {
            setSecret(null);
            setGenerated(false);
          }, 5000);
        }}
      >
        {generated ? "Generated" : "Generate Secret"}
      </Button>
    </div>
  );
};
