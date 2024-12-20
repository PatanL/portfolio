// Types
import type { RootState } from 'store'

// Styles
import style from './index.module.css'

// Utils
import cn from 'classnames'

// Hooks
import { useSelector } from 'react-redux'
import { useCallback, useState } from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const links = [
  { code: '𝕏', label: '𝕏', link: 'https://x.com/neuro_waves' },
  { code: 'CA', label: 'CA', action: 'copy', textToCopy: 'TBD' }
]

const LangSwitch = () => {
  const { app, menu } = useSelector((state: RootState) => ({
    app: state.app,
    menu: state.menu
  }))
  const [isReady, setIsReady] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null) // Track which button was clicked
  const location = useLocation()

  useEffect(() => {
    if (app.ready) {
      setTimeout(() => {
        setIsReady(true)
      }, 3500)
    }
  }, [app.ready])

  const isHome = location.pathname === '/'

  const classes = cn(style.root, {
    [style.hidden]: !isReady || menu.open,
    [style.dark]: !isHome
  })

  const handleCopy = useCallback((code: string, text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedCode(code) // Track the copied button
        setTimeout(() => setCopiedCode(null), 2000) // Reset after 2 seconds
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }, [])

  return (
    <div className={classes}>
      {links.map(({ code, label, link, action, textToCopy }) => {
        if (action === 'copy') {
          return (
            <button
              key={code}
              className={cn(style.button, {
                [style.active]: code === app.language // Adjust logic as per your state
              })}
              onClick={() => handleCopy(code, textToCopy || '')}
            >
              <span className={style.label}>
                {copiedCode === code ? (
                  <>
                    <span>Copied</span> {/* Replace text with "Copied" */}
                    <span className={style.checkmark}>✔</span> {/* Add a checkmark */}
                  </>
                ) : (
                  <>
                    <span>{label}</span> {/* Default label */}
                  </>
                )}
              </span>
              <span className={style.marker} />
            </button>
          )
        }

        return (
          <a
            key={code}
            href={link}
            target="_blank" // Opens the link in a new tab
            rel="noopener noreferrer" // For security (prevents tab hijacking)
            className={cn(style.button, {
              [style.active]: code === app.language // Adjust logic as per your state
            })}
          >
            <span className={style.label}>
              <span>{label}</span>
            </span>
            <span className={style.marker} />
          </a>
        )
      })}
    </div>
  )
}

export default LangSwitch
