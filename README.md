# Songsterr / Ultimate Guitar to Guitar Pro Downloader 🎸

<img src="https://d234wyh4hwmj0y.cloudfront.net/2023/songsterr-downloader/demo.gif">

<a href="https://www.buymeacoffee.com/ryanroberts" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" height="41" width="174"></a>

A simple web app I built to quickly download Guitar Pro files (.gpx, .gp5, .gp, etc) from [Songsterr](https://www.songsterr.com/) and [Ultimate Guitar](https://www.ultimate-guitar.com/).

## Current Tech Stack 👨🏻‍💻

Main Tech:

- ♻️ [SvelteKit](https://kit.svelte.dev/) + TypeScript. Using adapter vercel
- 🔥 [Vercel](https://vercel.com/) for serverless deployment
- 💅🏻 [UnoCSS](https://github.com/unocss/unocss) for styling
- 🏃‍♂️ [Upstash - QStash](https://github.com/upstash/qstash-js) Serverless event service. Used for sending purchased bulk tabs. Has a nice built in retry mechanism.
- 📬 [Sendgrid](https://sendgrid.com/en-us) For sending emails via API, used for the bulk tabs purchase event.
- 🥫 [VercelKV](https://vercel.com/docs/storage/vercel-kv). Easy to use KV storage for caching bulk tabs

NPM Packages:

- [HeadlessUI](https://headlessui.com/) for the tab menu
- [xmldom](https://github.com/xmldom/xmldom) A Node implementation of `DomParser()`
- [Prisma](https://www.prisma.io/) Type-safe ORM connected to Mongo
- [@paypal/paypal-js](https://github.com/paypal/paypal-js) Wrapper for PayPal JS SDK. Used for purchasing bulk tabs
- [Axiom](https://github.com/axiomhq) Open Source monitoring platform that integrates amazingly with Vercel
