import { HTTPError } from "./http-error.ts";

export const extractHTTPError = async (response: Response) => {
  let error: string | undefined;
  try {
    error = await response.text();
  } catch (e) {
    error = undefined;
  }
  return new HTTPError(response, error);
};
