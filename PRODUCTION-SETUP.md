# Production Deployment Instructions

## Environment Variables for Production

When deploying to AWS Amplify or any other hosting platform, make sure to set these environment variables in your production environment:

```bash
# OpenAI API Key
NEXT_OPENAI_API_KEY=your_actual_openai_api_key

# Production URLs (replace with your actual production domain)
NEXT_PUBLIC_APP_URL=https://main.d2ww7p18bvsqa1.amplifyapp.com
NEXT_PUBLIC_SERVER_URL=https://main.d2ww7p18bvsqa1.amplifyapp.com
NEXT_PUBLIC_CLIENT_URL=https://main.d2ww7p18bvsqa1.amplifyapp.com
NEXT_PUBLIC_BASE_URL=https://main.d2ww7p18bvsqa1.amplifyapp.com

# Google OAuth (if using authentication)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## AWS Amplify Environment Variables

In your AWS Amplify console:

1. Go to your app dashboard
2. Click on "Environment variables" in the left sidebar
3. Add the following variables:

| Variable | Value |
|----------|-------|
| `NEXT_OPENAI_API_KEY` | Your OpenAI API key |
| `NEXT_PUBLIC_APP_URL` | `https://main.d2ww7p18bvsqa1.amplifyapp.com` |
| `NEXT_PUBLIC_SERVER_URL` | `https://main.d2ww7p18bvsqa1.amplifyapp.com` |
| `NEXT_PUBLIC_CLIENT_URL` | `https://main.d2ww7p18bvsqa1.amplifyapp.com` |
| `NEXT_PUBLIC_BASE_URL` | `https://main.d2ww7p18bvsqa1.amplifyapp.com` |

## Important Notes

- Replace `https://main.d2ww7p18bvsqa1.amplifyapp.com` with your actual production URL
- All `NEXT_PUBLIC_*` variables are exposed to the browser, so don't put sensitive data in them
- The `NEXT_OPENAI_API_KEY` is server-side only and won't be exposed to the browser
- After adding environment variables, trigger a new build in Amplify

## Next.js API Routes

Since you're using Next.js API routes (`/api/session-token`), these will automatically use the same domain as your frontend when deployed. The relative URL `/api/session-token` will resolve to `https://your-domain.com/api/session-token` in production.
