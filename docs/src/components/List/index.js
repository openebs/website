import React from 'react';
import styles from "./styles.module.scss"
export const List = ({ children }) => {
    return(
        <div className={styles.twoColumn}>
           {children}
        </div>
    )
}