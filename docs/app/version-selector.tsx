"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../lib/utils";
import { useEffect, useRef } from "react";
import localVersions from "../versions.json";

const DOCS_DOMAIN = "convex-better-auth.netlify.app";

type Version = {
  label?: string;
  version: string;
};

const getVersions = async () => {
  try {
    const versions = await (
      await fetch(
        "https://raw.githubusercontent.com/erquhart/convex-better-auth/refs/heads/main/docs/versions.json"
      )
    ).json();
    const isArray = Array.isArray(versions);
    if (!isArray) {
      throw Error("versions is not an array");
    }
    return versions;
  } catch (error) {
    console.error(error);
  }
};

export function VersionSelector() {
  const [open, setOpen] = React.useState(false);
  const [versions, setVersions] = React.useState<Version[]>(localVersions);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const branch =
    typeof window === "object" && window.location?.hostname.split("--")[0];
  const current =
    versions.find((v) => {
      return v.label === branch || v.version.replaceAll(".", "-") === branch;
    }) ?? versions.find((v) => v.label === "latest");

  useEffect(() => {
    const fetchVersions = async () => {
      const versions = await getVersions();
      if (versions && versions.length > 0) {
        setVersions(versions);
      }
    };
    void fetchVersions();
  }, []);

  // Set data-open on the closest SidebarMenuButton ancestor when open
  useEffect(() => {
    if (!current) return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    const button = trigger.closest(
      '[data-slot="sidebar-menu-button"]'
    ) as HTMLElement | null;
    if (!button) return;
    if (open) {
      button.setAttribute("data-open", "true");
    } else {
      button.removeAttribute("data-open");
    }
    return () => {
      button.removeAttribute("data-open");
    };
  }, [open]);

  if (!current) return null;

  // The trigger covers the parent area, but only the version line is visible
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <span
          ref={triggerRef}
          className={cn(
            "absolute inset-0 z-10 cursor-pointer",
            // visually hidden but covers the whole parent
            "[&>*]:pointer-events-none"
          )}
          tabIndex={0}
          role="button"
          aria-label="Select documentation version"
        />
      </Popover.Trigger>
      {/* The visible version line, styled as before, not a trigger */}
      <span
        className={cn(
          "text-xs text-muted-foreground font-mono flex items-center transition-colors",
          open
            ? "text-foreground"
            : "group-hover/sidebar-menu-button:text-foreground"
        )}
      >
        {current.version}
        {current.label && <span className="ml-1">({current.label})</span>}
        <svg
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 20 20"
          className={cn(
            "ml-1 inline-block align-middle transition-opacity",
            open
              ? "opacity-100"
              : "opacity-60 group-hover/sidebar-menu-button:opacity-100"
          )}
          aria-hidden="true"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <Popover.Content
        align="end"
        sideOffset={4}
        className={cn(
          "align-end",
          "z-50 min-w-[120px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        )}
      >
        <div className="flex flex-col">
          {versions.map((v) => (
            <a
              key={v.version}
              href={
                v.label === "latest"
                  ? `https://${DOCS_DOMAIN}`
                  : v.label
                    ? `https://${v.label}--${DOCS_DOMAIN}`
                    : `https://${v.version.replaceAll(".", "-")}--${DOCS_DOMAIN}`
              }
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs font-mono rounded hover:bg-accent focus:bg-accent focus:outline-none",
                v.version === current.version && "bg-accent"
              )}
            >
              {v.version}
              {v.label && <span className="ml-1">({v.label})</span>}
            </a>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}

export default VersionSelector;
