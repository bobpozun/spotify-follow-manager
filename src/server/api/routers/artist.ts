// removed unused TRPCError
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { SpotifyService } from "@/server/services/spotifyService";

/**
 * Routes related to Spotify artists.
 */
export const artistRouter = createTRPCRouter({
  /**
   * Fetch artists the authenticated user is following on Spotify.
   */
  getFollowedArtists: protectedProcedure.query(async ({ ctx }) => {
    const service = new SpotifyService(ctx.session.accessToken);
    return service.getFollowedArtists();
  }),

  /**
   * Fetch unique artist IDs from the user's playlists.
   */
  getPlaylistArtists: protectedProcedure.query(async ({ ctx }) => {
    const service = new SpotifyService(ctx.session.accessToken);
    return service.getPlaylistArtists();
  }),

  /**
   * Follow an artist
   */
  followArtist: protectedProcedure
    .input(z.object({ artistId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const service = new SpotifyService(ctx.session.accessToken);
      return service.followArtist(input.artistId);
    }),

  /**
   * Unfollow an artist
   */
  unfollowArtist: protectedProcedure
    .input(z.object({ artistId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const service = new SpotifyService(ctx.session.accessToken);
      return service.unfollowArtist(input.artistId);
    }),
});
