import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

const W = 210
const H = 297

function drawBlobs(doc) {
  // Background
  doc.setFillColor(245, 243, 240)
  doc.rect(0, 0, W, H, 'F')

  // Large coral blob (top-right) - multiple overlapping ellipses for organic feel
  doc.setGState(new doc.GState({ opacity: 0.85 }))
  doc.setFillColor(244, 118, 107) // #f4766b
  doc.ellipse(175, 50, 90, 100, 'F')

  doc.setGState(new doc.GState({ opacity: 0.6 }))
  doc.setFillColor(249, 168, 184) // #f9a8b8
  doc.ellipse(160, 35, 75, 80, 'F')

  doc.setGState(new doc.GState({ opacity: 0.5 }))
  doc.setFillColor(232, 168, 124) // #e8a87c
  doc.ellipse(185, 90, 70, 75, 'F')

  doc.setGState(new doc.GState({ opacity: 0.4 }))
  doc.setFillColor(249, 196, 170) // #f9c4aa
  doc.ellipse(150, 70, 60, 65, 'F')

  // Small green blob (bottom-right)
  doc.setGState(new doc.GState({ opacity: 0.7 }))
  doc.setFillColor(90, 122, 100) // #5a7a64
  doc.ellipse(145, 265, 45, 14, 'F')

  // Reset opacity
  doc.setGState(new doc.GState({ opacity: 1 }))
}

function drawGlassCard(doc, x, y, w, h) {
  // Outer glow
  doc.setGState(new doc.GState({ opacity: 0.15 }))
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(x - 4, y - 4, w + 8, h + 8, 10, 10, 'F')

  // Card border
  doc.setGState(new doc.GState({ opacity: 0.5 }))
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.5)
  doc.roundedRect(x, y, w, h, 8, 8, 'S')

  // Card fill
  doc.setGState(new doc.GState({ opacity: 0.75 }))
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(x, y, w, h, 8, 8, 'F')

  doc.setGState(new doc.GState({ opacity: 1 }))
}

export async function generateQRPdf(task, deepLink) {
  const qrDataUrl = await QRCode.toDataURL(deepLink, { width: 600, margin: 2 })
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  // Draw login-style background with blobs
  drawBlobs(doc)

  // Title "Karma Yoga"
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(32)
  doc.setTextColor(17, 24, 39)
  doc.text('Karma Yoga', W / 2, 35, { align: 'center' })

  // "for Maker"
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(22)
  doc.setTextColor(107, 114, 128)
  doc.text('for Maker', W / 2, 46, { align: 'center' })

  // Slogan
  doc.setFontSize(10)
  doc.setTextColor(156, 163, 175)
  doc.text('Tue Gutes. Sammle Karma.', W / 2, 55, { align: 'center' })

  // Glass card
  const cardW = 130
  const cardH = 160
  const cardX = (W - cardW) / 2
  const cardY = 68
  drawGlassCard(doc, cardX, cardY, cardW, cardH)

  // "SCANNEN & SAMMELN"
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(17, 24, 39)
  doc.text('SCANNEN & SAMMELN', W / 2, cardY + 16, { align: 'center' })

  // QR Code with inner glass frame
  const qrSize = 65
  const qrX = (W - qrSize) / 2
  const qrY = cardY + 24

  // QR glass background
  doc.setGState(new doc.GState({ opacity: 0.5 }))
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 5, 5, 'F')
  doc.setGState(new doc.GState({ opacity: 0.4 }))
  doc.setDrawColor(255, 255, 255)
  doc.roundedRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 5, 5, 'S')
  doc.setGState(new doc.GState({ opacity: 1 }))

  // QR image
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

  // Task title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(31, 41, 55)
  const titleLines = doc.splitTextToSize(task.title, cardW - 20)
  doc.text(titleLines, W / 2, qrY + qrSize + 14, { align: 'center' })

  // Hint text
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(156, 163, 175)
  doc.text('Code scannen, um Karma-Punkte fuer deinen', W / 2, cardY + cardH - 16, { align: 'center' })
  doc.text('Beitrag zu erfassen. Jede gute Tat zaehlt.', W / 2, cardY + cardH - 11, { align: 'center' })

  // Footer
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text('Gemeinsam die Maker-Community staerken.', W / 2, H - 25, { align: 'center' })

  // Download
  doc.save(`karma-${task.id}-${task.title.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}
