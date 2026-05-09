import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl bg-surface-bright shadow-sm ring-1 ring-primary/8 transition hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

