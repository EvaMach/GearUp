## Step 3: Get Your Clerk Keys

In your Clerk dashboard:

1. Go to **API Keys** in the left sidebar
2. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)
3. Keep this page open (you'll need both keys)

## Step 4: Configure Clerk JWT Template

Still in Clerk dashboard:

1. Go to **JWT Templates** in the left sidebar
2. Click **+ New template**
3. Choose **Blank** template
4. Set **Name** to: `convex` (exactly this, lowercase)
5. Leave all other settings as default
6. Click **Save**

## Step 5: Set Up Convex

First, initialize Convex (if not already done):

```bash
npx convex dev
```

This will:

- Ask you to log in (create account if needed)
- Create a new Convex project
- Give you a deployment URL

**Copy the deployment URL** (looks like: `https://your-project.convex.cloud`)

## Step 6: Create Environment File

Create a file named `.env.local` in the project root:

```bash
# Copy the template
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

```env
# From Convex
VITE_CONVEX_URL=https://your-project.convex.cloud

# From Clerk (Publishable Key)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Important:** Replace the placeholder values with your actual keys!

## Step 7: Add Clerk Secret to Convex

1. Go to your [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **+ Add Environment Variable**
5. Add:
   - **Name:** `CLERK_SECRET_KEY`
   - **Value:** `sk_test_your_secret_key_here` (from Clerk)
6. Click **Save**

## Step 8: Deploy Convex Functions

In your terminal:

```bash
npx convex dev
```

You should see output like:

```
✓ Schema updated
✓ Functions deployed
✓ Code generation complete
```

Keep this running in the background.

## Step 9: Start Development Server

In a **new terminal window**:

```bash
npm run dev
```

## Step 10: Test Authentication

1. Open [http://localhost:5173](http://localhost:5173) in your browser
2. Click **Sign In** in the header
3. Click **Sign Up** at the bottom
4. Create an account with email and password
5. You should be redirected to `/gear-list`
6. Your user avatar should appear in the header

**🎉 Success!** Authentication is working!

## Troubleshooting

### "Missing publishableKey" error

- Check `.env.local` has `VITE_CLERK_PUBLISHABLE_KEY`
- Restart dev server: `Ctrl+C` then `npm run dev`
- Make sure the key starts with `pk_test_`

### "Authentication required" in Convex

- Check Convex environment variables in dashboard
- Make sure JWT template is named exactly `convex`
- Verify `CLERK_SECRET_KEY` is set correctly

### Redirect loop on sign-in

- Clear browser cookies and cache
- Check no ProtectedRoute is wrapping sign-in pages
- Verify `afterSignInUrl` is set to `/gear-list`

### TypeScript errors about missing types

- Run: `npx convex dev` to generate types
- Wait for "Code generation complete" message
- Restart your IDE/editor

## What to Test

Try these flows to verify everything works:

- [ ] Sign up with email/password
- [ ] Sign in with existing account
- [ ] Access `/gear-list` when signed in (should work)
- [ ] Access `/gear-list` when signed out (should redirect to sign-in)
- [ ] Sign out (click avatar → Sign Out)
- [ ] Refresh page while signed in (session persists)

## Next Steps

Now that authentication is working:

1. **Review the code:**

   - Look at `src/components/auth/` for auth components
   - Check `convex/lib/auth.ts` for backend helpers

2. **Read the documentation:**

   - `docs/AUTHENTICATION_SETUP.md` - Complete setup guide
   - `docs/IMPLEMENTATION_SUMMARY.md` - What was implemented

3. **Update gear list integration:**
   - See technical spec for gear list migration
   - Update `GearListForm` to use Convex

## Need Help?

- **Clerk Docs:** [clerk.com/docs](https://clerk.com/docs)
- **Convex Docs:** [docs.convex.dev](https://docs.convex.dev)
- **Convex + Clerk:** [docs.convex.dev/auth/clerk](https://docs.convex.dev/auth/clerk)

## Environment Variables Reference

### Required

```env
# Frontend (.env.local)
VITE_CONVEX_URL=https://xxx.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx

# Convex Dashboard
CLERK_SECRET_KEY=sk_test_xxx
```

### Optional (for production)

```env
# Use production keys from Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
```

## Production Checklist

Before deploying to production:

- [ ] Create production Clerk application
- [ ] Use `pk_live_` and `sk_live_` keys
- [ ] Set up production Convex deployment
- [ ] Update environment variables
- [ ] Enable email verification in Clerk
- [ ] Configure OAuth providers (Google, GitHub)
- [ ] Test all authentication flows
- [ ] Set up error monitoring

---

**Ready to develop!** 🚀
