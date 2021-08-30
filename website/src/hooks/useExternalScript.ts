import { useEffect, useState } from 'react';
import { SCRIPT_STATES } from '../constants';

export type Status = SCRIPT_STATES
export type ScriptElement = HTMLScriptElement | null

export const useExternalScript = (src: string): SCRIPT_STATES => {
  const [status, setStatus] = useState<SCRIPT_STATES>(src ? SCRIPT_STATES.LOADING : SCRIPT_STATES.IDLE);

  useEffect(
    () => {
      if (!src) {
        setStatus(SCRIPT_STATES.IDLE);
        return undefined;
      }

      let script: ScriptElement = document.querySelector(`script[src="${src}"]`);

      if (!script) {
        script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.setAttribute('data-status', SCRIPT_STATES.LOADING);
        document.body.appendChild(script);

        const setAttributeFromEvent = (event: Event) => {
          script?.setAttribute(
            'data-status',
            event.type === 'load' ? SCRIPT_STATES.READY : SCRIPT_STATES.ERROR,
          );
        };

        script.addEventListener('load', setAttributeFromEvent);
        script.addEventListener('error', setAttributeFromEvent);
      } else {
        setStatus(script.getAttribute('data-status') as Status);
      }

      const setStateFromEvent = (event: Event) => {
        setStatus(event.type === 'load' ? SCRIPT_STATES.READY : SCRIPT_STATES.ERROR);
      };

      script.addEventListener('load', setStateFromEvent);
      script.addEventListener('error', setStateFromEvent);
      return () => {
        if (script) {
          script?.removeEventListener('load', setStateFromEvent);
          script?.removeEventListener('error', setStateFromEvent);
        }
      };
    },
    [src],
  );

  return status;
};
