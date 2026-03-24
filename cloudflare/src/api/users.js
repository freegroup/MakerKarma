import { Octokit } from '@octokit/rest'

function getOctokit(env) {
  return new Octokit({ auth: env.GITHUB_BOT_TOKEN })
}

function getRepo(env) {
  const [owner, repo] = env.GITHUB_REPOSITORY.split('/')
  return { owner, repo }
}

const USERS_PATH = 'users.json'

// Read users.json from the private repo
export async function readUsers(env) {
  const octokit = getOctokit(env)
  const { owner, repo } = getRepo(env)

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: USERS_PATH,
    })

    const content = atob(data.content)
    return { users: JSON.parse(content), sha: data.sha }
  } catch (e) {
    if (e.status === 404) {
      return { users: [], sha: null }
    }
    throw e
  }
}

// Write users.json back to the private repo
export async function writeUsers(env, users, sha) {
  const octokit = getOctokit(env)
  const { owner, repo } = getRepo(env)

  const params = {
    owner,
    repo,
    path: USERS_PATH,
    message: `Update users.json`,
    content: btoa(JSON.stringify(users, null, 2)),
  }

  if (sha) params.sha = sha

  await octokit.repos.createOrUpdateFileContents(params)
}

// Find or create user after OAuth login
export async function findOrCreateUser(env, oauthUser) {
  const { users, sha } = await readUsers(env)

  let existing = users.find(u => u.id === oauthUser.id)

  if (existing) {
    // Update name/avatar/email on each login
    existing.name = oauthUser.name
    existing.email = oauthUser.email
    existing.avatarUrl = oauthUser.avatarUrl
    existing.lastLogin = new Date().toISOString()
    await writeUsers(env, users, sha)
    return existing
  }

  // New user
  const newUser = {
    id: oauthUser.id,
    email: oauthUser.email,
    name: oauthUser.name,
    avatarUrl: oauthUser.avatarUrl,
    provider: oauthUser.provider,
    isAdmin: false,
    points: 0,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  }

  users.push(newUser)
  await writeUsers(env, users, sha)
  return newUser
}

// GET /api/users/me - Current user profile with points
export async function getMe(c) {
  const jwtUser = c.get('user')
  const { users } = await readUsers(c.env)

  const user = users.find(u => u.id === jwtUser.id)
  if (!user) {
    return c.json({ error: 'User nicht gefunden' }, 404)
  }

  return c.json(user)
}

// GET /api/users - List all users (admin only)
export async function listUsers(c) {
  const jwtUser = c.get('user')
  const { users } = await readUsers(c.env)

  const currentUser = users.find(u => u.id === jwtUser.id)
  if (!currentUser?.isAdmin) {
    return c.json({ error: 'Nur Admins können alle User sehen' }, 403)
  }

  // Return without sensitive data
  const safeUsers = users.map(({ email, ...rest }) => rest)
  return c.json(safeUsers)
}

// PUT /api/users/:id/admin - Toggle admin (admin only)
export async function toggleAdmin(c) {
  const jwtUser = c.get('user')
  const targetId = c.req.param('id')
  const { users, sha } = await readUsers(c.env)

  const currentUser = users.find(u => u.id === jwtUser.id)
  if (!currentUser?.isAdmin) {
    return c.json({ error: 'Nur Admins können Rechte vergeben' }, 403)
  }

  const target = users.find(u => u.id === targetId)
  if (!target) {
    return c.json({ error: 'User nicht gefunden' }, 404)
  }

  target.isAdmin = !target.isAdmin
  await writeUsers(c.env, users, sha)

  return c.json({ id: target.id, isAdmin: target.isAdmin })
}
