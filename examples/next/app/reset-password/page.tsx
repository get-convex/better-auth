import { Suspense } from "react";
import ClientResetPassword from "./reset-password";

export default function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientResetPassword searchParams={searchParams} />
    </Suspense>
  );
}
