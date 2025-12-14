import type { InputHTMLAttributes } from "react";

export default function TextInput(
  props: InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      type="text"
      className={
        "h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 " +
        (props.className ?? "")
      }
    />
  );
}
