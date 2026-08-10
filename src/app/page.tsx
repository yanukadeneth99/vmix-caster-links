"use client";

import dynamic from "next/dynamic";

/**
 * The whole app is this one page. There is no server, no database and no API route: everything it
 * does — reading localStorage, typing into inputs, copying to the clipboard — happens in your
 * browser.
 *
 * `ssr: false` tells Next.js not to render CasterList on the server. That matters because the
 * server has no localStorage, and because it lets the saved list appear on the very first paint
 * rather than popping in after an empty state.
 */
const CasterList = dynamic(() => import("@/components/CasterList"), {
  ssr: false,
  // Roughly the height of one row, so the page does not jump when the list loads.
  loading: () => <div className="h-52" aria-hidden="true" />,
});

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          vMix Caster Links
        </h1>
        <p className="mt-3 text-lg text-muted">
          Enter a code and a name, then copy the call link. Saved in this
          browser.
        </p>
      </header>

      <CasterList />
    </main>
  );
}
