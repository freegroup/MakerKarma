import { useMemo } from 'react'
import './BlobBackground.less'

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function generateBlob(index) {
  return {
    top: `${randomBetween(-20, 60)}%`,
    left: `${randomBetween(-20, 80)}%`,
    width: `${randomBetween(40, 70)}%`,
    height: `${randomBetween(40, 80)}%`,
    background: `linear-gradient(${Math.floor(randomBetween(100, 200))}deg, var(--blob-color-${(index % 6) + 1}), var(--blob-color-${((index + 1) % 6) + 1}))`,
    borderRadius: `${randomBetween(30, 60)}% ${randomBetween(40, 70)}% ${randomBetween(30, 70)}% ${randomBetween(30, 60)}% / ${randomBetween(30, 60)}% ${randomBetween(30, 60)}% ${randomBetween(40, 70)}% ${randomBetween(30, 60)}%`,
    opacity: randomBetween(0.08, 0.18),
  }
}

export default function BlobBackground({ count = 2 }) {
  const blobs = useMemo(() => Array.from({ length: count }, (_, i) => generateBlob(i)), [count])

  return (
    <div className="blob-bg">
      {blobs.map((style, i) => (
        <div key={i} className="blob-bg-shape" style={style} />
      ))}
    </div>
  )
}
