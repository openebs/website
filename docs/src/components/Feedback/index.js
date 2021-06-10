import React, { useEffect, useState } from "react";
import styles from './styles.module.scss';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate, { translate } from '@docusaurus/Translate';

export const Feedback = () => {

    const { siteConfig } = useDocusaurusContext();
    const openAnIssue = siteConfig?.customFields?.externalLinks?.openAnIssue;
    const kubernetesSlackOpenEBS = siteConfig?.customFields?.externalLinks?.kubernetesSlackOpenEBS;
    const [isThanksTextVisible, setThanksTextVisibility] = useState(false); 
    
    const handleResponse = (action, value) => {
        setThanksTextVisibility(true);
        sendFeedback(action,value);
    }

    const handleRouteUpdatedEvent = () => {
        setThanksTextVisibility(false);
    }

    useEffect(() => {
        document.addEventListener('routeupdated', handleRouteUpdatedEvent)
        return () => {
            document.removeEventListener('routeupdated',handleRouteUpdatedEvent)
        } 
    });

    function sendFeedback(action,value) {
        if(typeof window !== undefined) {
            if(!window?.gtag) { 
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
            <h4>
                <Translate
                    id="component.Feedback.heading"
                    description="The heading of feedback widget"
                >Was this page helpful? We appreciate your feedback</Translate>
            </h4>
            <div className={styles.buttonGroup}>
                <button 
                    type="button"
                    className="doc-button doc-button-primary doc-button-curved"
                    aria-label={translate({
                        id: "theme.Feedback.YesButton",
                        message: "Yes",
                        description: "The ARIA label for sending positive response on button click",
                      })}
                    onClick={() => handleResponse("Yes", 1)} disabled={isThanksTextVisible}
                >
                    <Translate
                        id="component.Feedback.Yes"
                        description="Feedback button 'Yes' for positive response"
                    >Yes</Translate>
                </button>
                <button 
                    type="button"
                    className="doc-button doc-button-primary doc-button-curved"
                    aria-label={translate({
                        id: "theme.Feedback.NoButton",
                        message: "No",
                        description: "The ARIA label for sending negative response on button click",
                      })}
                    onClick={() => handleResponse("No", 0)} disabled={isThanksTextVisible}
                >
                    <Translate 
                        id="component.Feedback.No"
                        description="Feedback button 'No' for negative response"
                    >No</Translate>
                </button>
            </div>
            {
                isThanksTextVisible && (
                    <p id="feedback-response" className={`${styles.feedbackResponseHidden} ${isThanksTextVisible && styles.feedbackResponseVisible}`}>Thanks for the feedback. Open an issue in the <a href={openAnIssue} target="_blank" rel="noopener">GitHub repo</a> if you want to report a problem or suggest an improvement. Engage and get additional help on <a href={kubernetesSlackOpenEBS} target="_blank" rel="noopener">{kubernetesSlackOpenEBS}</a>.</p>
                )
            }
           
        </div>
    )
}