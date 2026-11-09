import {
  supabaseAuth,
  identityDb,
} from '../config/supabase.js'

export async function requireAuth(req, res, next) {
  const accessToken = req.cookies?.eg_access_token

  if (!accessToken) {
    return res.status(401).json({
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authentication is required.',
      },
    })
  }

  try {
    // Verify the token with Supabase before trusting its contents.
    const { data, error } =
      await supabaseAuth.auth.getUser(accessToken)

    if (error || !data?.user) {
      return res.status(401).json({
        error: {
          code: 'AUTH_INVALID',
          message: 'Session is invalid or expired.',
        },
      })
    }

    const { data: account, error: accountError } =
      await identityDb
        .from('user_account_status')
        .select('status, suspended_until, sessions_revoked_at')
        .eq('user_id', data.user.id)
        .maybeSingle()

    if (accountError) {
      throw new Error('Account verification failed')
    }

    const suspended =
      account?.status === 'suspended' &&
      (
        !account.suspended_until ||
        new Date(account.suspended_until).getTime() > Date.now()
      )

    if (suspended) {
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'This account is suspended.',
        },
      })
    }

    if (account?.sessions_revoked_at) {
      const claims = JSON.parse(
        Buffer.from(
          accessToken.split('.')[1],
          'base64url',
        ).toString('utf8'),
      )

      const issuedAt = Number(claims.iat) * 1000
      const revokedAt =
        new Date(account.sessions_revoked_at).getTime()

      if (
        !Number.isFinite(issuedAt) ||
        !Number.isFinite(revokedAt)
      ) {
        throw new Error('Unable to validate session timestamps')
      }

      if (issuedAt <= revokedAt) {
        return res.status(401).json({
          error: {
            code: 'AUTH_SESSION_REVOKED',
            message: 'Session has been revoked.',
          },
        })
      }
    }

    req.authUser = data.user
    return next()
  } catch {
    return res.status(503).json({
      error: {
        code: 'AUTH_CHECK_UNAVAILABLE',
        message: 'Unable to verify access. Please try again.',
      },
    })
  }
}