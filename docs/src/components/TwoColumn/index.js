import React from 'react';
import styles from "./styles.module.scss"
export const TwoColumn = ({ children }) => {
    return(
        <div className={styles.twoColumn}>
           {children}
        </div>
    )
}