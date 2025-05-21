"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useSelectedVariant,
  setSelectedVariant,
} from "./code-block-variant-store";
import { useTheme } from "next-themes";

interface HighlightedSection {
  start: number;
  end: number;
}

type CodeBlockVariant = {
  label: string;
  code: string;
  language: string;
  filename?: string;
  highlightedLines?: number[];
  addedLines?: number[];
  removedLines?: number[];
};

interface CodeBlockProps {
  variants?: CodeBlockVariant[];
  variantGroup?: string;
  language?: string;
  code?: string;
  className?: string;
  filename?: string;
  highlightedLines?: number[];
  addedLines?: number[];
  removedLines?: number[];
}

// Extract the internal code block rendering logic
function CodeBlockInternal({
  language = "",
  code = "",
  className,
  filename,
  highlightedLines = [],
  addedLines = [],
  removedLines = [],
  variantSelector,
}: {
  language: string;
  code: string;
  className?: string;
  filename?: string;
  highlightedLines?: number[];
  addedLines?: number[];
  removedLines?: number[];
  variantSelector?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<number>();
  const [hoveredSection, setHoveredSection] = useState<number>();
  const { resolvedTheme: theme } = useTheme();

  // Copy all code to clipboard, excludes removed lines
  const copyToClipboard = async () => {
    const filteredCode = code
      .split("\n")
      .filter((line, index) => !removedLines.includes(index + 1))
      .join("\n");
    await navigator.clipboard.writeText(filteredCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHighlightedSections = (lines: number[]): HighlightedSection[] => {
    if (lines.length === 0) return [];
    const sorted = [...lines].sort((a, b) => a - b);
    const sections: HighlightedSection[] = [];
    let current: HighlightedSection = { start: sorted[0], end: sorted[0] };

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === current.end + 1) {
        current.end = sorted[i];
      } else {
        sections.push(current);
        current = { start: sorted[i], end: sorted[i] };
      }
    }
    sections.push(current);
    return sections;
  };

  const copySection = async (section: HighlightedSection) => {
    const lines = code.split("\n");
    const sectionText = lines.slice(section.start - 1, section.end).join("\n");
    await navigator.clipboard.writeText(sectionText);
    setCopiedSection(section.start);
    setTimeout(() => setCopiedSection(undefined), 2000);
  };

  const prismTheme = theme === "light" ? themes.github : themes.vsDark;

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
      className={cn(
        "relative my-4 rounded-lg border overflow-hidden",
        theme === "light" ? "bg-white" : "bg-zinc-950",
        className
      )}
    >
      {variantSelector && (
        <div
          className={cn(
            "flex items-center justify-between px-2 text-sm bg-muted/50"
          )}
        >
          <div className="flex items-center min-w-0">{variantSelector}</div>
        </div>
      )}
      <div
        className={cn("flex items-center justify-between gap-2 pl-4 pr-2 py-1")}
      >
        <div
          className={cn(
            "flex items-center gap-2 text-xs",
            theme === "light" ? "text-zinc-700" : "text-zinc-200"
          )}
        >
          {["tsx", "ts", "typescript"].includes(language) && (
            <div className="text-muted-foreground [&_svg]:size-3.5">
              <svg viewBox="0 0 24 24">
                <path
                  d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          )}
          {(["shell", "terminal", "sh"].includes(language) || !language) && (
            <div className="text-muted-foreground [&_svg]:size-3.5">
              <svg viewBox="0 0 24 24">
                <path
                  d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          )}
          <span className="truncate text-sm text-muted-foreground">
            {filename || "Terminal"}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer hover:bg-muted group"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Highlight
          theme={prismTheme}
          code={code}
          language={getLanguage(language)}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => {
            const highlightedSections =
              getHighlightedSections(highlightedLines);
            const addedSections = getHighlightedSections(addedLines);

            return (
              <pre
                className={cn("text-sm p-4", className)}
                style={{
                  ...style,
                  backgroundColor: "transparent",
                  margin: 0,
                }}
              >
                {tokens.map((line, i) => {
                  const lineNumber = i + 1;
                  const section =
                    highlightedSections.find(
                      (s) => lineNumber >= s.start && lineNumber <= s.end
                    ) ||
                    addedSections.find(
                      (s) => lineNumber >= s.start && lineNumber <= s.end
                    );
                  const isFirstLineOfSection = section?.start === lineNumber;
                  const sectionClass = section
                    ? `section-${section.start}`
                    : "";
                  const isAdded = addedLines.includes(lineNumber);
                  const isRemoved = removedLines.includes(lineNumber);
                  const isHighlighted = highlightedLines.includes(lineNumber);
                  const isDecorated = isAdded || isRemoved || isHighlighted;
                  return (
                    <div
                      key={i}
                      {...getLineProps({ line })}
                      className={cn(
                        "relative",
                        sectionClass,
                        isDecorated && "-mx-4 px-4",
                        isHighlighted && "bg-foreground/10 border-primary",
                        isAdded &&
                          (theme === "light"
                            ? "bg-green-200"
                            : "bg-green-400/20"),
                        isRemoved &&
                          (theme === "light" ? "bg-red-200" : "bg-red-400/20")
                      )}
                      onMouseEnter={() =>
                        section && setHoveredSection(section.start)
                      }
                      onMouseLeave={() => setHoveredSection(undefined)}
                    >
                      {isAdded && (
                        <span
                          className={cn(
                            "text-green-600 select-none absolute left-1",
                            theme === "dark" && "text-green-300"
                          )}
                        >
                          +
                        </span>
                      )}
                      {isRemoved && (
                        <span
                          className={cn(
                            "text-red-600 select-none absolute left-1",
                            theme === "dark" && "text-red-300"
                          )}
                        >
                          -
                        </span>
                      )}
                      {isFirstLineOfSection && section && (
                        <Button
                          variant="link"
                          size="icon"
                          className={cn(
                            "absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 transition-opacity cursor-pointer",
                            hoveredSection === section.start
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                          onClick={() => copySection(section)}
                        >
                          {copiedSection === section.start ? (
                            <Check className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  );
                })}
              </pre>
            );
          }}
        </Highlight>
      </div>
    </div>
  );
}

export function CodeBlock(props: CodeBlockProps) {
  const {
    variants,
    variantGroup = "",
    language = "",
    code = "",
    className,
    filename,
    highlightedLines = [],
    addedLines = [],
    removedLines = [],
  } = props;
  const globalSelected = useSelectedVariant(variantGroup);

  let variantSelector: React.ReactNode = null;
  let active: {
    language?: string;
    code?: string;
    filename?: string;
    highlightedLines?: number[];
    addedLines?: number[];
    removedLines?: number[];
  } = { language, code, filename, highlightedLines, addedLines, removedLines };

  if (variants && variants.length > 0) {
    const availableLabels = variants.map((v) => v.label);
    const selectedIndex = availableLabels.indexOf(globalSelected);
    const actualIndex = selectedIndex >= 0 ? selectedIndex : 0;
    active = variants[actualIndex] || variants[0];
    if (variants.length > 0) {
      variantSelector = (
        <div className="flex" role="tablist">
          {variants.map((v, i) => (
            <button
              key={v.label}
              className={cn(
                "px-2 py-2 text-sm transition-colors cursor-pointer relative",
                i === actualIndex
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={{ boxShadow: "none" }}
              onClick={() => setSelectedVariant(variantGroup, v.label)}
              aria-selected={i === actualIndex}
              role="tab"
              type="button"
            >
              {v.label}
              {i === actualIndex && (
                <div className="absolute left-0 bottom-0.5 flex items-center justify-center w-full">
                  <div className="rounded-full bg-foreground w-4 h-0.5" />
                </div>
              )}
            </button>
          ))}
        </div>
      );
    }
  }

  return (
    <CodeBlockInternal
      language={active.language || ""}
      code={active.code || ""}
      className={className}
      filename={active.filename}
      highlightedLines={active.highlightedLines}
      addedLines={active.addedLines}
      removedLines={active.removedLines}
      variantSelector={variantSelector}
    />
  );
}
