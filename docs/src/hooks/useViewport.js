import { useState, useEffect } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export const useViewport = () => {
    const { siteConfig } = useDocusaurusContext();
    const breakpoints = siteConfig?.customFields?.breakpoints;
    const [width, setWidth] = useState(breakpoints.lg);

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