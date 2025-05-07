"use client";
import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import ArtistCard from "./ArtistCard";
import { api } from "@/trpc/react";

type ArtistsPageClientProps = object;

export default function ArtistsPageClient(_: ArtistsPageClientProps) {
  const { data: session, status } = useSession();
  const { data: followedArtists = [], isLoading: isLoadingFollowed } =
    api.artist.getFollowedArtists.useQuery(undefined, { enabled: !!session });
  const { data: playlistArtists = [], isLoading: isLoadingPlaylist } =
    api.artist.getPlaylistArtists.useQuery(undefined, { enabled: !!session });
  const [visibleCount, setVisibleCount] = useState<number>(12);

  if (status === "loading") return <p>Loading session...</p>;
  if (!session)
    return (
      <main className="min-h-screen p-8 flex flex-col items-center justify-center">
        <p>Please sign in to view your artists.</p>
        <button
          onClick={() => signIn("spotify")}
          className="mt-4 text-blue-400 hover:underline"
        >
          Sign in with Spotify
        </button>
      </main>
    );
  if (isLoadingFollowed || isLoadingPlaylist) return <p>Loading artists...</p>;

  const visiblePlaylist = playlistArtists.slice(0, visibleCount);

  return (
    <main className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Spotify Artists</h1>
        <button onClick={() => signOut()} className="text-blue-400 hover:underline">
          Sign out
        </button>
      </header>

      <section className="mb-8">
        <h2 className="text-xl mb-2">Followed Artists</h2>
        {followedArtists.length === 0 ? (
          <p>You are not following any artists.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {followedArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} isFollowed />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl mb-2">Playlist Artists</h2>
        {playlistArtists.length === 0 ? (
          <p>No artists found in your playlists.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {visiblePlaylist.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                isFollowed={
                  followedArtists.some((a) => a.id === artist.id)
                }
              />
            ))}
          </ul>
        )}
        {visibleCount < playlistArtists.length && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setVisibleCount(visibleCount + 12)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
