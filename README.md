# Songsterr Downloader 🎸

## ⚠️ Download Support Status - March 2026

Songsterr downloads are no longer reliably available as direct Guitar Pro source links for every tab, so the project is moving to a conversion flow:

1. parse Songsterr page state
2. fetch per-part CDN revision JSON payloads export GP7 via alphaTab.
3. trigger client side download with the merged gp7 tab

Main challenges right now:

- Mapping Songsterr notation/effects to GP with high fidelity (some effects are still best-effort).
- Handling occasional missing/failed per-part CDN revision requests.
- Keeping conversion fast enough for large multi-track songs in serverless environments (mitigated with S3 caching).

## How to run:

1. clone the repo, `cd` into the directory.
2. Make sure you have [bun](https://bun.sh/) installed.
3. Run the following commands in your terminal:
4. `bun i`
5. `bun dev`

You should see the app running at http://localhost:5173/
