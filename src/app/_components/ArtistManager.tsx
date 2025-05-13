"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/trpc/react";
import { signOut } from "next-auth/react";
import Image from "next/image";

export function ArtistManager() {
  const utils = api.useContext();
  const { data: followed = [], isLoading: isLoadingFollowed, error: errorFollowed } = api.artist.getFollowedArtists.useQuery();
  const { data: playlist = [], isLoading: isLoadingPlaylist, error: errorPlaylist } = api.artist.getPlaylistArtists.useQuery();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [unfollowingIds, setUnfollowingIds] = useState<string[]>([]);
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
    onMutate: (variables) => {
      setUnfollowingIds(prev => [...prev, variables.artistId]);
    },
    onSuccess: async (_data, variables) => {
      await utils.artist.getFollowedArtists.invalidate();
      setUnfollowingIds(prev => prev.filter(id => id !== variables.artistId));
    },
    onError: (_error, variables) => {
      setUnfollowingIds(prev => prev.filter(id => id !== variables.artistId));
    },
  });

  useEffect(() => {
    if (
      errorFollowed instanceof Error && errorFollowed.message.includes('Spotify API unauthorized') ||
      errorPlaylist instanceof Error && errorPlaylist.message.includes('Spotify API unauthorized')
    ) {
      void signOut({ callbackUrl: '/api/auth/signin' });
    }
  }, [errorFollowed, errorPlaylist]);

  if (isLoadingFollowed || isLoadingPlaylist) return <p className="text-xl font-semibold text-white mb-2">Loading artists...</p>;

  const followable = playlist
    .filter((a) => !followed.some((f) => f.id === a.id))
    .filter((a) => !hiddenIds.includes(a.id));

  return (
    <>
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
                  {typeof artist.images[0]?.url === 'string' && (
                    <Image
                      src={artist.images[0].url}
                      alt={artist.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded"
                    />
                  )}
                  <span className="flex-1 text-white break-words" style={{display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                    {artist.name}
                  </span>
                  <button
                    onClick={() => unfollowMutation.mutate({ artistId: artist.id })}
                    disabled={unfollowingIds.includes(artist.id)}
                    className="text-sm bg-[#B3B3B3] text-[black] px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    {unfollowingIds.includes(artist.id)
                      ? "Unfollowing..."
                      : "Unfollow"}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Playlist Artists - Tap to Follow</h2>
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
                      selectedIds.includes(artist.id) ? 'ring-[5px] ring-white' : ''
                    }`}
                    onClick={() =>
                      setSelectedIds((prev) =>
                        prev.includes(artist.id)
                          ? prev.filter((id) => id !== artist.id)
                          : [...prev, artist.id]
                      )
                    }
                  >
                    {typeof artist.images[0]?.url === 'string' && (
                      <Image
                        src={artist.images[0].url}
                        alt={artist.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded"
                      />
                    )}
                    <span className="flex-1 text-white break-words" style={{display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                      {artist.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHiddenIds((h) => [...h, artist.id]);
                      }}
                      className="text-sm text-[black] hover:text-white"
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
            <footer className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black px-6 py-3 rounded-full shadow-lg">
              <button
                onClick={() =>
                  selectedIds.forEach((id) => followMutation.mutate({ artistId: id }))
                }
                disabled={followMutation.status === 'pending'}
                className="rounded-full bg-white px-8 py-2 font-semibold text-black hover:bg-gray-200 follow-button"
              >
                {followMutation.status === 'pending'
                  ? 'Following...'
                  : `Follow ${selectedIds.length} Selected`}
              </button>
            </footer>
          )}
        </section>
      </div>
      <style jsx>{`
        @keyframes colorCycle {  
          0%   { border-color: #B3B3B3; }  
          25%  { border-color: #1db954; }  
          50%  { border-color: black; }  
          75%  { border-color: white; }  
          100% { border-color: #B3B3B3; }  
        }  
        .follow-button {  
          border: 15px solid #B3B3B3;  
          animation: colorCycle 4s linear infinite;  
        }  
      `}</style>
    </>
  );
}
