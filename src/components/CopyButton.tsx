"use client";

import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "error";

type CopyButtonProps = {
  value: string;
  disabled?: boolean;
  /** Read out by screen readers, since the visible label is just "Copy". */
  label: string;
};

/**
 * Copies a string to the clipboard and confirms it did so for 1.5 seconds.
 *
 * The confirmation matters because copying is invisible: without it you cannot tell a successful
 * copy from a missed click, and you find out only after pasting the wrong thing into a caster's
 * chat window.
 */
export default function CopyButton({
  value,
  disabled = false,
  label,
}: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");

  // Held in a ref so a rapid second click cancels the first click's pending reset instead of the
  // label snapping back to "Copy" early.
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the timer if the row is deleted mid-countdown, otherwise React warns about updating a
  // component that no longer exists.
  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function handleCopy() {
    let nextState: CopyState;

    try {
      await navigator.clipboard.writeText(value);
      nextState = "copied";
    } catch {
      // The clipboard API is blocked outside a secure context, so this fails on a plain http://
      // address that is not localhost. Showing "Failed" beats pretending the copy worked.
      nextState = "error";
    }

    setState(nextState);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setState("idle"), 1500);
  }

  const isCopied = state === "copied";
  const isError = state === "error";

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      aria-label={`Copy link for ${label}`}
      className={`
        inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5
        text-base font-medium text-white
        transition-[background-color,transform] duration-150 ease-out
        active:scale-[0.97]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
        disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100
        ${isCopied ? "bg-success" : isError ? "bg-red-600" : "bg-accent hover:opacity-90"}
      `}
    >
      <CopyIcon state={state} />
      <span className="tabular-nums">
        {isCopied ? "Copied" : isError ? "Failed" : "Copy"}
      </span>
    </button>
  );
}

/** Swaps between the copy, tick and warning glyphs. Wrapped so the button stays readable. */
function CopyIcon({ state }: { state: CopyState }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {state === "copied" ? (
        <polyline points="4 12.5 9.5 18 20 6.5" />
      ) : state === "error" ? (
        <>
          <path d="M12 4v10" />
          <path d="M12 19h.01" />
        </>
      ) : (
        <>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" />
        </>
      )}
    </svg>
  );
}
