import { HTTPError } from "./http-error.ts";

export const fetcher = (endpoint: string) =>
  fetch(endpoint).then((res) => {
    if (!res.ok) {
      throw new HTTPError(res);
    }
    return res.json();
  });
