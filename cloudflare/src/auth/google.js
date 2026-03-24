import { signJWT } from '../middleware/jwt.js'

// Google OAuth: Redirect to Google login
export function googleRedirect(c) {
  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${c.env.FRONTEND_URL}/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state: 'google',
    prompt: 'select_account',
  })

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}

// Google OAuth: Exchange code for user info + create JWT
export async function googleCallback(c) {
  const { code } = c.req.query()

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${c.env.FRONTEND_URL}/callback`,
    }),
  })

  if (!tokenRes.ok) {
    return c.json({ error: 'Google Token-Tausch fehlgeschlagen' }, 400)
  }

  const tokens = await tokenRes.json()

  // Get user info
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  if (!userRes.ok) {
    return c.json({ error: 'Google Profil konnte nicht geladen werden' }, 400)
  }

  const profile = await userRes.json()

  // Create our JWT
  const user = {
    id: `google:${profile.id}`,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture,
    provider: 'google',
  }

  const jwt = await signJWT(user, c.env.JWT_SECRET)

  return c.json({ token: jwt, user })
}
