# Deploying on Vercel

Vercel runs the Next.js app as serverless functions. Two things differ from the Windows/IIS setup:

- **Database:** use a hosted PostgreSQL (Neon, Supabase or Vercel Postgres). The local servers on your PC are not reachable from Vercel.
- **Uploaded images:** Vercel's disk is read-only, so uploads go to **Vercel Blob**. The app switches to Blob automatically when `BLOB_READ_WRITE_TOKEN` is set. Images are limited to 4 MB each there.

## 1. Create the database

Create a PostgreSQL database with any provider. Neon, Supabase and Vercel Postgres all have free tiers. Pick the region closest to India, for example Singapore or Mumbai. Copy two connection strings:

| | Used for | Neon example |
|---|---|---|
| **Pooled** | the website (`DATABASE_URL` on Vercel) | `postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1` |
| **Direct** | loading the SQL file, running migrations | `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |

On Supabase, the pooled URL is the "Transaction pooler" on port 6543; add `?pgbouncer=true&connection_limit=1`. The direct URL is the "Session pooler" or direct connection on port 5432.

## 2. Load your data

`deploy/vercel/alight-database.sql` contains everything the site needs: tables, your admin account, settings, products, services and so on. Load it **once**, into the **empty** database:

```bash
psql "<DIRECT connection string>" -v ON_ERROR_STOP=1 -f deploy/vercel/alight-database.sql
```

On Windows, psql is at `"C:\Program Files\PostgreSQL\18\bin\psql.exe"`. If you don't want to use psql, open the file in the provider's **SQL Editor**, paste it all and run it.

The file contains your admin password hash. Keep it private and don't commit it; `.gitignore` already excludes it.

To make a fresh export later, for example from your PG 18 server once it holds the live data:

```bash
DATABASE_URL="postgresql://..." npm run db:export-sql
```

## 3. Create a Blob store

Vercel dashboard → **Storage** → **Create** → **Blob** → connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` to the project automatically.

## 4. Environment variables

Add these in Vercel → Project → **Settings → Environment Variables**:

| Name | Value |
|---|---|
| `DATABASE_URL` | the **pooled** connection string |
| `NEXT_PUBLIC_SITE_URL` | `https://alightconsultants.in`, or the `*.vercel.app` URL until the domain is connected |
| `BLOB_READ_WRITE_TOKEN` | added automatically by step 3 |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | your mail server. These can also be set later in Admin → Settings |
| `ENQUIRY_NOTIFY_TO`, `QUOTE_NOTIFY_TO`, `CAREERS_NOTIFY_TO`, `SEND_CUSTOMER_ACK` | as in `.env.example` |

`UPLOAD_DIR` and `ADMIN_SETUP_TOKEN` are not needed. Your admin account comes with the data.

## 5. Deploy

**From GitHub (recommended):** push the project to a GitHub repository. In Vercel choose **Add New → Project**, import the repository and click Deploy. Vercel detects Next.js and runs `npm run build`, which generates the Prisma client and builds the site.

**From your PC:** `npm i -g vercel`, then run `vercel` in the project folder. Run `vercel --prod` for production. `.vercelignore` keeps local data, backups and private files out of the upload.

## 6. After deploying

- Sign in at `https://<your-site>/admin/login` with your existing admin email and password.
- Connect your domain under Project → Settings → **Domains**. Then update `NEXT_PUBLIC_SITE_URL` and redeploy, because it is built into the pages.
- For future schema changes, run `npx prisma migrate deploy` with `DATABASE_URL` set to the **direct** connection string before deploying the new code.

## Notes

- Login rate limiting is kept in memory. On Vercel each serverless instance has its own counter, so the limit is per instance. Failed logins are still recorded in the database.
- The Windows scripts in `deploy/windows` are not used on Vercel.
