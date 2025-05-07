# Spotify Playlist Follower

Spotify Playlist Follower is a web application that automatically follows playlists on behalf of authenticated users. It is built with the T3 Stack and the Spotify Web API.

## Features

- Authenticate with Spotify via NextAuth.js using OAuth 2.0
- Browse and search Spotify playlists
- Follow playlists programmatically
- View your followed playlists dashboard
- Schedule automated follow tasks (coming soon)

## Technology Stack

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Getting Started

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   # Update .env with:
   # SPOTIFY_CLIENT_ID=
   # SPOTIFY_CLIENT_SECRET=
   # NEXTAUTH_URL=http://localhost:3000
   # DATABASE_URL=postgresql://<user>:<pass>@localhost:5432/spotify_playlist_follower
   # AUTH_SECRET=<random_string>
   ```

3. Start local development database:
   ```bash
   ./start-database.sh
   ```

4. Push Prisma schema:
   ```bash
   yarn db:push
   ```

5. Run the development server:
   ```bash
   yarn dev
   ```

## Deployment

Deploy using your preferred provider:

- Vercel: https://create.t3.gg/en/deployment/vercel
- Netlify: https://create.t3.gg/en/deployment/netlify
- Docker: https://create.t3.gg/en/deployment/docker

## License

MIT
