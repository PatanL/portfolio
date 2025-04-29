// Types
import type { RootState } from 'store'

// Style
import style from './index.module.css'

// Utils
import cn from 'classnames'

// Hooks
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

function AudioWave() {
  const dispatch = useDispatch()
  const { app, audio } = useSelector((state: RootState) => ({
    app: state.app,
    audio: state.audio
  }))

  const muteHandler = useCallback(() => {
    if (audio.mute) {
      dispatch.audio.unmute()
    } else {
      dispatch.audio.mute()
    }
  }, [audio.mute, dispatch.audio])

  const overHandler = useCallback(() => {
    if (!app.ready) return
    dispatch.pointer.setType('hover')
  }, [app.ready, dispatch.pointer])

  const outHandler = useCallback(() => {
    if (!app.ready) return
    dispatch.pointer.setType('default')
  }, [app.ready, dispatch.pointer])

  const classes = cn(style.root, {
    [style.hidden]: !app.ready
  })

  return (
    <button
      className={classes}
      onMouseEnter={overHandler}
      onMouseLeave={outHandler}
    >
      <div className={style.wave} onClick={muteHandler}>
        <div className={style.bar} />
        <div className={style.bar} />
        <div className={style.bar} />
        <div className={style.bar} />
        <div className={style.bar} />
      </div>
    </button>
  )
}

export default AudioWave