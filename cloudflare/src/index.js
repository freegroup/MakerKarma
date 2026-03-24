import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { googleRedirect, googleCallback } from './auth/google.js'
import { githubRedirect, githubCallback } from './auth/github.js'
import { authMiddleware } from './middleware/auth.js'
import { signJWT } from './middleware/jwt.js'
import { findOrCreateUser, getMe, listUsers, toggleAdmin, readUsers, writeUsers } from './api/users.js'
import { listTasks, getTask, createTask, completeTask, getTaskHistory } from './api/tasks.js'

const app = new Hono()

// CORS for frontend
app.use('*', async (c, next) => {
  const origins = (c.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim())
  return cors({ origin: origins, credentials: true })(c, next)
})

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'MakerKarma API' }))

// ──────────────────────────────────────────
// Auth Routes (public)
// ──────────────────────────────────────────

// Redirect to OAuth provider (frontend passes ?redirect=<its_url>)
app.get('/auth/google', googleRedirect)
app.get('/auth/github', githubRedirect)

// OAuth Callback — GitHub redirects here, we exchange code + redirect to frontend with token
app.get('/auth/github/callback', async (c) => {
  const code = c.req.query('code')
  const frontendUrl = c.req.query('state') || c.env.FRONTEND_URL

  if (!code) {
    return c.redirect(`${frontendUrl}?error=no_code`)
  }

  try {
    // Exchange code for access token + user info
    const oauthUser = await exchangeGithubCode(c, code)
    if (oauthUser.error) {
      return c.redirect(`${frontendUrl}?error=${encodeURIComponent(oauthUser.error)}`)
    }

    let jwtPayload

    // Check allow-list (if GITHUB_BOT_TOKEN is configured)
    if (c.env.GITHUB_BOT_TOKEN) {
      const { users } = await readUsers(c.env)
      const allowed = users.find(u =>
        u.email === oauthUser.email || u.id === oauthUser.id
      )

      if (!allowed) {
        const params = new URLSearchParams({
          error: 'not_allowed',
          detail: `Email "${oauthUser.email}" / ID "${oauthUser.id}" ist nicht in der Allow-List. Kontaktiere einen Admin.`,
        })
        return c.redirect(`${frontendUrl}?${params}`)
      }

      jwtPayload = {
        id: allowed.id || oauthUser.id,
        email: allowed.email || oauthUser.email,
        name: allowed.name || oauthUser.name,
        avatarUrl: allowed.avatarUrl || oauthUser.avatarUrl,
        provider: oauthUser.provider,
        role: allowed.role || 'member',
        isAdmin: allowed.role === 'admin',
      }
    } else {
      // No allow-list: accept all GitHub users
      jwtPayload = {
        id: oauthUser.id,
        email: oauthUser.email,
        name: oauthUser.name,
        avatarUrl: oauthUser.avatarUrl,
        provider: oauthUser.provider,
        role: 'member',
        isAdmin: false,
      }
    }

    const token = await signJWT(jwtPayload, c.env.JWT_SECRET)

    // Redirect to frontend with token (encode to preserve JWT dots)
    const redirectUrl = new URL(frontendUrl)
    redirectUrl.searchParams.set('token', token)
    return c.redirect(redirectUrl.toString())
  } catch (e) {
    return c.redirect(`${frontendUrl}?error=${encodeURIComponent(e.message || 'server_error')}`)
  }
})

// ──────────────────────────────────────────
// Protected API Routes
// ──────────────────────────────────────────

const api = new Hono()
api.use('*', authMiddleware())

// Tasks
api.get('/tasks', listTasks)
api.get('/tasks/:id', getTask)
api.post('/tasks', createTask)
api.post('/tasks/:id/complete', completeTask)
api.get('/tasks/:id/history', getTaskHistory)

// Labels: fetch points-* labels from repo
api.get('/labels/points', async (c) => {
  const octokit = new (await import('@octokit/rest')).Octokit({ auth: c.env.GITHUB_BOT_TOKEN })
  const [owner, repo] = c.env.GITHUB_REPOSITORY.split('/')
  const { data: labels } = await octokit.issues.listLabelsForRepo({ owner, repo, per_page: 100 })
  const points = labels
    .filter(l => /^points-\d+$/.test(l.name))
    .map(l => parseInt(l.name.split('-')[1]))
    .sort((a, b) => a - b)
  return c.json(points)
})

