import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton({ onClick }: { onClick: () => any }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <LogOut size={16} className="mr-2" />
      Sign out
    </Button>
  );
}
