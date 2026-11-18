# React + Vite

## Run the app and events API

Install dependencies once with `npm install`, then start both the frontend and
JSON Server with:

```sh
npm run dev:all
```

The frontend requests events from `/api/events`. Vite proxies that request to
JSON Server, which reads and updates `server/db.json` and listens on port `3000`
by default.

To use a different API port, set `API_PORT` for both processes:

```sh
API_PORT=3001 npm run dev:all
```

You can also run only the API with `npm run server` and only the frontend with
`npm run dev`. The direct API endpoint is `http://localhost:3000/events` by
default.

## Deploy to GitHub Pages

Run `npm run deploy` to build the app and publish the `dist` folder to the
`gh-pages` branch. The client uses hash-based routes so direct page navigation
works on GitHub Pages.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
