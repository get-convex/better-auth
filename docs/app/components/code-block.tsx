"use client";

import { Check, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { PrismTheme } from "prism-react-renderer";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface CodeBlockProps {
  language: string;
  code: string;
  className?: string;
  filename?: string;
}

// Custom theme optimized for dark backgrounds
const darkTheme = {
  plain: {
    color: "#e6e6e6",
    backgroundColor: "transparent",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "#999988",
        fontStyle: "italic" as const,
      },
    },
    {
      types: ["namespace"],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ["string", "attr-value"],
      style: {
        color: "#8dc891",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "#d1d1d1",
      },
    },
    {
      types: [
        "entity",
        "url",
        "symbol",
        "number",
        "boolean",
        "variable",
        "constant",
        "property",
        "regex",
        "inserted",
      ],
      style: {
        color: "#79b6f2",
      },
    },
    {
      types: ["atrule", "keyword", "attr-name", "selector"],
      style: {
        color: "#cc99cd",
      },
    },
    {
      types: ["function", "deleted", "tag"],
      style: {
        color: "#f08d49",
      },
    },
    {
      types: ["function-variable"],
      style: {
        color: "#6196cc",
      },
    },
    {
      types: ["tag", "selector", "keyword"],
      style: {
        color: "#ff8383",
      },
    },
  ],
} satisfies PrismTheme;

export function CodeBlock({
  language,
  code,
  className,
  filename,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { theme: currentTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Always use dark theme for code blocks
  const getTheme = () => {
    if (!mounted) return darkTheme; // Default for SSR
    return darkTheme;
  };

  // Map language string to prism language
  const getLanguage = (lang: string) => {
    const languageMap: Record<string, string> = {
      typescript: "tsx",
      javascript: "jsx",
      bash: "bash",
      sh: "bash",
      json: "json",
    };
    return languageMap[lang.toLowerCase()] || lang;
  };

  return (
    <div
      className={cn("relative my-4 rounded-lg border bg-zinc-950", className)}
    >
      <div className="flex items-center justify-between px-4 py-2 text-sm border-b border-zinc-800">
        {filename && (
          <span className="font-medium text-sm text-foreground/90">
            {filename}
          </span>
        )}
        {!filename && (
          <span className="font-medium text-sm text-muted-foreground">
            {language}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Highlight
          theme={getTheme()}
          code={code}
          language={getLanguage(language)}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={cn("text-sm p-4", className)}
              style={{
                ...style,
                backgroundColor: "transparent", // Remove white background
                margin: 0,
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
