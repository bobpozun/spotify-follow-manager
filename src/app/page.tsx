import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { ArtistManager } from "@/app/_components/ArtistManager";
import { AuthButton } from "@/app/_components/AuthButton";
import Image from "next/image";

export default async function Home() {
  const session = await auth();
  const user = session?.user;
  const userImage = user?.image ?? '';

  return (
    <HydrateClient>
      {user && (
        <nav className="fixed top-0 left-0 w-full h-16 bg-black border-b-2 border-white flex justify-between items-center px-4 z-10">
          <div className="flex items-center space-x-3">
            {userImage && (
              <Image
                src={userImage}
                alt={user?.name ?? ''}
                width={36}
                height={36}
                className="rounded-full"
              />
            )}
            <span className="text-white text-lg font-medium">Welcome, {user?.name}</span>
          </div>
          <AuthButton />
        </nav>
      )}
      <main className={`pt-16 flex min-h-screen flex-col items-center justify-center ${user ? 'bg-[#1DB954]' : 'bg-gradient-to-b from-[#1DB954] to-black'} text-white`}>
        <div className="container flex flex-col items-center justify-center gap-4 px-4 py-16">
          {!user && (
            <>
              <h1 className="text-5xl font-bold mb-4">Spotify Follow Manager</h1>
              <p className="text-xl text-white mb-8 text-center max-w-md">
                Discover and follow unique artists from your playlists.
              </p>
            </>
          )}
          <div className="flex flex-col items-center gap-4">
            {!user && (
              <>
                <p className="text-2xl text-white">Please sign in to continue.</p>
                <AuthButton />
              </>
            )}
          </div>

          {user && <ArtistManager />}
        </div>
      </main>
    </HydrateClient>
  );
}
