"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../lib/utils";
import { useEffect, useRef } from "react";

const localVersion = {
  label: process.env.VERSION_LABEL!,
  version: process.env.VERSION!,
  branch: process.env.VERSION_BRANCH!,
};

const VERSION_BRANCHES = ["latest", "main"];

const DOCS_DOMAIN = "convex-better-auth.netlify.app";

type Version = {
  label: string;
  version: string;
  branch: string;
};

const getVersions = async () => {
  return (
    await Promise.all(
      VERSION_BRANCHES.map(async (branch) => {
        try {
          const packageJson = (await (
            await fetch(
              `https://raw.githubusercontent.com/get-convex/better-auth/refs/heads/${branch}/package.json`
            )
          ).json()) as {
            version: string;
            versionMetadata: {
              label: string;
              branch: string;
            };
          };
          return {
            version: packageJson.version,
            label: packageJson.versionMetadata.label,
            branch: packageJson.versionMetadata.branch,
          };
        } catch (error) {
          console.error(error);
        }
      })
    )
  ).flatMap((v) => v || []);
};

export function VersionSelector() {
  const [open, setOpen] = React.useState(false);
  const [versions, setVersions] = React.useState<Version[]>([localVersion]);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const branch =
    (typeof window === "object" &&
      window.location?.hostname.includes("--") &&
      window.location?.hostname.split("--")[0]) ||
    "";
  const current =
    (branch &&
      versions.find((v) => {
        return v.branch === branch || v.version.replaceAll(".", "-") === branch;
      })) ||
    versions[0];

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
                  : `https://${v.branch}--${DOCS_DOMAIN}`
              }
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs font-mono rounded hover:bg-accent focus:bg-accent focus:outline-none",
                v.version === current.version && "bg-accent"
              )}
            >
              v{v.version}
              {v.label && <span className="ml-1">({v.label})</span>}
            </a>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}

export default VersionSelector;
