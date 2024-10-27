import env from "../env.ts";

export const config = {
  zupassUrl: env.zupassUrl,
  zappName: env.zappName,
  posthogToken: env.posthogToken,
  supabaseUrl: env.supabaseUrl,
  supabaseAnonKey: env.supabaseAnonKey,
};
