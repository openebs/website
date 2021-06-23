import { useEffect, useState } from 'react'

export type Status = 'idle' | 'loading' | 'ready' | 'error'
export type ScriptElement = HTMLScriptElement | null

export const useScript = (src: string): Status => {

  const [status, setStatus] = useState<Status>(src ? 'loading' : 'idle')

  useEffect(
    () => {
      if (!src) {
        setStatus('idle')
        return
      }

      let script: ScriptElement = document.querySelector(`script[src="${src}"]`)

      if (!script) {
        script = document.createElement('script')
        script.src = src
        script.async = true
        script.setAttribute('data-status', 'loading')
        document.body.appendChild(script)

        const setAttributeFromEvent = (event: Event) => {
          script?.setAttribute(
            'data-status',
            event.type === 'load' ? 'ready' : 'error',
          )
        }

        script.addEventListener('load', setAttributeFromEvent)
        script.addEventListener('error', setAttributeFromEvent)
      } else {
        setStatus(script.getAttribute('data-status') as Status)
      }

      const setStateFromEvent = (event: Event) => {
        setStatus(event.type === 'load' ? 'ready' : 'error')
      }

      script.addEventListener('load', setStateFromEvent)
      script.addEventListener('error', setStateFromEvent)

      return () => {
        if (script) {
          script.removeEventListener('load', setStateFromEvent)
          script.removeEventListener('error', setStateFromEvent)
          document.body.removeChild(script);
        }
      }
    },
    [src],
  )

  return status
}

