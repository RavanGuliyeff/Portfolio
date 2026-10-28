# ravanguliyev.dev

Source for my personal site — [www.ravanguliyev.dev](https://www.ravanguliyev.dev).

React 18, TypeScript, Vite, Tailwind CSS, Framer Motion and three.js (via `@react-three/fiber`).

## Running locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run lint
```

## Contact form

The form sends mail through [EmailJS](https://www.emailjs.com). The public IDs are set in
`src/lib/sendMessage.ts` (EmailJS public keys are meant to be used in the browser) and can be
overridden with the variables in `.env.example`. In the EmailJS dashboard, restrict the key to
`ravanguliyev.dev` under Account → Security.

The template can use `{{from_name}}`, `{{from_email}}`, `{{subject}}`, `{{message}}` and
`{{reply_to}}` (set *Reply To* to `{{reply_to}}`). If sending fails, the form offers to open the
visitor's mail app with the message filled in.

## Languages

English, Azerbaijani, Turkish and Russian. All text is in `src/i18n/<lang>.ts`; the language is
picked from the visitor's browser and can be changed from the navbar.

## Analytics

`@vercel/analytics` is included. Turn it on in Vercel → Project → Analytics → Enable.

## Where things are

- `src/constants/portfolio.ts` — links, dates and tech stacks (text lives in `src/i18n/`).
- `src/sections/` — page sections.
- `src/three/` — the hero scene (3D laptop). It loads after the page is idle, only on
  desktop, and stops rendering when scrolled out of view.
- `src/games/` — the arcade. `engine/` has the shared game loop (time-based, so speed doesn't
  depend on the monitor's refresh rate), HiDPI canvas setup, input helpers and UI.
- `public/cv.pdf` — the downloadable CV.
