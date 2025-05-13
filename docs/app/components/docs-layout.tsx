import type * as React from "react";
import {
  BookOpen,
  FileText,
  Github,
  Home,
  Layers,
  AlertTriangle,
  PanelLeft,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";

export function SmoothScrollLink({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  // Remove the handleClick logic entirely
  // Let the browser handle default anchor link behavior
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

function SidebarFooterContent() {
  const { state, toggleSidebar } = useSidebar();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="GitHub">
            <a
              href="https://github.com/erquhart/convex-better-auth"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <Github className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                GitHub
              </span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="NPM">
            <a
              href="https://www.npmjs.com/package/@erquhart/convex-better-auth"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
              </svg>
              <span className="group-data-[collapsible=icon]:hidden">NPM</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Discord">
            <a
              href="https://discord.gg/convex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
              </svg>
              <span className="group-data-[collapsible=icon]:hidden">
                Discord
              </span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      {state === "collapsed" ? (
        <>
          <SidebarSeparator className="mx-0" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Theme">
                <ThemeToggle />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={toggleSidebar}
                tooltip="Expand"
                aria-label="Expand"
                className="text-muted-foreground"
              >
                <PanelLeft className="size-4" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </>
      ) : (
        <div className="mt-2 flex w-full items-center justify-between px-0.5">
          <ThemeToggle />
          <button
            onClick={toggleSidebar}
            className="flex h-7 w-7 items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Collapse"
          >
            <PanelLeft className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <SmoothScrollLink href="/">
                  <div className="flex aspect-square size-8 items-center justify-center">
                    <img
                      src={
                        theme === "dark"
                          ? "/convex-mark-white.svg"
                          : "/convex-mark-black.svg"
                      }
                      alt="Convex + Better Auth"
                      className="size-8"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Convex + Better Auth</span>
                    <span className="text-xs text-muted-foreground">
                      v0.1.0-alpha
                    </span>
                  </div>
                </SmoothScrollLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Documentation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Home">
                    <SmoothScrollLink href="#">
                      <Home className="size-4" />
                      <span>Home</span>
                    </SmoothScrollLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Alpha Status"
                    className="text-yellow-600 dark:text-yellow-400"
                  >
                    <SmoothScrollLink href="#alpha-status">
                      <AlertTriangle className="size-4" />
                      <span>Alpha Status</span>
                    </SmoothScrollLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Getting Started">
                    <SmoothScrollLink href="#getting-started">
                      <BookOpen className="size-4" />
                      <span>Getting Started</span>
                    </SmoothScrollLink>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <SmoothScrollLink href="#installation">
                          Installation
                        </SmoothScrollLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <SmoothScrollLink href="#setup-better-auth">
                          Setup Better Auth
                        </SmoothScrollLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <SmoothScrollLink href="#setup-client">
                          Setup Client
                        </SmoothScrollLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Authorization">
                    <SmoothScrollLink href="#authorization">
                      <FileText className="size-4" />
                      <span>Authorization</span>
                    </SmoothScrollLink>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <SmoothScrollLink href="#authorization-client">
                          Client
                        </SmoothScrollLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <SmoothScrollLink href="#authorization-convex-functions">
                          Convex Functions
                        </SmoothScrollLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Basic Usage">
                    <SmoothScrollLink href="#basic-usage">
                      <FileText className="size-4" />
                      <span>Basic Usage</span>
                    </SmoothScrollLink>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <SmoothScrollLink href="#working-with-users">
                          Working with Users
                        </SmoothScrollLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <SmoothScrollLink href="#migrating-existing-users">
                          Migrating Existing Users
                        </SmoothScrollLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <SmoothScrollLink href="#event-hooks">
                          Event Hooks
                        </SmoothScrollLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarFooterContent />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px]">
          <SidebarTrigger className="md:hidden size-4" />
          <div className="flex-1" />
          <a
            href="https://github.com/erquhart/convex-better-auth"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-md px-2 md:px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Github className="md:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
