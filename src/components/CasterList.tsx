"use client";

import CasterRow from "./CasterRow";
import { useCasters } from "@/hooks/useCasters";

/**
 * The list itself, plus the "Add caster" button.
 *
 * Kept separate from the page so it can be loaded browser-only. That is what lets useCasters read
 * localStorage during the first render instead of loading it a moment later, which would flash the
 * empty state on every refresh.
 */
export default function CasterList() {
  const { casters, addCaster, updateCaster, removeCaster } = useCasters();

  return (
    <>
      {casters.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-4">
          {casters.map((caster, index) => (
            <CasterRow
              key={caster.id}
              caster={caster}
              position={index + 1}
              onChange={updateCaster}
              onRemove={removeCaster}
            />
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={addCaster}
        className="
          mt-6 flex w-full cursor-pointer items-center justify-center gap-2
          rounded-2xl border-2 border-dashed border-line px-5 py-4
          text-lg font-medium text-muted
          transition-[color,border-color,background-color] duration-150
          hover:border-accent hover:bg-accent/5 hover:text-accent
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
          active:scale-[0.995]
        "
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add caster
      </button>
    </>
  );
}

function EmptyState() {
  return (
    <div className="row-in rounded-2xl border border-dashed border-line px-6 py-14 text-center">
      <p className="text-xl font-medium">No casters yet</p>
      <p className="mt-2 text-lg text-muted">
        Add your first one to generate a link.
      </p>
    </div>
  );
}
