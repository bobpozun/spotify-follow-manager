import { TRPCError } from "@trpc/server";

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

export class SpotifyService {
  constructor(private accessToken: string) {}

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${this.accessToken}` } });
    if (!res.ok) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Spotify API error: ${res.statusText}` });
    }
    return res.json() as Promise<T>;
  }

  async getFollowedArtists(): Promise<SpotifyArtist[]> {
    const data = await this.fetchJson<FollowedArtistsResponse>(
      "https://api.spotify.com/v1/me/following?type=artist"
    );
    return data.artists.items;
  }

  async getPlaylistArtists(): Promise<SpotifyArtist[]> {
    const playlistsData = await this.fetchJson<PlaylistsResponse>(
      "https://api.spotify.com/v1/me/playlists"
    );
    const artistSet = new Set<string>();
    for (const playlist of playlistsData.items) {
      try {
        const tracksData = await this.fetchJson<PlaylistTracksResponse>(
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
        const { artists } = await this.fetchJson<{ artists: SpotifyArtist[] }>(
          `https://api.spotify.com/v1/artists?ids=${batch.join(",")}`
        );
        artistDetails.push(...artists);
      } catch {
        // skip batch on error
      }
    }
    return artistDetails;
  }

  async followArtist(artistId: string): Promise<{ success: boolean }> {
    await this.fetchJson<void>(
      `https://api.spotify.com/v1/me/following?type=artist&ids=${artistId}`
    );
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
