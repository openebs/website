import { useEffect } from "react";

export const useScript = (url: string, isAsync?: boolean) => {
    useEffect(() => {
        const script = document.createElement('script');
        script.type = "text/javascript";
        script.src = url;
        script.async = isAsync || false;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, [url, isAsync]);
}

