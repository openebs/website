import React from "react";
import styles from './styles.module.css';
export const Feedback = () => {
    return(
        <div className={styles.wrapper}>
            <h4>Was this page helpful? We appreciate your feedback</h4>
            <div className={styles.buttonGroup}>
                <button className="doc-button doc-button-primary doc-button-curved">Yes</button>
                <button className="doc-button doc-button-outlined doc-button-curved">No</button>
            </div>
        </div>
    )
}