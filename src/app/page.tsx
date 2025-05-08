import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { ArtistManager } from "@/app/_components/ArtistManager";
import { AuthButton } from "@/app/_components/AuthButton";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1DB954] to-black text-white">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 py-16">
          <h1 className="text-5xl font-bold mb-4">Spotify Follow Manager</h1>
          <p className="text-xl text-white mb-8 text-center max-w-md">
            Discover and follow unique artists from your playlists.
          </p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {session?.user
                ? `Welcome, ${session.user.name}!`
                : "Please sign in to continue."}
            </p>
            <div className="flex flex-col items-center justify-center gap-4">
              <AuthButton />
            </div>
          </div>

          {session?.user && <ArtistManager />}
        </div>
      </main>
    </HydrateClient>
  );
}
