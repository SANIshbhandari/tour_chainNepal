# Deploy TourChain to Vercel 🚀

## Quick Deploy (Recommended)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel:** https://vercel.com/
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import your repository:** `SANIshbhandari/tour_chainNepal`
5. **Configure Project:**
   - Framework Preset: **Next.js**
   - Root Directory: **apps/web**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

6. **Add Environment Variables:**
   Click "Environment Variables" and add these:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dwymmaulabbeytahykro.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_SOLANA_CLUSTER=devnet
   NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
   NEXT_PUBLIC_REPUTATION_PROGRAM_ID=EDPXuESJcC2NqypbegAEdxAXVUegQpZ7wrd2Ex4AbdL6
   NEXT_PUBLIC_ESCROW_PROGRAM_ID=EsmThaTZhHLviAJFbpgaSTr6eCgUFGcSiboMRzb9JF6Z
   NEXT_PUBLIC_PROOF_PROGRAM_ID=3PfgspqxmvAh3FXUMGRPexBV7neXwLkKTPnv3gRWvPjm
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

7. **Click "Deploy"**
8. **Wait 2-3 minutes** for deployment to complete
9. **Your app is live!** 🎉

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd Tour_chain
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? tour-chain-nepal
# - Directory? apps/web
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## Important Configuration

### Root Directory Setting
⚠️ **CRITICAL:** Set Root Directory to `apps/web` in Vercel dashboard

### Build Settings
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 18.x or higher

---

## Environment Variables (Required)

Get these from your Supabase dashboard:

1. Go to: https://supabase.com/dashboard/project/dwymmaulabbeytahykro/settings/api
2. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

---

## After Deployment

### 1. Update App URL
Once deployed, update this environment variable:
```
NEXT_PUBLIC_APP_URL=https://your-actual-domain.vercel.app
```

### 2. Test Your Deployment
Visit these pages:
- Homepage: `https://your-app.vercel.app`
- AI Planner: `https://your-app.vercel.app/planner`
- Explore: `https://your-app.vercel.app/explore`
- Dashboard: `https://your-app.vercel.app/dashboard`

### 3. Update GitHub README
Add your live URL to README.md:
```markdown
## Live Demo
🌐 **Live Site:** https://your-app.vercel.app
```

---

## Troubleshooting

### Build Fails
**Error:** "Module not found"
**Fix:** Make sure Root Directory is set to `apps/web`

### Environment Variables Not Working
**Fix:** 
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure all variables are added
3. Redeploy: Deployments → Click "..." → Redeploy

### 404 on All Pages
**Fix:** Check that Output Directory is set to `.next` (not `apps/web/.next`)

### Supabase Connection Fails
**Fix:** 
1. Verify environment variables are correct
2. Check Supabase project is running
3. Verify API keys are valid

---

## Custom Domain (Optional)

1. Go to: Project Settings → Domains
2. Add your domain: `tourchain.com`
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-30 minutes)

---

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment

---

## Performance Tips

### Enable Edge Functions
In `vercel.json`:
```json
{
  "functions": {
    "apps/web/src/app/api/**/*.ts": {
      "runtime": "edge"
    }
  }
}
```

### Enable Image Optimization
Already configured in Next.js - Vercel handles automatically

---

## Monitoring

### View Logs
1. Go to Vercel Dashboard
2. Click your project
3. Go to "Deployments"
4. Click any deployment
5. View "Build Logs" or "Function Logs"

### Analytics
1. Go to Project → Analytics
2. View page views, performance, etc.

---

## Cost

- **Hobby Plan:** FREE
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  - Perfect for demos and hackathons

- **Pro Plan:** $20/month
  - More bandwidth
  - Team collaboration
  - Advanced analytics

---

## Success Checklist

- [ ] Vercel account created
- [ ] Repository imported
- [ ] Root directory set to `apps/web`
- [ ] All environment variables added
- [ ] Deployment successful
- [ ] Site loads correctly
- [ ] AI Planner works
- [ ] Wallet connection works
- [ ] All pages accessible

---

## Your Deployment URL

After deployment, your site will be at:
```
https://tour-chain-nepal.vercel.app
```

Or custom domain:
```
https://tourchain.com
```

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test all features
3. ✅ Update README with live URL
4. ✅ Share on social media
5. ✅ Submit to Colosseum hackathon

---

**Ready to deploy? Go to:** https://vercel.com/new

**Good luck! 🚀**
