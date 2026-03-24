import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../store/authStore'
import { CATEGORIES } from '../types'
import { ArrowLeft, Camera, X } from 'lucide-react'
import './CreateTaskPage.less'

async function fetchCategories() {
  const res = await apiFetch('/api/labels/categories')
  if (!res) return []
  return res.json()
}

async function fetchPointsLabels() {
  const res = await apiFetch('/api/labels/points')
  if (!res) return [1, 2, 3, 5, 8, 13]
  return res.json()
}

async function createTask(data) {
  const res = await apiFetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res || !res.ok) throw new Error('Fehler beim Erstellen')
  return res.json()
}

function compressImage(file, maxWidth = 800) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxWidth / img.width, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function CreateTaskPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileRef = useRef()

  const { data: categories = [] } = useQuery({
    queryKey: ['category-labels'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30,
  })

  const { data: pointsOptions = [] } = useQuery({
    queryKey: ['points-labels'],
    queryFn: fetchPointsLabels,
    staleTime: 1000 * 60 * 30, // cache 30 min
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [points, setPoints] = useState(1)
  const [photo, setPhoto] = useState(null)

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      navigate('/', { replace: true })
    },
  })

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setPhoto(compressed)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return

    let body = description
    if (photo) {
      body = `${description}\n\n![Foto](${photo})`
    }

    mutation.mutate({
      title: title.trim(),
      description: body,
      category,
      points,
    })
  }

  return (
    <div className="create">
      <button className="create-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Zurück
      </button>

      <h2 className="create-title">Neue Aufgabe</h2>

      <form className="create-form" onSubmit={handleSubmit}>
        <input
          className="create-input"
          type="text"
          placeholder="Titel der Aufgabe"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <textarea
          className="create-textarea"
          placeholder="Beschreibung (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="create-field">
          <label>Kategorie</label>
          <div className="create-categories">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                className={`create-cat ${category === cat.key ? 'active' : ''}`}
                style={{ '--cat-color': cat.color }}
                onClick={() => setCategory(cat.key)}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="create-field">
          <label>Punkte</label>
          <div className="create-points">
            {pointsOptions.map((p) => (
              <button
                key={p}
                type="button"
                className={`create-point ${points === p ? 'active' : ''}`}
                onClick={() => setPoints(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="create-field">
          <label>Foto (optional)</label>
          {photo ? (
            <div className="create-photo-preview">
              <img src={photo} alt="Vorschau" />
              <button type="button" className="create-photo-remove" onClick={() => setPhoto(null)}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <button type="button" className="create-photo-btn" onClick={() => fileRef.current?.click()}>
              <Camera size={20} /> Foto aufnehmen
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            hidden
          />
        </div>

        <button
          className="create-submit"
          type="submit"
          disabled={!title.trim() || mutation.isPending}
        >
          {mutation.isPending ? 'Wird erstellt...' : 'Aufgabe erstellen'}
        </button>

        {mutation.isError && (
          <p className="create-error">{mutation.error.message}</p>
        )}
      </form>
    </div>
  )
}
