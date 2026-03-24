import { verifyJWT } from './jwt.js'

// Hono middleware: checks Authorization header and sets c.get('user')
export function authMiddleware() {
  return async (c, next) => {
    const header = c.req.header('Authorization')
    if (!header || !header.startsWith('Bearer ')) {
      return c.json({ error: 'Nicht authentifiziert' }, 401)
    }

    const token = header.slice(7)
    const payload = await verifyJWT(token, c.env.JWT_SECRET)

    if (!payload) {
      return c.json({ error: 'Token ungültig oder abgelaufen' }, 401)
    }

    c.set('user', payload)
    await next()
  }
}
