// JWT helper using Web Crypto API (available in Cloudflare Workers)

const encoder = new TextEncoder()

async function getKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function base64url(data) {
  if (typeof data === 'string') {
    return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  // ArrayBuffer
  const bytes = new Uint8Array(data)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return atob(str)
}

export async function signJWT(payload, secret, expiresInHours = 24 * 7) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)

  const claims = {
    ...payload,
    iat: now,
    exp: now + expiresInHours * 3600,
  }

  const headerB64 = base64url(JSON.stringify(header))
  const payloadB64 = base64url(JSON.stringify(claims))
  const message = `${headerB64}.${payloadB64}`

  const key = await getKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))

  return `${message}.${base64url(signature)}`
}

export async function verifyJWT(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [headerB64, payloadB64, signatureB64] = parts
  const message = `${headerB64}.${payloadB64}`

  const key = await getKey(secret)

  // Decode signature
  const sigStr = base64urlDecode(signatureB64)
  const sigBytes = new Uint8Array(sigStr.length)
  for (let i = 0; i < sigStr.length; i++) sigBytes[i] = sigStr.charCodeAt(i)

  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(message))
  if (!valid) return null

  const payload = JSON.parse(base64urlDecode(payloadB64))

  // Check expiration
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null

  return payload
}
