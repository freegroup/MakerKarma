import './GradientBackground.less'

const PRESETS = {
  rose: {
    background: `
      radial-gradient(ellipse at 40% 30%, rgba(220,140,140,0.2) 0%, transparent 50%),
      linear-gradient(to bottom, #cc8080 0%, #be7e88 30%, #b07a90 55%, #a47898 80%, #987298 100%)
    `,
  },
  teal: {
    background: `
      radial-gradient(ellipse at 45% 25%, rgba(90,170,170,0.3) 0%, transparent 50%),
      linear-gradient(to bottom, #4a9a9a 0%, #347a84 35%, #1e5e6e 65%, #163448 100%)
    `,
  },
  blue: {
    background: `
      radial-gradient(ellipse at 50% 30%, rgba(190,210,240,0.35) 0%, transparent 50%),
      linear-gradient(to bottom, #b0c4de 0%, #94b0d0 35%, #7498c2 65%, #5e82b4 100%)
    `,
  },
  peach: {
    background: `
      radial-gradient(ellipse at 45% 30%, rgba(255,210,180,0.3) 0%, transparent 50%),
      linear-gradient(to bottom, #f0a878 0%, #e8a480 40%, #e0a088 70%, #d89880 100%)
    `,
  },
}

export default function GradientBackground({ preset = 'rose' }) {
  const style = PRESETS[preset] || PRESETS.rose

  return (
    <div className="gradient-bg" style={{ background: style.background }} />
  )
}
