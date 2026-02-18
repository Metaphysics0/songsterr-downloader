# Songsterr / Ultimate Guitar to Guitar Pro Downloader 🎸

This is a simple web app I built to quickly download Guitar Pro files (.gpx, .gp5, .gp, etc) from [Songsterr](https://www.songsterr.com/).

## Download Support Status (Current Challenges) Feb 18 2026

Songsterr downloads are no longer reliably available as direct Guitar Pro source links for every tab, so the project is moving to a conversion flow:

1. parse Songsterr page state
2. fetch per-part CDN revision JSON payloads export GP7 via alphaTab.
3. trigger client side download with the merged gp7 tab

Main challenges right now:

- Mapping Songsterr notation/effects to GP with high fidelity (some effects are still best-effort).
- Handling occasional missing/failed per-part CDN revision requests.
- Keeping conversion fast enough for large multi-track songs in serverless environments (mitigated with S3 caching).

<img src="https://d234wyh4hwmj0y.cloudfront.net/2023/songsterr-downloader/demo.gif">

## Current Tech Stack (Updated Feb 2026)

Main Tech:

- ♻️ [SvelteKit](https://kit.svelte.dev/) for the web app. Svelte is the best
- 🔥 [Vercel](https://vercel.com/) for hosting + CI/CD.
- 🎸 [AlphaTab](https://www.alphatab.net/) for gp tab conversion
- 🥫 [Aws S3] - Basically storing every succesful tab in a bucket and retrieving from there-- in case songsterr goes down, I'll have a small a small inventory of tabs to deliver to users.
- 💅🏻 [UnoCSS](https://github.com/unocss/unocss) for styling
