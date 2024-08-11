/**
 * Generates a random BigInt using the crypto.getRandomValues method.
 *
 * @returns A random BigInt value.
 *
 * @remarks
 * This function generates a random BigInt by using the crypto.getRandomValues method to obtain 128 bits of randomness.
 *
 * @example
 * ```typescript
 * const randomValue = randomBigInt();
 * console.log(randomValue); // Output: 12345678901234567890n
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues}
 */
export function randomBigInt() {
  const array = new Uint32Array(4); // 4 * 32 bits = 128 bits of randomness
  crypto.getRandomValues(array);
  let randomBigInt = BigInt(0);
  for (let i = 0; i < array.length; i++) {
    randomBigInt = (randomBigInt << 32n) | BigInt(array[i]);
  }
  return randomBigInt;
}