// Labels: fetch category-* labels from repo
api.get('/labels/categories', async (c) => {
  const octokit = new (await import('@octokit/rest')).Octokit({ auth: c.env.GITHUB_BOT_TOKEN })
  const [owner, repo] = c.env.GITHUB_REPOSITORY.split('/')
  const { data: labels } = await octokit.issues.listLabelsForRepo({ owner, repo, per_page: 100 })
  const categories = labels
    .filter(l => l.name.startsWith('category-'))
    .map(l => {
      const key = l.name.replace('category-', '')
      const desc = l.description || key
      const icon = /^\p{Emoji}/u.test(desc) ? desc.match(/^\p{Emoji_Presentation}/u)?.[0] || '' : ''
      const name = icon ? desc.slice(icon.length).trim() : desc
      return { key, name: name || key, icon, color: `#${l.color}` }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
  return c.json(categories)
})

// Users
api.get('/users/me', getMe)
api.get('/users', listUsers)
api.put('/users/:id/admin', toggleAdmin)

// Admin: Points per user per month
api.get('/admin/points', async (c) => {
  const jwtUser = c.get('user')
  if (!jwtUser.isAdmin) {
    return c.json({ error: 'Nur Admins' }, 403)
  }

  const octokit = new (await import('@octokit/rest')).Octokit({ auth: c.env.GITHUB_BOT_TOKEN })
  const [owner, repo] = c.env.GITHUB_REPOSITORY.split('/')

  // Fetch all issue comments in the repo
  const comments = await octokit.paginate(octokit.issues.listCommentsForRepo, {
    owner, repo, per_page: 100,
  })

  // Parse completion comments and group by user + month
  const pointsMap = {}

  for (const comment of comments) {
    const match = (comment.body || '').match(/<!-- completion:(.*?) -->/)
    if (!match) continue

    try {
      const data = JSON.parse(match[1])
      if (!data.userId || !data.points) continue

      const month = data.completedAt?.slice(0, 7) // "2026-03"
      if (!month) continue

      const key = `${data.userId}|${month}`
      if (!pointsMap[key]) {
        pointsMap[key] = { userId: data.userId, userName: data.userName, month, points: 0, tasks: 0 }
      }
      pointsMap[key].points += data.points
      pointsMap[key].tasks += 1
    } catch { /* ignore */ }
  }

  // Convert to sorted array
  const result = Object.values(pointsMap).sort((a, b) =>
    b.month.localeCompare(a.month) || b.points - a.points
  )

  return c.json(result)
})

app.route('/api', api)

// ──────────────────────────────────────────
// Helper: OAuth code exchange
// ──────────────────────────────────────────

async function exchangeGoogleCode(c, code) {
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

  if (!tokenRes.ok) return { error: 'Google Token-Tausch fehlgeschlagen' }
  const tokens = await tokenRes.json()

  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  if (!userRes.ok) return { error: 'Google Profil konnte nicht geladen werden' }
  const profile = await userRes.json()

  return {
    id: `google:${profile.id}`,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture,
    provider: 'google',
  }
}

async function exchangeGithubCode(c, code) {
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  if (!tokenRes.ok) return { error: 'GitHub Token-Tausch fehlgeschlagen' }
  const { access_token, error } = await tokenRes.json()
  if (error || !access_token) return { error: error || 'Kein Access Token' }

  const headers = { Authorization: `Bearer ${access_token}`, 'User-Agent': 'MakerKarma' }

  const userRes = await fetch('https://api.github.com/user', { headers })
  if (!userRes.ok) return { error: 'GitHub Profil konnte nicht geladen werden' }
  const profile = await userRes.json()

  // GitHub may return null email if set to private — fetch from emails API
  let email = profile.email
  if (!email) {
    const emailRes = await fetch('https://api.github.com/user/emails', { headers })
    if (emailRes.ok) {
      const emails = await emailRes.json()
      const primary = emails.find(e => e.primary) || emails[0]
      email = primary?.email || null
    }
  }

  return {
    id: `github:${profile.id}`,
    email: email,
    name: profile.name || profile.login,
    avatarUrl: profile.avatar_url,
    provider: 'github',
  }
}

export default app
