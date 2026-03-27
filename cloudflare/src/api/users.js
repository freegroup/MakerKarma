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

// GET /api/users/me - Current user profile with points from completions
export async function getMe(c) {
  const jwtUser = c.get('user')
  const octokit = getOctokit(c.env)
  const { owner, repo } = getRepo(c.env)

  // Calculate points from completion comments (earned) and vote comments (spent)
  const allComments = await octokit.paginate(octokit.issues.listCommentsForRepo, {
    owner, repo, per_page: 100,
  })
  // paginate returns flat array, but flatten just in case
  const comments = allComments.flat()

  let earnedPoints = 0
  let spentPoints = 0
  let totalTasks = 0
  const monthPoints = {}
  const userId = jwtUser.id

  for (const comment of comments) {
    const body = comment.body || ''

    const completionMatch = body.match(/<!-- completion:(.*?) -->/)
    if (completionMatch) {
      try {
        const data = JSON.parse(completionMatch[1])
        if (data.userId !== userId) continue
        const pts = data.points || 0
        earnedPoints += pts
        totalTasks += 1
        const month = data.completedAt?.slice(0, 7)
        if (month) {
          monthPoints[month] = (monthPoints[month] || 0) + pts
        }
      } catch {}
      continue
    }

    const voteMatch = body.match(/<!-- vote:(.*?) -->/)
    if (voteMatch) {
      try {
        const data = JSON.parse(voteMatch[1])
        if (data.userId !== userId) continue
        spentPoints += data.points || 0
      } catch {}
    }
  }

  const availablePoints = earnedPoints - spentPoints

  return c.json({
    ...jwtUser,
    earnedPoints,
    spentPoints,
    availablePoints,
    points: earnedPoints,
    tasks: totalTasks,
    monthPoints,
    _debug: { userId, commentsTotal: comments.length, earnedPoints, spentPoints },
  })
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
