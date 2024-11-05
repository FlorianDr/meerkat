import { crypto } from "@std/crypto";
import { encodeHex } from "@std/encoding";

/**
 * Creates an HMAC signer function using a pre-shared key
 *
 * @param preSharedKey - The secret key used to create HMAC signatures
 * @returns An async function that signs messages using HMAC-SHA256
 *
 * @example
 * ```ts
 * const sign = await createSigner("my-secret-key");
 * const signature = await sign("message-to-sign");
 * ```
 */
export async function createSigner(preSharedKey: string) {
  const keyData = new TextEncoder().encode(preSharedKey);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );

  const signMessage = async (message: string) => {
    const messageData = new TextEncoder().encode(message);
    const signature = await crypto.subtle.sign("HMAC", key, messageData);
    const hash = encodeHex(signature);
    return hash;
  };

  return signMessage;
}
