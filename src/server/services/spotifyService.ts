import { TRPCError } from "@trpc/server";

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
}

interface FollowedArtistsResponse {
  artists: { items: SpotifyArtist[]; next: string | null };
}
interface PlaylistsResponse {
  items: { id: string }[];
}
interface PlaylistTracksResponse {
  items: { track: { artists: { id: string }[] } }[];
}

export class SpotifyService {
  constructor(private accessToken: string) {}

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${this.accessToken}` } });
    if (res.status === 401) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Spotify API unauthorized. Please reauthenticate." });
    }
    if (!res.ok) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Spotify API error: ${res.statusText}` });
    }
    return res.json() as Promise<T>;
  }

  async getFollowedArtists(): Promise<SpotifyArtist[]> {
    const limit = 50;
    const artists: SpotifyArtist[] = [];
    let nextUrl: string | null = `https://api.spotify.com/v1/me/following?type=artist&limit=${limit}`;
    while (nextUrl) {
      const page: FollowedArtistsResponse = await this.fetchJson<FollowedArtistsResponse>(nextUrl);
      artists.push(...page.artists.items);
      nextUrl = page.artists.next;
    }
    return artists;
  }

  async getPlaylistArtists(): Promise<SpotifyArtist[]> {
    const playlistsData: PlaylistsResponse = await this.fetchJson<PlaylistsResponse>(
      "https://api.spotify.com/v1/me/playlists"
    );
    const artistSet = new Set<string>();
    for (const playlist of playlistsData.items) {
      try {
        const tracksData: PlaylistTracksResponse = await this.fetchJson<PlaylistTracksResponse>(
          `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`
        );
        tracksData.items.forEach(item => item.track.artists.forEach(a => artistSet.add(a.id)));
      } catch {
        // skip errors
      }
    }
    const allIds = Array.from(artistSet);
    const artistDetails: SpotifyArtist[] = [];
    for (let i = 0; i < allIds.length; i += 50) {
      const batch = allIds.slice(i, i + 50);
      try {
        const batchResponse: { artists: SpotifyArtist[] } = await this.fetchJson<{ artists: SpotifyArtist[] }>(
          `https://api.spotify.com/v1/artists?ids=${batch.join(",")}`
        );
        artistDetails.push(...batchResponse.artists);
      } catch {
        // skip batch on error
      }
    }
    return artistDetails;
  }

  async followArtist(artistId: string): Promise<{ success: boolean }> {
    const res = await fetch(
      `https://api.spotify.com/v1/me/following?type=artist&ids=${artistId}`,
      { method: "PUT", headers: { Authorization: `Bearer ${this.accessToken}` } }
    );
    if (!res.ok) throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to follow artist" });
    return { success: true };
  }

  async unfollowArtist(artistId: string): Promise<{ success: boolean }> {
    const res = await fetch(
      `https://api.spotify.com/v1/me/following?type=artist&ids=${artistId}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${this.accessToken}` } }
    );
    if (!res.ok) throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to unfollow artist" });
    return { success: true };
  }
}
