"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function ArtistManager() {
  const utils = api.useContext();
  const { data: followed = [], isLoading: isLoadingFollowed } = api.artist.getFollowedArtists.useQuery();
  const { data: playlist = [], isLoading: isLoadingPlaylist } = api.artist.getPlaylistArtists.useQuery();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const followMutation = api.artist.followArtist.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.artist.getFollowedArtists.invalidate(),
        utils.artist.getPlaylistArtists.invalidate(),
      ]);
      setSelectedIds([]);
    },
  });

  if (isLoadingFollowed || isLoadingPlaylist) return <p>Loading artists...</p>;

  const followable = playlist.filter((a) => !followed.some((f) => f.id === a.id));

  return (
    <div className="w-full max-w-xl space-y-6">
      <section>
        <h2 className="text-xl font-semibold text-white mb-2">Followed Artists</h2>
        <ul className="grid grid-cols-2 gap-4">
          {followed.map((artist) => (
            <li key={artist.id} className="truncate">
              {artist.name}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-2">Artists in Your Playlists</h2>
        {followable.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 gap-4">
              {followable.map((artist) => (
                <label key={artist.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={artist.id}
                    checked={selectedIds.includes(artist.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds((prev) => [...prev, artist.id]);
                      } else {
                        setSelectedIds((prev) => prev.filter((id) => id !== artist.id));
                      }
                    }}
                    className="accent-purple-500"
                  />
                  <span className="truncate">{artist.name}</span>
                </label>
              ))}
            </div>
            <button
              onClick={async () => {
                try {
                  await Promise.all(
                    selectedIds.map((id) =>
                      followMutation.mutateAsync({ artistId: id })
                    )
                  );
                } catch (error: unknown) {
                  console.error("Error following artists:", error);
                }
              }}
              disabled={selectedIds.length === 0 || followMutation.status === "pending"}
              className="mt-4 rounded-full bg-white/10 px-5 py-2 font-semibold text-white hover:bg-white/20 disabled:opacity-50"
            >
              {followMutation.status === "pending"
                ? "Following..."
                : `Follow ${selectedIds.length} selected`}
            </button>
          </div>
        ) : (
          <p>No new artists to follow</p>
        )}
      </section>
    </div>
  );
}
