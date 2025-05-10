import { handlers } from "@/server/auth";

// Required for static export compatibility
export const dynamic = "force-static";
export const runtime = "edge";

export const { GET, POST } = handlers;
