"use client";

import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      className={cx(
        "h-11 w-full rounded-xl border border-black/10 bg-background px-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container",
        className,
      )}
      {...rest}
    />
  );
}

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea(props, ref) {
  const { className, ...rest } = props;
  return (
    <textarea
      ref={ref}
      className={cx(
        "w-full rounded-xl border border-black/10 bg-background px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container",
        className,
      )}
      {...rest}
    />
  );
});

