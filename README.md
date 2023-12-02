# Songsterr / Ultimate Guitar to Guitar Pro Downloader 🎸

<a href="https://www.buymeacoffee.com/ryanroberts" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" height="41" width="174"></a>

A simple web app I built to quickly download Guitar Pro files (.gpx, .gp5, .gp, etc) from [Songsterr](https://www.songsterr.com/) and [Ultimate Guitar](https://www.ultimate-guitar.com/).

## Current Tech Stack 👨🏻‍💻

Main Tech:

- ♻️ [SvelteKit](https://kit.svelte.dev/) + TypeScript. Using adapter vercel
- 💅🏻 [UnoCSS](https://github.com/unocss/unocss) for styling
- 🔥 [Vercel](https://vercel.com/) for serverless deployment
- 🥫 [AWS S3](https://aws.amazon.com/s3/) + [MongoDB](https://www.mongodb.com/) For storing tabs (Will use as backup in the event Songsterr / UG blocks me).

Extras:

- [HeadlessUI](https://headlessui.com/) for the tab menu
- [xmldom](https://github.com/xmldom/xmldom) A Node implementation of `DomParser()`
- [Prisma](https://www.prisma.io/) Type-safe ORM connected to Mongo
- [Axiom](https://github.com/axiomhq) Open Source monitoring platform that integrates amazingly with Vercel
