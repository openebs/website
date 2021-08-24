export const useCurrentHost = () => {
  const currentOrigin = window && window.location.origin;
  const currentLocation = window && window.location.href;
  const currentPathname = window && window.location.pathname;
  return {
    currentOrigin,
    currentPathname,
    currentLocation,
  };
};
