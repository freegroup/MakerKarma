// GitHub OAuth: Redirect to GitHub login
// Frontend passes ?redirect=<frontend_url> so we know where to send the user back
export function githubRedirect(c) {
  const redirect = c.req.query('redirect') || c.env.FRONTEND_URL
  const workerUrl = new URL(c.req.url).origin

  const params = new URLSearchParams({
    client_id: c.env.GITHUB_CLIENT_ID,
    redirect_uri: `${workerUrl}/auth/github/callback`,
    scope: 'read:user user:email',
    state: redirect, // pass frontend URL through state
  })

  return c.redirect(`https://github.com/login/oauth/authorize?${params}`)
}

// GitHub OAuth Callback: GitHub redirects here with code
// We exchange the code, create JWT, and redirect to frontend with token
export async function githubCallback(c) {
  const code = c.req.query('code')
  const frontendUrl = c.req.query('state') || c.env.FRONTEND_URL

  if (!code) {
    return c.redirect(`${frontendUrl}?error=no_code`)
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  if (!tokenRes.ok) {
    return c.redirect(`${frontendUrl}?error=token_exchange_failed`)
  }

  const { access_token, error } = await tokenRes.json()
  if (error || !access_token) {
    return c.redirect(`${frontendUrl}?error=${error || 'no_token'}`)
  }

  // Get user info
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'MakerKarma' },
  })

  if (!userRes.ok) {
    return c.redirect(`${frontendUrl}?error=profile_failed`)
  }

  const profile = await userRes.json()

  return c.json({
    user: {
      id: `github:${profile.id}`,
      email: profile.email,
      name: profile.name || profile.login,
      avatarUrl: profile.avatar_url,
      provider: 'github',
    },
    frontendUrl,
  })
}
