import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { useEffect, useRef } from "react";

const versions = [
  { label: "latest", value: "latest", version: "v0.4.1" },
  // Add more versions here as needed
];

export function VersionSelector({ version }: { version: string }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  // Find the current version object by version string, fallback to first
  const current = versions.find((v) => v.version === version) ?? versions[0];

  // Set data-open on the closest SidebarMenuButton ancestor when open
  useEffect(() => {
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
        {current.version} <span className="ml-1">({current.label})</span>
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
            <button
              key={v.value}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs font-mono rounded hover:bg-accent focus:bg-accent focus:outline-none",
                v.value === current.value && "bg-accent"
              )}
              onClick={() => {
                setOpen(false);
                window.location.reload();
              }}
              disabled={v.value === current.value}
            >
              {v.version} <span className="ml-1">({v.label})</span>
            </button>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}

export default VersionSelector;
