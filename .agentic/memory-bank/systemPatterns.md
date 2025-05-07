System Patterns: Architecture Decisions and Component Interactions

- Frontend SPA: Next.js (React) with Tailwind CSS
- Component-driven UI: CardList, ArtistCard, MultiSelect controls, FollowButton
- Data Fetching: tRPC routers:
  - `getFollowedArtists`
  - `getPlaylistUniqueArtists`
  - `followArtists` mutation
- Auth Flow: AWS Cognito for user management + Spotify OAuth via NextAuth provider
- Backend Services: API Gateway + Lambda powering tRPC endpoints
- Data Layer: Prisma ORM with PostgreSQL for user and artist data
- Service Abstraction: `SpotifyService` class for API calls, error handling, rate-limiting
- State Management: React Query or Zustand for client-side caching and optimistic updates
- Caching Pattern: Redis (ElastiCache) for large dataset support