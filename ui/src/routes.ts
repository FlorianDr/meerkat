// Helper function to preserve query parameters
const withQuery = (path: string) => {
  const currentUrl = new URL(globalThis.location.href);
  const newUrl = new URL(path, globalThis.location.origin);
  newUrl.search = currentUrl.search;
  return newUrl.pathname + newUrl.search;
};

export const remote = (uid: string) => withQuery(`/e/${uid}/remote`);
export const qa = (uid: string) => withQuery(`/e/${uid}/qa`);
export const card = (uid: string) => withQuery(`/e/${uid}/card`);
export const feedback = (uid: string) => withQuery(`/e/${uid}/feedback`);
