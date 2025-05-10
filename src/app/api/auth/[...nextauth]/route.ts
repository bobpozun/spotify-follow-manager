import { handlers } from "@/server/auth";

// Use force-dynamic to ensure auth routes always work properly in all environments
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
