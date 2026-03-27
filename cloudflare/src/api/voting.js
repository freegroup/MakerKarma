import { Octokit } from '@octokit/rest'

function getOctokit(env) {
  return new Octokit({ auth: env.GITHUB_BOT_TOKEN })
}

function getRepo(env) {
  const [owner, repo] = env.GITHUB_REPOSITORY.split('/')
  return { owner, repo }
}

// GET /api/voting - List all voting items (issues with label "voting-item")
export async function listVotingItems(c) {
  const user = c.get('user')
  const octokit = getOctokit(c.env)
  const { owner, repo } = getRepo(c.env)

  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    labels: 'voting-item',
    per_page: 100,
  })

  // For each issue, parse vote comments to get total votes
  const items = await Promise.all(issues.map(async (issue) => {
    const { data: comments } = await octokit.issues.listComments({
      owner, repo, issue_number: issue.number,
    })

    const votes = []
    let totalVotes = 0
    let myVotes = 0

    for (const comment of comments) {
      const match = (comment.body || '').match(/<!-- vote:(.*?) -->/)
      if (!match) continue
      try {
        const data = JSON.parse(match[1])
        totalVotes += data.points || 0
        if (data.userId === user.id) myVotes += data.points || 0
        votes.push(data)
      } catch {}
    }

    return {
      id: issue.number,
      title: issue.title,
      description: (issue.body || '').replace(/\n*<!-- metadata:.*? -->/s, '').trim(),
      totalVotes,
      myVotes,
      voterCount: new Set(votes.map(v => v.userId)).size,
      createdAt: issue.created_at,
    }
  }))

  return c.json(items)
}

// GET /api/voting/:id - Get single voting item with vote stats
export async function getVotingItem(c) {
  const id = parseInt(c.req.param('id'))
  const user = c.get('user')
  const octokit = getOctokit(c.env)
  const { owner, repo } = getRepo(c.env)

  const { data: issue } = await octokit.issues.get({ owner, repo, issue_number: id })
  const { data: comments } = await octokit.issues.listComments({ owner, repo, issue_number: id })

  let totalVotes = 0
  let myVotes = 0
  const voters = new Set()

  for (const comment of comments) {
    const match = (comment.body || '').match(/<!-- vote:(.*?) -->/)
    if (!match) continue
    try {
      const data = JSON.parse(match[1])
      totalVotes += data.points || 0
      if (data.userId === user.id) myVotes += data.points || 0
      voters.add(data.userId)
    } catch {}
  }

  return c.json({
    id: issue.number,
    title: issue.title,
    description: (issue.body || '').replace(/\n*<!-- metadata:.*? -->/s, '').trim(),
    totalVotes,
    myVotes,
    voterCount: voters.size,
    createdAt: issue.created_at,
  })
}

// POST /api/voting/:id/vote - Vote on a voting item with karma points
export async function castVote(c) {
  const id = parseInt(c.req.param('id'))
  const user = c.get('user')
  const body = await c.req.json()
  const points = parseInt(body.points)

  if (!points || points < 1) {
    return c.json({ error: 'Mindestens 1 Punkt erforderlich' }, 400)
  }

  const octokit = getOctokit(c.env)
  const { owner, repo } = getRepo(c.env)

  // Calculate available points (earned - spent)
  const comments = await octokit.paginate(octokit.issues.listCommentsForRepo, {
    owner, repo, per_page: 100,
  })

  let earnedPoints = 0
  let spentPoints = 0

  for (const comment of comments) {
    const completionMatch = (comment.body || '').match(/<!-- completion:(.*?) -->/)
    if (completionMatch) {
      try {
        const data = JSON.parse(completionMatch[1])
        if (data.userId === user.id) earnedPoints += data.points || 0
      } catch {}
    }

    const voteMatch = (comment.body || '').match(/<!-- vote:(.*?) -->/)
    if (voteMatch) {
      try {
        const data = JSON.parse(voteMatch[1])
        if (data.userId === user.id) spentPoints += data.points || 0
      } catch {}
    }
  }

  const availablePoints = earnedPoints - spentPoints

  if (points > availablePoints) {
    return c.json({
      error: `Nicht genug Karma. Verfügbar: ${availablePoints}, angefordert: ${points}`,
      availablePoints,
    }, 400)
  }

  const vote = {
    userId: user.id,
    userName: user.name,
    points,
    votedAt: new Date().toISOString(),
  }

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: id,
    body: `**${user.name}** hat ${points} Karma-Punkt${points > 1 ? 'e' : ''} eingesetzt\n\n<!-- vote:${JSON.stringify(vote)} -->`,
  })

  return c.json({ success: true, availablePoints: availablePoints - points })
}
