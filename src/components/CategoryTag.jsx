import './CategoryTag.less'

export default function CategoryTag({ name, color, active, pending, disabled, onClick }) {
  return (
    <button
      className={`cat-tag ${active ? 'active' : ''} ${pending ? 'pending' : ''}`}
      style={{ '--cat-color': color }}
      disabled={disabled}
      onClick={onClick}
    >
      {name}
    </button>
  )
}
