"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.1.4";
import { CheckIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative border bg-white dark:bg-input/30 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 data-[state=checked]:text-white dark:data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 aria-invalid:border-destructive aria-invalid:ring-destructive/20 size-5 shrink-0 rounded border-slate-300 transition-colors outline-none hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon className="size-3.5" strokeWidth={2.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
