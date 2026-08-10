"use client";

import { useState } from "react";
import type { Caster } from "@/types/caster";
import { buildLink } from "@/lib/link";
import CopyButton from "./CopyButton";

type CasterRowProps = {
  caster: Caster;
  /** 1-based position, shown as a badge so you can refer to "caster 3" out loud during a show. */
  position: number;
  onChange: (id: string, patch: { code?: string; name?: string }) => void;
  onRemove: (id: string) => void;
};

export default function CasterRow({
  caster,
  position,
  onChange,
  onRemove,
}: CasterRowProps) {
  // A deleted row has to stay on screen long enough to animate out. `leaving` starts that
  // animation; the row is actually removed from the list in onAnimationEnd below.
  const [leaving, setLeaving] = useState(false);

  const link = buildLink(caster.code, caster.name);

  // A link with a blank code or name is not usable, so copying it is disabled until both are filled.
  const isComplete = caster.code.trim() !== "" && caster.name.trim() !== "";

  return (
    <li
      className={`
        ${leaving ? "row-out" : "row-in"}
        rounded-2xl border border-line bg-card p-5 shadow-sm
        transition-shadow duration-200 hover:shadow-md
      `}
      onAnimationEnd={() => {
        if (leaving) onRemove(caster.id);
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-line px-2 text-base font-semibold text-muted">
          {position}
        </span>

        <button
          type="button"
          onClick={() => setLeaving(true)}
          aria-label={`Delete caster ${position}`}
          className="
            inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2
            text-base text-muted
            transition-colors duration-150
            hover:bg-red-500/10 hover:text-red-500
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
          "
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M10 7V5h4v2M6 7l1 13h10l1-13" />
          </svg>
          Delete
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Code"
          value={caster.code}
          placeholder="abc123"
          mono
          onChange={(code) => onChange(caster.id, { code })}
        />
        <Field
          label="Name"
          value={caster.name}
          placeholder="John Smith"
          onChange={(name) => onChange(caster.id, { name })}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl bg-background p-3 sm:flex-row sm:items-center">
        <p
          className={`
            min-w-0 flex-1 truncate font-mono text-[15px]
            ${isComplete ? "text-foreground" : "text-muted italic"}
          `}
          // The full link on hover, since long names get truncated in the visible line.
          title={isComplete ? link : undefined}
        >
          {isComplete ? link : "Fill in both fields to build the link"}
        </p>

        <CopyButton
          value={link}
          disabled={!isComplete}
          label={caster.name || `caster ${position}`}
        />
      </div>
    </li>
  );
}

type FieldProps = {
  label: string;
  value: string;
  placeholder: string;
  mono?: boolean;
  onChange: (value: string) => void;
};

/** A labelled text input. Split out so both fields stay identical without repeating the classes. */
function Field({ label, value, placeholder, mono, onChange }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold tracking-wide text-muted uppercase">
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        // Browsers try to autofill anything called "name"; these turn that off so a saved address
        // never lands in a caster field.
        autoComplete="off"
        spellCheck={false}
        className={`
          w-full rounded-xl border border-line bg-background px-4 py-3 text-xl
          transition-[border-color,box-shadow] duration-150
          placeholder:text-muted/50
          focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none
          ${mono ? "font-mono" : ""}
        `}
      />
    </label>
  );
}
