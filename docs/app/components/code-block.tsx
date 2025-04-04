"use client";

import { Check, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { Highlight, PrismTheme, themes } from "prism-react-renderer";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  language: string;
  code: string;
  className?: string;
  filename?: string;
  highlightedLines?: number[];
}

// Custom theme inspired by Dracula with our brand colors
const darkTheme = {
  plain: {
    color: "#e4e4e7", // Slightly dimmer base text color
    backgroundColor: "transparent",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "#6272a4",
        fontStyle: "italic" as const,
      },
    },
    {
      types: ["operator", "punctuation", "delimiter", "char"],
      style: {
        color: "#64748b", // Muted for structural elements
      },
    },
    {
      types: ["string", "attr-value", "template-punctuation"],
      style: {
        color: "#e6a91c", // Slightly muted orange/yellow for strings
      },
    },
    {
      types: ["number", "boolean", "inserted"],
      style: {
        color: "#bd93f9", // Purple for literals
      },
    },
    {
      types: ["variable", "parameter"],
      style: {
        color: "#e4e4e7", // Base color for variables
      },
    },
    {
      types: ["property", "property-access", "member", "object"],
      style: {
        color: "#94a3b8", // Muted slate for properties/members
      },
    },
    {
      types: ["function", "method", "deleted", "tag"],
      style: {
        color: "#e6a91c", // Slightly muted orange/yellow for functions
      },
    },
    {
      types: ["keyword"],
      style: {
        color: "#e63366", // Slightly muted pink for core keywords
      },
    },
    {
      types: ["constant", "regex"],
      style: {
        color: "#db72b6", // Slightly muted lighter pink for constants
      },
    },
    {
      types: [
        "class-name",
        "maybe-class-name",
        "interface",
        "enum",
        "type-parameters",
      ],
      style: {
        color: "#bd93f9", // Purple for class/type names
      },
    },
    {
      types: ["builtin", "attr-name"],
      style: {
        color: "#94a3b8", // Muted slate for built-ins
      },
    },
    {
      types: ["type", "type-annotation"],
      style: {
        color: "#c4b5fd", // Lighter purple for type annotations
      },
    },
    {
      types: ["module", "imports", "exports"],
      style: {
        color: "#e63366", // Slightly muted pink for module-related
      },
    },
    {
      types: ["function-variable"],
      style: {
        color: "#e6a91c", // Slightly muted orange/yellow for function variables
      },
    },
  ],
} satisfies PrismTheme;

export function CodeBlock({
  language,
  code,
  className,
  filename,
  highlightedLines = [],
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
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
    //if (!mounted) return themes.synthwave84; // Default for SSR
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
                <div
                  key={i}
                  {...getLineProps({ line, key: i })}
                  className={cn(
                    highlightedLines.includes(i + 1) &&
                      "bg-muted/50 -mx-4 px-4 py-1 border-primary"
                  )}
                >
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
