"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session } = useSession();
  const isSignedIn = !!session;
  return (
    <button
      onClick={() =>
        isSignedIn
          ? signOut({ callbackUrl: "/" })
          : signIn("spotify", { callbackUrl: "/" })
      }
      className="rounded-full bg-white px-8 py-2 font-semibold text-black hover:bg-gray-200"
    >
      {isSignedIn ? "Sign out" : "Sign in with Spotify"}
    </button>
  );
}
