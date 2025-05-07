import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

// Type definitions for Spotify API responses
export interface SpotifyArtist {
  id: string;
  name: string;
}

interface FollowedArtistsResponse {
  artists: { items: SpotifyArtist[] };
}

interface PlaylistsResponse {
  items: { id: string }[];
}

interface PlaylistTracksResponse {
  items: { track: { artists: { id: string }[] } }[];
}

/**
 * Routes related to Spotify artists.
 */
export const artistRouter = createTRPCRouter({
  /**
   * Fetch artists the authenticated user is following on Spotify.
   */
  getFollowedArtists: protectedProcedure.query(async ({ ctx }) => {
    const accessToken = ctx.session.accessToken;
    const response = await fetch(
      "https://api.spotify.com/v1/me/following?type=artist",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!response.ok) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to fetch followed artists",
      });
    }
    const data = (await response.json()) as FollowedArtistsResponse;
    return data.artists.items;
  }),

  /**
   * Fetch unique artist IDs from the user's playlists.
   */
  getPlaylistArtists: protectedProcedure.query(async ({ ctx }) => {
    const accessToken = ctx.session.accessToken;
    try {
      const playlistsRes = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!playlistsRes.ok) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to fetch playlists" });
      }
      const playlistsData = (await playlistsRes.json()) as PlaylistsResponse;
      const artistSet = new Set<string>();

      for (const playlist of playlistsData.items) {
        const tracksRes = await fetch(
          `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!tracksRes.ok) continue;
        const tracksData = (await tracksRes.json()) as PlaylistTracksResponse;
        tracksData.items.forEach((item) => item.track.artists.forEach((a) => artistSet.add(a.id))); 
      }

      const allIds = Array.from(artistSet);
      const artistDetails: SpotifyArtist[] = [];
      for (let i = 0; i < allIds.length; i += 50) {
        const batch = allIds.slice(i, i + 50);
        const res = await fetch(
          `https://api.spotify.com/v1/artists?ids=${batch.join(",")}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) {
          console.error(`Failed to fetch artist details for ids: ${batch.join(",")}`, res.statusText);
          continue;
        }
        const data = (await res.json()) as { artists: SpotifyArtist[] };
        artistDetails.push(...data.artists);
      }
      return artistDetails;
    } catch (error) {
      console.error("Error in getPlaylistArtists:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch playlist artists" });
    }
  }),

  /**
   * Follow an artist
   */
  followArtist: protectedProcedure
    .input(z.object({ artistId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const accessToken = ctx.session.accessToken;
      const res = await fetch(`https://api.spotify.com/v1/me/following?type=artist&ids=${input.artistId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to follow artist" });
      return { success: true };
    }),

  /**
   * Unfollow an artist
   */
  unfollowArtist: protectedProcedure
    .input(z.object({ artistId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const accessToken = ctx.session.accessToken;
      const res = await fetch(`https://api.spotify.com/v1/me/following?type=artist&ids=${input.artistId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to unfollow artist" });
      return { success: true };
    }),
});
