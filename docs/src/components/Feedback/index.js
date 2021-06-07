import React, { useState } from "react";
import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export const Feedback = () => {

    const { siteConfig } = useDocusaurusContext();
    const openAnIssue = siteConfig?.customFields?.externalLinks?.openAnIssue;
    const kubernetesSlackOpenEBS = siteConfig?.customFields?.externalLinks?.kubernetesSlackOpenEBS;
    const [thanksTextVisibility, setThanksTextVisibility] = useState(false); 
    
    const handlePositiveResponse = () => {
        setThanksTextVisibility(true);
        sendFeedback("Yes", 1);
    }

    const handleNegativeResponse = () => {
        setThanksTextVisibility(true);
        sendFeedback("No", 0);
    }

    function sendFeedback(action,value) {
        if(typeof window !== undefined) {
            if(!window?.gtag) { 
                console.log('!gtag');
                return null;
            }
            window?.gtag('event', action, {
                'event_category': 'Docs:Helpful',
                'event_label': window.location.href,
                'value': value
            });
        }
    }

    return(
        <div className={styles.wrapper}>
            <h4>Was this page helpful? We appreciate your feedback</h4>
            <div className={styles.buttonGroup}>
                <button type="button" className="doc-button doc-button-primary doc-button-curved" onClick={() => handlePositiveResponse()} disabled={thanksTextVisibility}>Yes</button>
                <button type="button" className="doc-button doc-button-outlined doc-button-curved" onClick={() => handleNegativeResponse()} disabled={thanksTextVisibility}>No</button>
            </div>
            {
                thanksTextVisibility && (
                    <p id="feedback-response" className={`${styles.feedbackResponseHidden} ${thanksTextVisibility && styles.feedbackResponseVisible}`}>Thanks for the feedback. Open an issue in the <a href={openAnIssue} target="_blank" rel="noopener">GitHub repo</a> if you want to report a problem or suggest an improvement. Engage and get additional help on <a href={kubernetesSlackOpenEBS} target="_blank" rel="noopener">{kubernetesSlackOpenEBS}</a>.</p>
                )
            }
           
        </div>
    )
}