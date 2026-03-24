import { useMemo } from 'react'
import './BlobBackground.less'

const COLORS = ['#f9a8b8', '#f4766b', '#e8a87c', '#f9c4aa', '#d4b8c4', '#c4cfe0']

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function generateBlob() {
  const c1 = COLORS[Math.floor(Math.random() * COLORS.length)]
  const c2 = COLORS[Math.floor(Math.random() * COLORS.length)]
  return {
    top: `${randomBetween(-20, 60)}%`,
    left: `${randomBetween(-20, 80)}%`,
    width: `${randomBetween(40, 70)}%`,
    height: `${randomBetween(40, 80)}%`,
    background: `linear-gradient(${Math.floor(randomBetween(100, 200))}deg, ${c1}, ${c2})`,
    borderRadius: `${randomBetween(30, 60)}% ${randomBetween(40, 70)}% ${randomBetween(30, 70)}% ${randomBetween(30, 60)}% / ${randomBetween(30, 60)}% ${randomBetween(30, 60)}% ${randomBetween(40, 70)}% ${randomBetween(30, 60)}%`,
    opacity: randomBetween(0.08, 0.18),
  }
}

export default function BlobBackground({ count = 2 }) {
  const blobs = useMemo(() => Array.from({ length: count }, generateBlob), [count])

  return (
    <div className="blob-bg">
      {blobs.map((style, i) => (
        <div key={i} className="blob-bg-shape" style={style} />
      ))}
    </div>
  )
}
