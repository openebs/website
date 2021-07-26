import React, { useEffect, useState } from 'react';
import styles from "./styles.module.scss"
import { useViewport } from "../../hooks/useViewport";
// Using `Two Column component`, we can create two column grid in docs md and mdx file
export const TwoColumn = ({ children, left, right }) => {
    const [{ leftColumn, rightColumn }, setValue ] = useState({ leftColumn: left, rightColumn: right });
    const { width } = useViewport();
    useEffect(() => {
        if(width < 540) {
            setValue({ leftColumn: '1fr', rightColumn: '' });
        } else {
            setValue({ leftColumn: left, rightColumn: right });
        }
    }, [leftColumn, rightColumn, width]);

    return(
        <div className={styles.wrapper} style={{ gridTemplateColumns: `${leftColumn} ${rightColumn}`}}>
           {children}
        </div>
    )
}