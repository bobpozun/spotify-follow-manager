Product Context: Spotify Playlist Follower

- Problem: Users need an easy way to follow artists found in their playlists that they don’t already follow.
- User Needs:
  - View "Currently Following" artists
  - Discover unique playlist artists not yet followed
  - Select multiple artists and follow in bulk
  - Real-time UI updates on follow actions
- Experience Goals:
  - Clear section separation
  - Fast, responsive interface
  - Familiar Spotify-inspired design
- UI Goals & Plan:
  1. Fetch & display full followed artists list (handle Spotify pagination)
  2. Render artist cards with image, name, and action buttons
      - Followed Artists: show Unfollow button
      - Playlist Artists: show Hide button, click card to select/deselect
  3. Replace checkboxes with clickable card selection states
  4. Add floating footer with "Follow X Selected" button fixed at bottom
  5. On follow/unfollow, animate card sliding between sections
  6. Maintain client state (hidden, selected) for responsive UX
  7. Update tRPC & SpotifyService to support pagination & data mapping