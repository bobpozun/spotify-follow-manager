"use client";
import React from "react";
import { api } from "@/trpc/react";
import type { SpotifyArtist } from "@/server/api/routers/artist";

type ArtistCardProps = {
  artist: SpotifyArtist;
  isFollowed: boolean;
};

export default function ArtistCard({ artist, isFollowed }: ArtistCardProps) {
  const followMutation = api.artist.followArtist.useMutation();
  const unfollowMutation = api.artist.unfollowArtist.useMutation();

  const handleAction = async () => {
    if (isFollowed) {
      await unfollowMutation.mutateAsync({ artistId: artist.id });
    } else {
      await followMutation.mutateAsync({ artistId: artist.id });
    }
    window.location.reload();
  };

  return (
    <li className="p-4 border rounded hover:shadow flex flex-col items-start">
      <p className="font-medium mb-2">{artist.name}</p>
      <button
        onClick={handleAction}
        className={`px-3 py-1 rounded ${
          isFollowed
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-green-500 text-white hover:bg-green-600"
        }`}
      >
        {isFollowed ? "Unfollow" : "Follow"}
      </button>
    </li>
  );
}
