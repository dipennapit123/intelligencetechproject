import { Suspense } from "react";

import { AdminLoginHeader } from "@/components/AdminLoginHeader";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-container-low">
      <AdminLoginHeader />
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center bg-surface-container-low py-24" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
