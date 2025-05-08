Project Prompt: Spotify Follow Manager – TypeScript AWS Full Stack App

Please update the spotify-follow-manager project with the following goals:

## Current Architecture

- Next.js + TypeScript + Tailwind CSS + tRPC + Prisma
- Authentication: AWS Cognito via NextAuth's Spotify provider
- API: tRPC routers on AWS Lambda & API Gateway
- Database: Prisma ORM with PostgreSQL
- Spotify API integration with scopes: user-follow-read, playlist-read-private, user-follow-modify

Goals & Features:
	1.	Full TypeScript Conversion:
	•	Convert the entire codebase to TypeScript.
	•	Remove all unnecessary Python files, data, and legacy code.
	2.	Modern Spotify API Integration:
	•	Build a full-stack web app (front end + backend/API) using AWS infrastructure (use your best judgment on services like Lambda, API Gateway, Cognito, etc.).
	•	Use the latest Spotify Web API to:
	•	Authenticate the user with Spotify login.
	•	Fetch and display:
	•	All artists the user currently follows.
	•	All unique artists in the user’s playlists that they don’t follow (no duplicates).
	•	Display each group in its own section.
	3.	User Interaction Flow:
	•	Allow users to:
	•	Select individual or all “unfollowed” artists.
	•	Click a “Follow Artists” button to follow all selected artists at once.
	•	Automatically update the view so followed artists move to the “currently following” section after successful follow.
	4.	Design & UI:
	•	Build as a single-page app (SPA) using (React + Tailwind + tRPC + Prisma).
	•	Use a Spotify-inspired color palette (deep blacks, greens, neon accents).
	•	Design stylish artist cards with good use of imagery, hierarchy, and hover effects.
	•	Maintain a clean, responsive layout – prioritize usability and clarity.

⸻

Recommendations:
	•	State Management: Consider using Zustand or React Query for managing Spotify data cleanly.
	•	Spotify API Scopes: You’ll need user-follow-read, playlist-read-private, and user-follow-modify.
	•	Caching: Use Redis (via ElastiCache or local dev) if performance becomes a concern when scanning large libraries.
	•	Auth: AWS Cognito + Spotify OAuth dance works well, but Supabase Auth could also be a smoother alt if you want to go lighter than full AWS auth.


Rough plan:

Scaffold a Next.js + TypeScript project with Tailwind, tRPC & Prisma.
Configure AWS Cognito for Spotify OAuth and tie into NextAuth (or a direct tRPC auth layer).
Build tRPC routers to fetch followed vs. playlist-only artists, and a mutation to follow artists.
Create React pages/components to display “Following” vs. “To Follow” lists, with multi-select cards and a “Follow Artists” button that calls your backend.
Update README, env docs, and CI scripts.
Handle auth via NextAuth’s Spotify provider
