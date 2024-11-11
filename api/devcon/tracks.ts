import { DEFAULT_COVER } from "../models/event.ts";

const trackImages: Record<string, string> = {
  "Core Protocol":
    "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/elephant_Core%20Protocol.png?t=2024-10-31T11%3A19%3A34.065Z",
  "Cypherpunk and Privacy":
    "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/gecko_Cypherpunk%20and%20Privacy.png?t=2024-10-31T11%3A19%3A53.391Z",
  "Usability":
    "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/cat_Usability.png?t=2024-10-31T11%3A19%3A03.816Z",
  "Real World Ethereum": "https://supabase.storage.url/track_2_image.jpg",
  "Applied Cryptography":
    "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/owl_Applied%20Cryptography.png?t=2024-10-31T11%3A20%3A31.354Z",
  "Cryptoeconomics":
    "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/hornbill_cryptoeconomics.png?t=2024-10-31T11%3A20%3A07.562Z",
  "Coordination":
    "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/monkey_coordination.png?t=2024-10-31T11%3A20%3A18.568Z",
  "Developer Experience":
    "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/turtle_Developer%20Experience.png?t=2024-10-31T11%3A20%3A53.145Z",
  "Security":
    "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/tiger_Security.png?t=2024-10-31T11%3A20%3A42.924Z",
  "Layer 2s":
    "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/deer_Layer%202s.png?t=2024-10-31T11%3A19%3A20.962Z",
  "Programmable Cryptography":
    "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/frog_CLS_ProgrammableCryptography.png?t=2024-10-31T11%3A19%3A43.212Z",
};

export function getCover(track: string) {
  return trackImages[track] || DEFAULT_COVER;
}
