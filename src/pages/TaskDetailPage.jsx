import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../store/authStore'
import Markdown from 'react-markdown'
import AppHeader from '../components/AppHeader'
import PageLayout from '../components/PageLayout'
import Toast from '../components/Toast'
import confetti from 'canvas-confetti'
import QRCode from 'qrcode'
import greetings from '../greetings.json'
import karmaMotivation from '../greetings-karma.json'
import { ArrowLeft, Star, Clock, Check, Send, Camera, QrCode, Share2, Link2 } from 'lucide-react'
import './TaskDetailPage.less'

async function fetchCategories() {
  const res = await apiFetch('/api/labels/categories')
  if (!res) return []
  return res.json()
}

async function fetchTask(id) {
  const res = await apiFetch(`/api/tasks/${id}`)
  if (!res) return null
  return res.json()
}

async function fetchComments(id) {
  const res = await apiFetch(`/api/tasks/${id}/comments`)
  if (!res) return []
  return res.json()
}

async function completeTask(id) {
  const res = await apiFetch(`/api/tasks/${id}/complete`, { method: 'POST' })
  if (!res) throw new Error('Fehler')
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Fehler beim Abschließen')
  }
  return res.json()
}

async function postComment(id, data) {
  const res = await apiFetch(`/api/tasks/${id}/comment`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res || !res.ok) throw new Error('Kommentar fehlgeschlagen')
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
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileRef = useRef()
  const [commentText, setCommentText] = useState('')
  const [commentPhoto, setCommentPhoto] = useState(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['category-labels'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30,
  })

  const [successMsg, setSuccessMsg] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState(null)

  const deepLink = `${window.location.origin}${import.meta.env.BASE_URL}tasks/${id}`

  const [shareOpen, setShareOpen] = useState(false)

  const generateQr = useCallback(async () => {
    const url = await QRCode.toDataURL(deepLink, { width: 300, margin: 2 })
    setQrDataUrl(url)
  }, [deepLink])

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: task?.title, url: deepLink })
      } catch {}
    }
    setShareOpen(false)
  }

  async function handleCopyLink() {
    await navigator.clipboard?.writeText(deepLink)
    setShareOpen(false)
    setSuccessMsg('Link kopiert!')
  }

  async function handleShowQr() {
    await generateQr()
    setShareOpen(false)
  }

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id),
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['task-comments', id],
    queryFn: () => fetchComments(id),
  })

  const { mutate: updateCategory } = useMutation({
    mutationFn: async (data) => {
      const res = await apiFetch(`/api/tasks/${id}/category`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      if (!res?.ok) throw new Error('Fehler')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-comments', id] })
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => completeTask(id),
    onSuccess: () => {
      const msg = greetings[Math.floor(Math.random() * greetings.length)]
      setSuccessMsg(msg)
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['task-comments', id] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['admin-points'] })
    },
  })

  const commentMutation = useMutation({
    mutationFn: (data) => postComment(id, data),
    onSuccess: () => {
      setCommentText('')
      setCommentPhoto(null)
      queryClient.invalidateQueries({ queryKey: ['task-comments', id] })
    },
  })

  async function handlePhotoSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setCommentPhoto(compressed)
  }

  function handleSend() {
    if (!commentText.trim() && !commentPhoto) return
    commentMutation.mutate({
      text: commentText.trim() || undefined,
      photo: commentPhoto || undefined,
    })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isLoading) {
    return <div className="detail-loading"><div className="spinner" /></div>
  }

  if (!task) {
    return <div className="detail-error">Nicht gefunden.</div>
  }

  const category = categories.find(c => c.key === task?.category) || { icon: '📋', name: task?.category || '', color: '#6B7280' }

  return (
    <PageLayout showBack right={
      <button onClick={() => setShareOpen(true)}><Share2 size={22} /></button>
    }>
      <div className="detail">
      {successMsg && (
        <Toast message={successMsg} onDone={() => setSuccessMsg(null)} />
      )}

      {shareOpen && (
        <div className="detail-share-overlay" onClick={() => setShareOpen(false)}>
          <div className="detail-share-sheet" onClick={e => e.stopPropagation()}>
            <div className="detail-share-handle" />
            <h3 className="detail-share-title">Teilen</h3>
            <button className="detail-share-option" onClick={handleNativeShare}>
              <Share2 size={20} /> Social Media
            </button>
            <button className="detail-share-option" onClick={handleShowQr}>
              <QrCode size={20} /> QR-Code
            </button>
            <button className="detail-share-option" onClick={handleCopyLink}>
              <Link2 size={20} /> Link kopieren
            </button>
            <button className="detail-share-cancel" onClick={() => setShareOpen(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {qrDataUrl && (
        <div className="detail-qr-overlay" onClick={() => setQrDataUrl(null)}>
          <div className="detail-qr-card" onClick={e => e.stopPropagation()}>
            <img src={qrDataUrl} alt="QR Code" />
            <p className="detail-qr-hint">Scannen um direkt hierher zu kommen</p>
            <button className="detail-qr-close" onClick={() => setQrDataUrl(null)}>Schließen</button>
          </div>
        </div>
      )}

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-dot" style={{ '--cat-color': category.color }}>
            <span>{category.name.charAt(0).toUpperCase()}</span>
          </div>
          <h1 className="detail-title">{task.title}</h1>
        </div>

        {task.description && (
          <div className="detail-desc">
            <Markdown>{task.description}</Markdown>
          </div>
        )}

        <div className="detail-categories">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`detail-cat ${task.category === cat.key ? 'active' : ''}`}
              style={{ '--cat-color': cat.color }}
              onClick={() => {
                if (task.category === cat.key) return
                updateCategory({ category: cat.key })
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="detail-footer">
          <span className="detail-footer-karma" onClick={() => {
            if (task.points > 0) {
              const msg = karmaMotivation[Math.floor(Math.random() * karmaMotivation.length)].replace(/\{n\}/g, task.points)
              setSuccessMsg(msg)
            }
          }}>
            {task.points > 0 && Array.from({ length: task.points }, (_, i) => <Star key={i} size={12} />)}
          </span>
          <span className="detail-footer-tag">
            {task.recurring && <><Clock size={12} /> Wiederkehrend</>}
          </span>
          <span className="detail-footer-date">
            {new Date(task.createdAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {comments.length > 0 && (
        <div className="detail-chat">
          {comments.map((msg) => (
            <div key={msg.id} className={`detail-chat-msg ${msg.isCompletion ? 'detail-chat-msg--done' : ''}`}>
              <div className="detail-chat-bubble">
                <Markdown>{msg.text}</Markdown>
                <span className="detail-chat-time">
                  {new Date(msg.createdAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {completeMutation.isError && (
        <p className="detail-error-msg">{completeMutation.error.message}</p>
      )}

      {!task.recurring && commentPhoto && (
        <div className="detail-chat-preview">
          <img src={commentPhoto} alt="Vorschau" />
          <button onClick={() => setCommentPhoto(null)}>✕</button>
        </div>
      )}

      {!task.recurring && (
      <div className="detail-chat-input">
        <button className="detail-chat-photo" onClick={() => fileRef.current?.click()}>
          <Camera size={20} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelect}
          hidden
        />
        <input
          className="detail-chat-text"
          type="text"
          placeholder="Kommentar..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={commentMutation.isPending}
        />
        <button
          className="detail-chat-send"
          onClick={handleSend}
          disabled={(!commentText.trim() && !commentPhoto) || commentMutation.isPending}
        >
          <Send size={18} />
        </button>
      </div>
      )}

      {!completeMutation.isSuccess && (
        <button
          className="detail-fab"
          onClick={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
        >
          <Check size={28} />
        </button>
      )}
    </div>
    </PageLayout>
  )
}
