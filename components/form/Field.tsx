import { type ReactNode } from "react";

export function FieldRoot({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
      {children}
    </div>
  );
}

export function FieldHint({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs text-zinc-500 dark:text-zinc-400">{children}</div>
  );
}

export function FieldError({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-medium text-red-600 dark:text-red-500">
      {children}
    </div>
  );
}
