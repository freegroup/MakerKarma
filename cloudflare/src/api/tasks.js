import { Octokit } from '@octokit/rest'

// Create Octokit instance from env
function getOctokit(env) {
  return new Octokit({ auth: env.GITHUB_BOT_TOKEN })
}

// Parse "owner/repo" from env
function getRepo(env) {
  const [owner, repo] = env.GITHUB_REPOSITORY.split('/')
  return { owner, repo }
}

// GET /api/tasks - List all tasks (open issues)
export async function listTasks(c) {
  const octokit = getOctokit(c.env)
  const { owner, repo } = getRepo(c.env)

  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    per_page: 100,
  })

  const tasks = issues.map(issueToTask)
  return c.json(tasks)
}

// GET /api/tasks/:id - Get single task
export async function getTask(c) {
  const id = parseInt(c.req.param('id'))
  const octokit = getOctokit(c.env)
  const { owner, repo } = getRepo(c.env)

  const { data: issue } = await octokit.issues.get({
    owner,
    repo,
    issue_number: id,
  })

  return c.json(issueToTask(issue))
}

// POST /api/tasks - Create a new task
export async function createTask(c) {
  const user = c.get('user')
  const body = await c.req.json()
  const octokit = getOctokit(c.env)
  const { owner, repo } = getRepo(c.env)

  const labels = [body.category || 'sonstiges']
  if (body.recurring) labels.push(`recurring:${body.recurring}`)
  if (body.photoRequired) labels.push('photo-required')

  const metadata = {
    points: body.points || 1,
    createdBy: { id: user.id, name: user.name },
    qrCode: body.qrCode || null,
  }

  const { data: issue } = await octokit.issues.create({
    owner,
    repo,
    title: body.title,
    body: `${body.description || ''}\n\n<!-- metadata:${JSON.stringify(metadata)} -->`,
    labels,
  })

  return c.json(issueToTask(issue), 201)
}

// POST /api/tasks/:id/complete - Mark task as completed
export async function completeTask(c) {
  const id = parseInt(c.req.param('id'))
  const user = c.get('user')
  const octokit = getOctokit(c.env)
  const { owner, repo } = getRepo(c.env)

  // Add completion comment
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: id,
    body: `Erledigt von **${user.name}** (${user.email})\n\n<!-- completion:${JSON.stringify({ userId: user.id, userName: user.name, completedAt: new Date().toISOString() })} -->`,
  })

  // Close issue (unless recurring)
  const { data: issue } = await octokit.issues.get({ owner, repo, issue_number: id })
  const isRecurring = issue.labels.some(l => (l.name || l).startsWith('recurring:'))

  if (!isRecurring) {
    await octokit.issues.update({
      owner,
      repo,
      issue_number: id,
      state: 'closed',
    })
  }

  return c.json({ success: true, recurring: isRecurring })
}

// GET /api/tasks/:id/history - Get completion history
export async function getTaskHistory(c) {
  const id = parseInt(c.req.param('id'))
  const octokit = getOctokit(c.env)
  const { owner, repo } = getRepo(c.env)

  const { data: comments } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: id,
  })

  const history = comments
    .filter(comment => comment.body.includes('<!-- completion:'))
    .map(comment => {
      const match = comment.body.match(/<!-- completion:(.*?) -->/)
      if (!match) return null
      return JSON.parse(match[1])
    })
    .filter(Boolean)

  return c.json(history)
}

// Convert GitHub Issue to Task object
function issueToTask(issue) {
  const labels = issue.labels.map(l => l.name || l)
  const categoryLabels = ['wartung', 'reinigung', 'werkstatt', 'garten', 'event', 'einkauf', 'sonstiges']
  const category = labels.find(l => categoryLabels.includes(l)) || 'sonstiges'
  const recurringLabel = labels.find(l => l.startsWith('recurring:'))
  const recurring = recurringLabel ? recurringLabel.split(':')[1] : null

  // Parse metadata from issue body
  let metadata = {}
  const metaMatch = (issue.body || '').match(/<!-- metadata:(.*?) -->/)
  if (metaMatch) {
    try { metadata = JSON.parse(metaMatch[1]) } catch (e) { /* ignore */ }
  }

  return {
    id: issue.number,
    title: issue.title,
    description: (issue.body || '').replace(/\n*<!-- metadata:.*? -->/s, '').trim(),
    points: metadata.points || 1,
    category,
    status: issue.state === 'closed' ? 'completed' : 'open',
    recurring,
    qrCode: metadata.qrCode,
    createdBy: metadata.createdBy || null,
    createdAt: issue.created_at,
    photoRequired: labels.includes('photo-required'),
  }
}
