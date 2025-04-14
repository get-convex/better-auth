"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useSidebar, SidebarMenuButton } from "@/components/ui/sidebar";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { state } = useSidebar();

  const cycleTheme = () => {
    const themes = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme ?? "system");
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const currentIcon = {
    light: <Sun className="size-4" />,
    dark: <Moon className="size-4" />,
    system: <Monitor className="size-4" />,
  }[theme ?? "system"];

  if (state === "collapsed") {
    return (
      <SidebarMenuButton
        onClick={cycleTheme}
        tooltip="Theme"
        aria-label="Toggle theme"
        className="text-muted-foreground"
      >
        {currentIcon}
      </SidebarMenuButton>
    );
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => setTheme("light")}
        className={`flex h-7 w-7 items-center justify-center rounded-[4px] transition-colors hover:cursor-pointer ${
          theme === "light"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        }`}
        aria-label="Light mode"
      >
        <Sun className="size-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex h-7 w-7 items-center justify-center rounded-[4px] transition-colors hover:cursor-pointer ${
          theme === "dark"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        }`}
        aria-label="Dark mode"
      >
        <Moon className="size-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`flex h-7 w-7 items-center justify-center rounded-[4px] transition-colors hover:cursor-pointer ${
          theme === "system"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        }`}
        aria-label="Auto mode"
      >
        <Monitor className="size-4" />
      </button>
    </div>
  );
}
