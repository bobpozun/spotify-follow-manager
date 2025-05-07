import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { ArtistManager } from "@/app/_components/ArtistManager";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1DB954] to-black text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-bold mb-4">Spotify Artist Follower</h1>
          <p className="text-lg text-gray-200 mb-8 text-center max-w-md">
            Discover and follow unique artists from your playlists.
          </p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {session?.user
                ? `Welcome, ${session.user.name}!`
                : "Please sign in to continue."}
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <a
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white px-8 py-2 font-semibold text-black hover:bg-gray-200"
              >
                {session ? "Sign out" : "Sign in with Spotify"}
              </a>
            </div>
          </div>

          {session?.user && <ArtistManager />}
        </div>
      </main>
    </HydrateClient>
  );
}
