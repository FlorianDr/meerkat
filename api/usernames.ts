import { adjectives, animals } from "./data.ts";

export function generateUsername() {
  const raw = `${adjectives[Math.floor(randomNumber(adjectives.length))]} ${
    animals[randomNumber(animals.length)]
  } ${generateHexSuffix()}`;

  return raw.replace(/ /g, "-");
}

function generateHexSuffix() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(2));

  return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function randomNumber(highest: number) {
  return Math.floor(Math.random() * highest);
}
