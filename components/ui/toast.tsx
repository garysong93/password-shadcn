"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  message: string;
  open: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, open, onClose, duration = 2000 }: ToastProps) {
  React.useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => {
        onClose();
      }, duration);
      return () => window.clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 animate-[slideDown_0.2s_ease-out]">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-zinc-200 bg-background px-4 py-3 text-sm shadow-lg dark:border-zinc-800",
          "min-w-[200px] max-w-[90vw]",
        )}
      >
        <svg
          className="h-4 w-4 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="text-foreground">{message}</span>
      </div>
    </div>
  );
}
