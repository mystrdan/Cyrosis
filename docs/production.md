# Production workflow

Cyro uses the main branch as its continuous production branch.

The web application lives in web/ and is deployed through Vercel. The Python core remains lightweight and provider-agnostic. Supabase is the persistence and authentication layer.

## Development loop

1. Build a small capability.
2. Commit it to main.
3. Let Vercel create a production deployment.
4. Test the live application.
5. Fix the next issue.
6. Repeat.

Production should remain usable while the research, knowledge and model layers are developed.
