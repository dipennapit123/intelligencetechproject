"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";

import { FadeUp, ScaleIn } from "@/components/motion/AnimatedSection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { loginSchema, type LoginFormValues } from "@/lib/validation/schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/app";

  const [busy, setBusy] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(data: LoginFormValues) {
    setBusy(true);
    setServerError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        setServerError(error.message);
        return;
      }
      router.push(nextPath);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center px-4 py-12">
      <FadeUp className="mx-auto flex w-full max-w-md flex-col">
        <p className="mb-6 text-center text-sm text-on-surface-variant">Sign in to manage content.</p>

        <ScaleIn>
          <Card className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <label htmlFor="login-email" className="text-sm font-medium">
                  Email
                </label>
                <div className="mt-1">
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={errors.email ? "true" : "false"}
                    className={errors.email ? "ring-2 ring-red-500/40" : ""}
                    {...register("email")}
                  />
                </div>
                <FieldError message={errors.email?.message} />
              </div>

              <div>
                <label htmlFor="login-password" className="text-sm font-medium">
                  Password
                </label>
                <div className="mt-1">
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={errors.password ? "true" : "false"}
                    className={errors.password ? "ring-2 ring-red-500/40" : ""}
                    {...register("password")}
                  />
                </div>
                <FieldError message={errors.password?.message} />
              </div>

              {serverError ? (
                <div className="rounded-xl bg-error-container/80 px-3 py-2 text-sm text-on-error-container">
                  {serverError}
                </div>
              ) : null}

              <Button className="w-full" type="submit" disabled={busy}>
                {busy ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Card>
        </ScaleIn>
      </FadeUp>
    </div>
  );
}
