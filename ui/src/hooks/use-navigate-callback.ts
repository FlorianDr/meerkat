export const useNavigateCallback = (path: string) => {
  const navigate = () => {
    globalThis.history.pushState({}, "", path);
    globalThis.dispatchEvent(new globalThis.Event("popstate"));
  };

  return navigate;
};
