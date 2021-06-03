import { useState, useEffect } from "react";

export const useViewport = () => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if(typeof window !== undefined) {
            function handleWindowWidth() {
                setWidth(window.innerWidth)
            };

            window.addEventListener('load', handleWindowWidth);
            window.addEventListener('resize', handleWindowWidth);

            handleWindowWidth(); 

            return () => {
                window.removeEventListener('load', handleWindowWidth);
                window.removeEventListener('resize', handleWindowWidth);
            }
        }
    }, []);

    return { width }
}