import { useState, useEffect } from 'react'
import './Toast.less'

export default function Toast({ message, duration = 4000, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDone?.(), 500)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onDone])

  return (
    <div className={`toast ${visible ? 'toast--enter' : 'toast--exit'}`}>
      {message}
    </div>
  )
}
