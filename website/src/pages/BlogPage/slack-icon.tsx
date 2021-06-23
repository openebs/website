import React from "react";
import useStyles from "./style";
import { useScript } from '../../hooks/useScript';

export const SlackIcon: React.FC = () => {
    const classes = useStyles();
    const addThisScript = useScript('//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-60a793659d5a70ad');

    return (addThisScript === 'ready') ? (
        <div className={["addthis_inline_share_toolbox", classes.socialIconButton].join(' ')}></div>) : ( <div className={classes.socialIconButton}></div> 
    )
}