import React from "react";
import { Helmet as ReactHelmet } from "react-helmet-async";
import { useLocation } from "react-router";
export const Helmet: React.FC  = () => {
    const location = useLocation();
    return(
        <ReactHelmet>
            {
                (location.pathname === '/') ? (
                    <>
                    <link rel="stylesheet" type="text/css" href="css/asciinema-player.css" />
                    <link rel="stylesheet" type="text/css" href="css/custom-asciinema-player.css" />
                    </>
                ) : <></>
            }
            <script src="js/asciinema-player.js"></script>
            <script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-60a793659d5a70ad"></script>
        </ReactHelmet>
    );

}