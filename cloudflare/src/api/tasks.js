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

  const labels = []
  if (body.category) labels.push(`category-${body.category}`)
  if (body.points > 0) labels.push(`points-${body.points}`)
  if (body.recurring) labels.push(`recurring:${body.recurring}`)
  if (body.photoRequired) labels.push('photo-required')

  let description = body.description || ''

  const metadata = {
    createdBy: { id: user.id, name: user.name },
  }

  const { data: issue } = await octokit.issues.create({
    owner,
    repo,
    title: body.title,
    body: `${description}\n\n<!-- metadata:${JSON.stringify(metadata)} -->`,
    labels,
  })

  // Upload photo after issue creation (filename: uploads/issue-{nr}-1.jpg)
  if (body.photo) {
    try {
      const photoData = body.photo.replace(/^data:image\/\w+;base64,/, '')
      const filename = `uploads/issue-${issue.number}-1.jpg`
      await octokit.repos.createOrUpdateFileContents({
        owner, repo,
        path: filename,
        message: `Foto für #${issue.number}: ${body.title}`,
        content: photoData,
      })
      const photoUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filename}`
      // Update issue body with photo link
      await octokit.issues.update({
        owner, repo,
        issue_number: issue.number,
        body: `${description}\n\n![Foto](${photoUrl})\n\n<!-- metadata:${JSON.stringify(metadata)} -->`,
      })
    } catch (e) {
      // Photo upload failed, issue still created without photo
    }
  }

  return c.json(issueToTask(issue), 201)
}

// POST /api/tasks/:id/complete - Mark task as completed
export async function completeTask(c) {
  const id = parseInt(c.req.param('id'))
  const user = c.get('user')
  const octokit = getOctokit(c.env)
  const { owner, repo } = getRepo(c.env)

  // Get task to read points
  const { data: issue } = await octokit.issues.get({ owner, repo, issue_number: id })
  const labels = issue.labels.map(l => l.name || l)
  const VALID_POINTS = [1, 2, 3, 5, 8, 13]
  const pointsLabel = labels.find(l => /^points-\d+$/.test(l))
  const pointsRaw = pointsLabel ? parseInt(pointsLabel.split('-')[1]) : 0
  const points = VALID_POINTS.includes(pointsRaw) ? pointsRaw : 0

  const completion = {
    userId: user.id,
    userName: user.name,
    points,
    completedAt: new Date().toISOString(),
  }

  // Add completion comment with points
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: id,
    body: `Erledigt von **${user.name}** — ${points} Punkte\n\n<!-- completion:${JSON.stringify(completion)} -->`,
  })

  // Close issue (unless recurring)
  const isRecurring = labels.some(l => l.startsWith('recurring:'))

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

// GET /api/tasks/:id/comments - Get all comments as chat messages
export async function getTaskComments(c) {
  const id = parseInt(c.req.param('id'))
  const octokit = getOctokit(c.env)
  const { owner, repo } = getRepo(c.env)

  const { data: comments } = await octokit.issues.listComments({
    owner, repo, issue_number: id,
  })

  const messages = comments.map(comment => {
    const completionMatch = comment.body.match(/<!-- completion:(.*?) -->/)
    const isCompletion = !!completionMatch

    // Strip HTML comments from display text
    const text = comment.body.replace(/\n*<!-- .*? -->/g, '').trim()

    let completion = null
    if (completionMatch) {
      try { completion = JSON.parse(completionMatch[1]) } catch {}
    }

    return {
      id: comment.id,
      text,
      isCompletion,
      completion,
      createdAt: comment.created_at,
    }
  })

  return c.json(messages)
}

// POST /api/tasks/:id/comment - Add a comment (text and/or photo)
export async function addTaskComment(c) {
  const id = parseInt(c.req.param('id'))
  const user = c.get('user')
  const body = await c.req.json()
  const octokit = getOctokit(c.env)
  const { owner, repo } = getRepo(c.env)

  let commentBody = ''

  // Upload photo if provided
  if (body.photo) {
    try {
      const photoData = body.photo.replace(/^data:image\/\w+;base64,/, '')
      const filename = `uploads/issue-${id}-comment-${Date.now()}.jpg`
      await octokit.repos.createOrUpdateFileContents({
        owner, repo,
        path: filename,
        message: `Kommentar-Foto für #${id}`,
        content: photoData,
      })
      const photoUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filename}`
      commentBody += `![Foto](${photoUrl})\n\n`
    } catch {}
  }

  if (body.text) {
    commentBody += body.text
  }

  commentBody += `\n\n<!-- comment:${JSON.stringify({ userId: user.id, userName: user.name })} -->`

  const { data: comment } = await octokit.issues.createComment({
    owner, repo, issue_number: id, body: commentBody,
  })

  return c.json({ id: comment.id }, 201)
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
  const categoryLabel = labels.find(l => l.startsWith('category-'))
  const category = categoryLabel ? categoryLabel.replace('category-', '') : null
  const recurringLabel = labels.find(l => l.startsWith('recurring:'))
  const recurring = recurringLabel ? recurringLabel.split(':')[1] : null

  // Parse metadata from issue body
  let metadata = {}
  const metaMatch = (issue.body || '').match(/<!-- metadata:(.*?) -->/)
  if (metaMatch) {
    try { metadata = JSON.parse(metaMatch[1]) } catch (e) { /* ignore */ }
  }

  // Parse points from label (points-N)
  const pointsLabel = labels.find(l => /^points-\d+$/.test(l))
  const points = pointsLabel ? parseInt(pointsLabel.split('-')[1]) : 0

  return {
    id: issue.number,
    title: issue.title,
    description: (issue.body || '').replace(/\n*<!-- metadata:.*? -->/s, '').trim(),
    points,
    category,
    status: issue.state === 'closed' ? 'completed' : 'open',
    recurring,
    qrCode: metadata.qrCode,
    createdBy: metadata.createdBy || null,
    createdAt: issue.created_at,
    photoRequired: labels.includes('photo-required'),
  }
}
