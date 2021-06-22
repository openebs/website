import React from "react";
import { useLocation } from "react-router-dom";
import { AsciinemaScriptsAndLinks } from "./asciinema";
import { AddThisScript } from "./addthis";
export const External: React.FC  = () => {
    const location = useLocation();
   
    if(location.pathname === '/') {
        return(
            <AsciinemaScriptsAndLinks />
        )
    }
    if(location.pathname.match('/blog')) {
        <AddThisScript />
    }
    return(<></>);
}