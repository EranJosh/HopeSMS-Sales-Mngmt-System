import { describe, it } from 'vitest'

describe('Auth Flows', () => {
  it('allows a new user to register with email and password', () => {
    // TODO Sprint 1: test supabase.auth.signUp() with valid email/password;
    // assert user is created and success message shown
  })

  it('allows a new user to register via Google OAuth', () => {
    // TODO Sprint 1: test signInWithOAuth({ provider: 'google' }) redirect flow;
    // assert OAuth URL is triggered and /auth/callback is the redirectTo
  })

  it('login guard blocks an INACTIVE user and signs them out', () => {
    // TODO Sprint 1: mock a SIGNED_IN event where user row has record_status = 'INACTIVE';
    // assert supabase.auth.signOut() is called and error message is set
  })

  it('login guard allows an ACTIVE user through to the app', () => {
    // TODO Sprint 1: mock a SIGNED_IN event where user row has record_status = 'ACTIVE';
    // assert currentUser is set with merged session + user row data
  })
})
