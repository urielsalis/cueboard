# Control Board

A Spotify-powered cue board for live events. Create a list of cues — each
pointing to a Spotify track at a specific timestamp — and fire them during
a show. A background playlist fills the gaps between cues.

Everything runs in the browser. No backend, no accounts, no data leaves
your machine.

## Quick start

1. Create a [Spotify Developer App](https://developer.spotify.com/dashboard)
   (see **Setup** below).
2. Open the app and paste your Client ID.
3. Log in with Spotify and start adding cues.

## Setup

You need a free Spotify Developer App:

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Click **Create App**.
3. Set the **Redirect URI** to your deployment URL + `/callback`
   (e.g. `https://you.github.io/controlboard/callback`).
4. Under **APIs**, select **Web API**.
5. Save, then go to **User Management** and add the Spotify accounts that
   will use the app.
6. Copy the **Client ID** and paste it into the app's setup screen.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start development server       |
| `npm run build`    | Build static export to `out/`  |
| `npm run lint`     | Run ESLint                     |
| `npm run format`   | Format code with Prettier      |
| `npm test`         | Run tests                      |

## How it works

- **Cue list** (left panel) — ordered list of cues, each with a Spotify
  track, start/end time, label, and color.
- **Now playing** (right panel) — shows the active cue's countdown and
  progress, or the background playlist state.
- **Background playlist** (bottom-right) — a Spotify playlist that plays
  between cues.

All data is stored in `localStorage`. Clearing browser data resets everything.

## Deployment

The included GitHub Actions workflow builds and deploys to GitHub Pages on
push to `main`. If your repo is not at the root of your GitHub Pages domain,
set `basePath` in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/your-repo-name",
};
```

## License

MIT
