import type * as React from "react";
import {
  BookOpen,
  Code,
  FileText,
  Github,
  Home,
  Server,
  Layers,
} from "lucide-react";

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
} from "@/components/ui/sidebar";

function SmoothScrollLink({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (href === "#" || href === "/") {
      e.preventDefault();
      e.stopPropagation();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (href.startsWith("#")) {
      e.preventDefault();
      e.stopPropagation();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      onClickCapture={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <SmoothScrollLink href="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[rgb(243,176,28)] from-30% to-[#FF3366] to-100% text-white">
                    <Layers className="size-4" />
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
                  <SidebarMenuButton asChild tooltip="Getting Started">
                    <SmoothScrollLink href="#getting-started">
                      <BookOpen className="size-4" />
                      <span>Getting Started</span>
                    </SmoothScrollLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Core Concepts">
                    <SmoothScrollLink href="#core-concepts">
                      <FileText className="size-4" />
                      <span>Core Concepts</span>
                    </SmoothScrollLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="API Reference">
                    <SmoothScrollLink href="#api-reference">
                      <Code className="size-4" />
                      <span>API Reference</span>
                    </SmoothScrollLink>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <SmoothScrollLink href="#react-hooks">
                          <Layers className="size-4 mr-2" />
                          React Hooks
                        </SmoothScrollLink>
                      </SidebarMenuSubButton>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <SmoothScrollLink href="#use-quantum">
                              useQuantum
                            </SmoothScrollLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <SmoothScrollLink href="#use-async-data">
                              useAsyncData
                            </SmoothScrollLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <SmoothScrollLink href="#nodejs-utilities">
                          <Server className="size-4 mr-2" />
                          Node.js Utilities
                        </SmoothScrollLink>
                      </SidebarMenuSubButton>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <SmoothScrollLink href="#create-server">
                              createServer
                            </SmoothScrollLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <SmoothScrollLink href="#file-system">
                              fileSystem
                            </SmoothScrollLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="GitHub">
                <a
                  href="https://github.com/example/convex-better-auth"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="size-4" />
                  <span>GitHub</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px]">
          <SidebarTrigger />
          <div className="flex-1" />
          <a
            href="https://github.com/example/convex-better-auth"
            target="_blank"
            rel="noopener noreferrer"
            className="inline/-flex hidden h-9 items-center justify-center rounded-md px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </a>
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
