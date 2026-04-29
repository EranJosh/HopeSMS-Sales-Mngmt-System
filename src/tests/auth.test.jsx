// Lookup test: all 3 user types visit all 4 lookup pages -- zero add/edit/delete buttons. Price autofill: select product in AddLineItemModal -- unitPrice fills from MAX(effDate) priceHist entry.
// Cascade test: soft-delete TR000001 as SUPERADMIN, confirm all salesDetail INACTIVE. Recovery: ADMIN recovers, confirm all reappear. RLS bypass: USER getSales() without ACTIVE filter blocked.
// Sprint 2 rights matrix: 3 user types (SUPERADMIN, ADMIN, USER) x 13 rights = 39 test cases all documented with pass/fail
// Sprint 1 auth tests: email registration, Google OAuth new user, login guard blocks INACTIVE, login guard allows ACTIVE
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
