import { useLocation } from 'react-router-dom';

// hook for getting search params from the URL
const useQuery = () => {
  const location = useLocation();
  return location.pathname;
};

export default useQuery;