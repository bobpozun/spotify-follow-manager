import NextAuth from "next-auth";
import { cache } from "react";
import { authConfig } from "./config";

// Use the direct authConfig for all environments
const authProvider = NextAuth(authConfig);

const { auth: uncachedAuth, handlers, signIn, signOut } = authProvider;

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
