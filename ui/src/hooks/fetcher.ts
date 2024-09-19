import { HTTPError } from "./http-error.ts";

export const fetcher = async (endpoint: string) => {
  const res = await fetch(endpoint, {
    headers: {
      "accept": "application/json",
    },
  });
  if (!res.ok) {
    throw new HTTPError(res);
  }
  return res.json();
};
