<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# vMix Caster Links

A one-page tool for building vMix Call links. You type a code (the vMix Call `Key`) and a caster's name, and it gives you a copyable link. It replaces a spreadsheet full of `=CONCATENATE("https://advanced.vmixcall.com/call.htm?Key=...&Name=...")` formulas.

## Architectural decisions

**No backend, no database, no API routes.** The entire app is client-side. Data lives in the browser's `localStorage` under the key `vmix-casters:v1`.

The consequence, which is deliberate: **the list does not sync between machines or browsers**, and clearing browser data erases it. This was accepted in exchange for having nothing to host, secure, or back up. If cross-device sync is ever needed, that is a real backend, not a tweak.

**`ssr: false` on the list component.** `src/app/page.tsx` loads `CasterList` through `next/dynamic` with `ssr: false`. This is the load-bearing decision in the codebase:

- The server has no `localStorage`, so a server-rendered list would always start empty and then swap to the real data, flashing "No casters yet" on every refresh.
- Because `CasterList` never renders on the server, `useCasters` can read `localStorage` in a `useState` initialiser. The saved list is therefore present on the first paint.
- Cost: one extra JS chunk request. In development this shows as a visible delay while Turbopack compiles the chunk; in a production build the list appears immediately. Do not "fix" the dev delay.

**Do not use `useCasters` in a server-rendered component.** It will crash. It is only safe underneath the `ssr: false` boundary.

**Link building lives in exactly one file,** `src/lib/link.ts`. If vMix changes the URL or a parameter name, that is the only file to edit.

**Names are URL-encoded.** `encodeURIComponent` turns `John Smith` into `John%20Smith`. The original spreadsheet formula did not do this, so links with spaces could break when pasted into apps that stop reading a URL at the first space. vMix reads both forms identically.

## Flow

```
app/page.tsx          header, and a dynamic (ssr:false) import of CasterList
  └─ CasterList       owns the list state via useCasters, renders rows + "Add caster"
       └─ CasterRow   two inputs, live link preview, copy, delete
            └─ CopyButton
hooks/useCasters.ts   state + localStorage read on init, write on change
lib/link.ts           buildLink(code, name) — the only place the URL format exists
types/caster.ts       { id, code, name }
```

## Behavioural decisions

- **New rows are appended to the bottom**, so the list reads in the order you filled it in.
- **Delete is immediate — no confirmation, no undo.** Chosen for minimalism. The row's exit animation is what removes it: `CasterRow` sets `leaving`, and `onAnimationEnd` calls `onRemove`. This is why the reduced-motion CSS uses `0.01ms` rather than `0` — a zero-duration animation may not fire the end event, and the row would never be removed.
- **Copy is disabled until both fields are filled**, because a link with a blank key or name is not usable.
- **Copy shows "Failed" when the clipboard API is blocked.** That API only works in a secure context, meaning HTTPS or localhost. A deployment served over plain HTTP will not be able to copy.
- Colour scheme follows the operating system. There is deliberately no in-app toggle.
- Base font size is 18px (set on `body` in `globals.css`), not the usual 16px, because this is read at a distance in a control room. Every Tailwind text size scales from it.

## Gotchas

- **`--color-line`, not `--color-border`.** In `globals.css` the border colour is registered under `--color-line` because Tailwind v4 already uses `border` for width utilities, and reusing the name causes conflicts.
- **`STORAGE_KEY` is versioned** (`vmix-casters:v1`). If the `Caster` shape changes, bump to `v2` so old saved records are ignored rather than crashing the new code.
- **`turbopack.root` is pinned** in `next.config.ts`. Without it Next.js walks up the filesystem looking for a lockfile and can latch onto an unrelated `package-lock.json` in the home directory.
- **`.remember/` is in the ESLint ignore list.** It is tooling scratch output, not app code.

## Deployment (Coolify)

`next.config.ts` sets `output: "standalone"`, so `next build` emits a self-contained `.next/standalone` folder with its own `server.js`. The `Dockerfile` is a three-stage build that copies `public/` and `.next/static/` in by hand, since standalone does not include them.

Point Coolify at this repo with the Dockerfile build pack. The container listens on port 3000 and binds `0.0.0.0` (required, or Coolify's proxy cannot reach it). There are no environment variables and no volumes — the app stores nothing server-side.

Serve it over HTTPS. On plain HTTP the copy button cannot reach the clipboard API.

## Commands

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint    # must be clean before committing
```
