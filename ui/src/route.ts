const routeRegex = /\/events\/(?<uid>[^/]+)\/qa/;

export const parseUid = (url: URL) => {
  const match = routeRegex.exec(url.pathname);
  return match?.groups?.uid;
};
