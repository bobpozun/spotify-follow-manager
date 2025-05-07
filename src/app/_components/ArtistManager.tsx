"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/trpc/react";

export function ArtistManager() {
  const utils = api.useContext();
  const { data: followed = [], isLoading: isLoadingFollowed } = api.artist.getFollowedArtists.useQuery();
  const { data: playlist = [], isLoading: isLoadingPlaylist } = api.artist.getPlaylistArtists.useQuery();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const followMutation = api.artist.followArtist.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.artist.getFollowedArtists.invalidate(),
        utils.artist.getPlaylistArtists.invalidate(),
      ]);
      setSelectedIds([]);
    },
  });
  const unfollowMutation = api.artist.unfollowArtist.useMutation({
    onSuccess: async () => {
      await utils.artist.getFollowedArtists.invalidate();
    },
  });

  if (isLoadingFollowed || isLoadingPlaylist) return <p>Loading artists...</p>;

  const followable = playlist
    .filter((a) => !followed.some((f) => f.id === a.id))
    .filter((a) => !hiddenIds.includes(a.id));

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      <section>
        <h2 className="text-xl font-semibold text-white mb-2">Followed Artists</h2>
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {followed.map((artist) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                layout
                className="flex items-center bg-white/10 p-4 rounded-lg space-x-4"
              >
                <img
                  src={artist.images[0]?.url}
                  alt={artist.name}
                  className="w-12 h-12 rounded"
                />
                <span className="flex-1 text-white break-words" style={{display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                  {artist.name}
                </span>
                <button
                  onClick={() => unfollowMutation.mutate({ artistId: artist.id })}
                  disabled={unfollowMutation.status === "pending"}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {unfollowMutation.status === "pending"
                    ? "Unfollowing..."
                    : "Unfollow"}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-2">Artists in Your Playlists</h2>
        {followable.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {followable.map((artist) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  layout
                  className={`relative flex items-center bg-white/10 p-4 rounded-lg space-x-4 cursor-pointer transition-all ${
                    selectedIds.includes(artist.id) ? 'ring-2 ring-green-400' : ''
                  }`}
                  onClick={() =>
                    setSelectedIds((prev) =>
                      prev.includes(artist.id)
                        ? prev.filter((id) => id !== artist.id)
                        : [...prev, artist.id]
                    )
                  }
                >
                  <img
                    src={artist.images[0]?.url}
                    alt={artist.name}
                    className="w-12 h-12 rounded"
                  />
                  <span className="flex-1 text-white break-words" style={{display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                    {artist.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHiddenIds((h) => [...h, artist.id]);
                    }}
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    Hide
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-gray-400">No new artists to follow</p>
        )}
        {selectedIds.length > 0 && (
          <footer className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 px-6 py-3 rounded-full shadow-lg">
            <button
              onClick={() =>
                selectedIds.forEach((id) => followMutation.mutate({ artistId: id }))
              }
              disabled={followMutation.status === 'pending'}
              className="text-black font-bold text-lg"
            >
              {followMutation.status === 'pending'
                ? 'Following...'
                : `Follow ${selectedIds.length} Selected`}
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}
