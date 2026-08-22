# Music Theory / Journey — GitHub Pages migration proof of concept

This branch package preserves the Journey-capable Manus source and adds an isolated GitHub Pages build path without changing the original Manus-oriented development build.

## Added migration pieces

- `.env.github` sets `VITE_GITHUB_PAGES=true`
- `vite.github.config.ts` builds to `dist-github/` with base `/musicTheory/` and no Manus runtime plugin
- `package.json` adds `pnpm build:github`
- `App.tsx` uses hash routing only in GitHub Pages mode
- Home/Journey navigation uses Wouter `Link` so Explorer ↔ Journey works under hash routing

## Test in Codespaces

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm build:github
pnpm exec vite preview --config vite.github.config.ts --host 0.0.0.0
```

For the preview, open the forwarded Vite preview port. Test both Explorer and Journey before publishing.

## Deployment target

The GitHub Pages build output is `dist-github/`.

Expected public routes after deployment:

- Explorer: `https://kappter.github.io/musicTheory/`
- Journey: `https://kappter.github.io/musicTheory/#/journey`

Do not replace the existing Pages deployment until the preview passes feature-parity checks.
