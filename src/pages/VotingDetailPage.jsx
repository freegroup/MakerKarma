import { useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../store/authStore'
import Markdown from 'react-markdown'
import AppHeader from '../components/AppHeader'
import PageLayout from '../components/PageLayout'
import Toast from '../components/Toast'
import QRCode from 'qrcode'
import { generateQRPdf } from '../utils/printQR'
import { ThumbsUp, Minus, Plus, Send, Camera, Share2, QrCode, Link2, Printer } from 'lucide-react'
import './TaskDetailPage.less'

async function fetchVotingItem(id) {
  const res = await apiFetch(`/api/voting/${id}`)
  if (!res) return null
  return res.json()
}

async function fetchComments(id) {
  const res = await apiFetch(`/api/tasks/${id}/comments`)
  if (!res) return []
  return res.json()
}

async function fetchProfile() {
  const res = await apiFetch('/api/users/me')
  if (!res) return null
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

export default function VotingDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const fileRef = useRef()
  const [commentText, setCommentText] = useState('')
  const [commentPhoto, setCommentPhoto] = useState(null)
  const [votePoints, setVotePoints] = useState(1)
  const [showVoting, setShowVoting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)

  const deepLink = `${window.location.origin}${import.meta.env.BASE_URL}voting/${id}`

  const generateQr = useCallback(async () => {
    const url = await QRCode.toDataURL(deepLink, { width: 300, margin: 2 })
    setQrDataUrl(url)
  }, [deepLink])

  async function handleNativeShare() {
    if (navigator.share) {
      try { await navigator.share({ title: item?.title, url: deepLink }) } catch {}
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

  const { data: item, isLoading } = useQuery({
    queryKey: ['voting-item', id],
    queryFn: () => fetchVotingItem(id),
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['task-comments', id],
    queryFn: () => fetchComments(id),
  })

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })

  const availablePoints = profile?.availablePoints ?? 0

  const voteMutation = useMutation({
    mutationFn: async ({ points }) => {
      const res = await apiFetch(`/api/voting/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Vote fehlgeschlagen')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voting-item', id] })
      queryClient.invalidateQueries({ queryKey: ['voting-items'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['task-comments', id] })
      setShowVoting(false)
      setVotePoints(1)
      setSuccessMsg('Danke für dein Karma!')
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

  if (!item) {
    return <div className="detail-error">Nicht gefunden.</div>
  }

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
            <button className="detail-share-option" onClick={() => {
              generateQRPdf(item, deepLink)
              setShareOpen(false)
            }}>
              <Printer size={20} /> QR-Code drucken (A4)
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
        <h1 className="detail-title">{item.title}</h1>

        {item.description && (
          <div className="detail-desc">
            <Markdown>{item.description}</Markdown>
          </div>
        )}

        <div className="detail-footer">
          <span className="detail-footer-karma">
            <ThumbsUp size={14} /> {item.totalVotes} Karma
          </span>
          <span className="detail-footer-tag">
            {item.voterCount} Unterstützer
          </span>
          <span className="detail-footer-date">
            {new Date(item.createdAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {item.myVotes > 0 && (
          <p className="detail-my-votes">
            Du hast {item.myVotes} Karma-Punkt{item.myVotes > 1 ? 'e' : ''} eingesetzt
          </p>
        )}
      </div>

      {showVoting && (
        <div className="detail-confirm-overlay" onClick={() => setShowVoting(false)}>
          <div className="detail-confirm" onClick={e => e.stopPropagation()}>
            <h3 className="detail-confirm-title">Karma einsetzen</h3>
            <p className="detail-confirm-text">Wie viele Karma-Punkte möchtest du für dieses Projekt einsetzen?</p>
            <div className="voting-card-stepper" style={{ marginTop: '1rem' }}>
              <button
                className="voting-card-stepper-btn"
                onClick={() => setVotePoints(p => Math.max(1, p - 1))}
                disabled={votePoints <= 1}
              >
                <Minus size={16} />
              </button>
              <input
                className="voting-card-stepper-value"
                type="number"
                min={1}
                max={availablePoints}
                value={votePoints}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (isNaN(val) || val < 1) setVotePoints(1)
                  else if (val > availablePoints) setVotePoints(availablePoints)
                  else setVotePoints(val)
                }}
              />
              <button
                className="voting-card-stepper-btn"
                onClick={() => setVotePoints(p => Math.min(availablePoints, p + 1))}
                disabled={votePoints >= availablePoints}
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="detail-confirm-text" style={{ marginTop: '0.5rem' }}>
              Verfügbar: {availablePoints}
            </p>
            {voteMutation.isError && (
              <p className="detail-error-msg">{voteMutation.error.message}</p>
            )}
            <div className="detail-confirm-actions">
              <button className="detail-confirm-cancel" onClick={() => setShowVoting(false)}>Abbrechen</button>
              <button
                className="detail-confirm-yes"
                onClick={() => voteMutation.mutate({ points: votePoints })}
                disabled={voteMutation.isPending}
              >
                {voteMutation.isPending ? 'Sende...' : `Ich übergebe ${votePoints} Karma Punkt${votePoints > 1 ? 'e' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {comments.length > 0 && (
        <div className="detail-chat">
          {[...comments].reverse().map((msg) => (
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

      {commentPhoto && (
        <div className="detail-chat-preview">
          <img src={commentPhoto} alt="Vorschau" />
          <button onClick={() => setCommentPhoto(null)}>✕</button>
        </div>
      )}

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

      {availablePoints > 0 && (
        <button
          className="detail-fab"
          onClick={() => { setShowVoting(true); setVotePoints(1) }}
        >
          <ThumbsUp size={28} />
        </button>
      )}
    </div>
    </PageLayout>
  )
}
