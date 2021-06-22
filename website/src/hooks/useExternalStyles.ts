import { useEffect } from "react";

export const useExternalStyles = (href: string,) => {
    useEffect(() => {
        const link = document.createElement('link');
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = href;
        document.body.appendChild(link);

        return () => {
            document.body.removeChild(link);
        }
    }, [href]);
}

