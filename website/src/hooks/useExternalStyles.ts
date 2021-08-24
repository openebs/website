import { useEffect } from 'react';

export const useExternalStyles = (href: string) => {
  useEffect(() => {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [href]);
};
