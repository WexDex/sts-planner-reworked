# Slay the Spire Combat Planner Reworked

**Live app:** [https://wexdex.github.io/sts-planner-reworked/](https://wexdex.github.io/sts-planner-reworked/)

Plan "unwinnable" Slay the Spire combats like puzzles. Built with [Next.js](https://nextjs.org) ([`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)).

**Projects:** Use **Save project** / **Load project** in the planner header for a full `sts-planner-project` JSON (planner rows + decision timeline + layout). The app restores the last project from `localStorage` when you revisit; there is no bundled default combat on first load—load a project, prior autosave, or combat JSON.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy

The app is deployed to **GitHub Pages** at the link above (static export via `next build`). See [Next.js static exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports) and the workflow in `.github/workflows/deploy-github-pages.yml`.
