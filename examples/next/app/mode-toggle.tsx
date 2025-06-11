"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { ModeToggle as ModeToggleComponent } from "@/components/mode-toggle";

export function ModeToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const isServer = pathname.includes("/dashboard/server");
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (toServer: boolean) => {
    if ((toServer && isServer) || (!toServer && !isServer)) return;
    startTransition(() => {
      router.push(toServer ? "/dashboard/server" : "/dashboard/client-only");
    });
  };

  return (
    <ModeToggleComponent
      isServer={isServer}
      onSwitch={handleSwitch}
      isPending={isPending}
    />
  );
}
