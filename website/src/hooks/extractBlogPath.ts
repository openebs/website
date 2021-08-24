import { useLocation } from 'react-router-dom';

// custom hook for getting blog name from the URL
const useBlogName = () => {
  const location = useLocation();
  return location.pathname.split('/blog/').pop();
};

// custom hook for getting author name from the URL
const useAuthorName = () => {
  const location = useLocation();
  return location.pathname.split('/blog/author/').pop();
};

// custom hook for getting blog tag from the URL
const useTag = () => {
  const location = useLocation();
  return location.pathname.split('/blog/tag/').pop();
};

export { useBlogName, useAuthorName, useTag };
