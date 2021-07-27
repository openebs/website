import { useLocation } from 'react-router-dom';

// custom hook for getting blog name from the URL
const useBlogName = () => {
  const location = useLocation();
  return location.pathname.split("/blog/").pop();
};

// custom hook for getting author name from the URL
const useAuthorName = () => {
  const location = useLocation();
  return location.pathname.split("/blog/author/").pop();
};

export { useBlogName, useAuthorName };