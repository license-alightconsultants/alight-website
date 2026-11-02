# Deploying on Windows Server (IIS + Node.js)

The site runs as a Node.js production server (`next start` standalone build) on **127.0.0.1:3000**.
IIS faces the internet, terminates HTTPS and forwards requests to Node. Data lives in **PostgreSQL**;
uploaded images live on persistent disk outside the application folder, so deploys never touch data.

```
Internet ──HTTPS──> IIS (URL Rewrite + ARR) ──HTTP──> Node 127.0.0.1:3000 ──> PostgreSQL (localhost:5432, db "alight")
                                                                          └──> D:\Alight\data\uploads
```

## Folder layout

| Path | Purpose |
|---|---|
| `D:\Alight\source` | Project source checkout. Releases are built here. |
| `D:\Alight\app` | Running release (replaced on every deploy; IIS site physical path). |
| `D:\Alight\app.previous` | Previous release, kept for rollback. |
| `D:\Alight\data\uploads` | **Uploaded images** — persistent. |
| `D:\Alight\config\alight.env` | Production settings and secrets (not in the app folder). |
| `D:\Alight\scripts` | Copies of the scripts the scheduled tasks run. |
| `D:\Alight\logs` | `app-YYYYMMDD.log` (30 days) and `backup.log`. |
| `D:\Alight\backups` | Nightly backups (`BACKUP_RETENTION_DAYS`, default 30). |

To use a different drive, set a machine environment variable `ALIGHT_ROOT` (e.g. `E:\Alight`) before
running the scripts, and adjust the paths in `alight.env`.

All scripts are in `deploy\windows\`. Run them in **Windows PowerShell as Administrator**:
`powershell -ExecutionPolicy Bypass -File <script>.ps1`.

---

## First-time setup

### 1. Install prerequisites
- **Node.js LTS 22.13 or newer** (24 LTS recommended), installed for all users so the SYSTEM account finds `node` on PATH.
- **IIS** with the *Web Server* role (Windows Features → Web Server (IIS)).
- **URL Rewrite 2.1** and **Application Request Routing 3.0** from iis.net.
- **PostgreSQL 15 or newer** (EDB Windows installer). It runs as a Windows service and provides
  `pg_dump`/`pg_restore`, which the backup scripts use.

### 1a. Create the database
In *SQL Shell (psql)* as `postgres`:
```sql
CREATE ROLE alight LOGIN PASSWORD 'a-long-random-password';
CREATE DATABASE alight OWNER alight ENCODING 'UTF8';
```
Keep PostgreSQL listening on localhost only (default `listen_addresses = 'localhost'`); never open port 5432 to the internet.

### 2. Copy the source
Copy the project to `D:\Alight\source` (or `git clone` it there). Do **not** copy `node_modules`, `.next`, `data` or `.env`.

### 3. Configure settings
```powershell
New-Item -ItemType Directory -Force D:\Alight\config
Copy-Item D:\Alight\source\deploy\windows\alight.env.example D:\Alight\config\alight.env
notepad D:\Alight\config\alight.env
icacls D:\Alight\config /inheritance:r /grant:r "Administrators:(OI)(CI)F" "SYSTEM:(OI)(CI)F"
```
Set `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL` (`postgresql://alight:<password>@localhost:5432/alight?schema=public`), absolute `UPLOAD_DIR`, and SMTP (or set SMTP later in Admin → Settings).
For a brand-new server, set `ADMIN_SETUP_TOKEN` to a long random value
(`[Convert]::ToBase64String((1..24 | % { Get-Random -Max 256 }) -as [byte[]])`).

### 4. Configure IIS
```powershell
cd D:\Alight\source\deploy\windows
.\setup-iis.ps1 -HostName alightconsultants.in
```
This enables the ARR proxy (with Host header preservation and response streaming), creates the folders,
the `Alight Website` app pool (No Managed Code) and site pointing at `D:\Alight\app`, and allows the
forwarded-header server variables used by `web.config`.

### 5. HTTPS certificate
Either:
- **Commercial / corporate certificate:** import the `.pfx` into *Local Computer → Personal*, then in IIS Manager →
  site → *Bindings* → add `https`, port 443, host name `alightconsultants.in`, tick *Require Server Name Indication*,
  choose the certificate. Repeat for `www.alightconsultants.in`.
- **Free Let's Encrypt:** install [win-acme](https://www.win-acme.com/), run `wacs.exe`, choose the *Alight Website*
  site. It adds the HTTPS bindings and a renewal task automatically.

`web.config` redirects all HTTP to HTTPS and `www` to the bare domain (delete the *Canonical host* rule if
`www` should be canonical). The app sends HSTS, so only enable HTTPS once the certificate is valid.
Open firewall ports 80 and 443 only — **never open port 3000**.

### 6. Build, migrate and start
```powershell
cd D:\Alight\source
.\deploy\windows\install-tasks.ps1          # registers "Alight Website" (boot) and "Alight Backup" (02:00)
.\deploy\windows\deploy.ps1                 # builds, creates/migrates the database, starts the site
```
New database only — load the catalogue (products, services, industries, statistics):
```powershell
cd D:\Alight\source
Get-Content D:\Alight\config\alight.env | ? { $_ -match '^DATABASE_URL=' } | % { $env:DATABASE_URL = $_.Split('=',2)[1] }
npm run db:seed
```
Moving an existing **PostgreSQL** site instead: restore its `alight.dump` with `restore.ps1` and copy uploads to
`D:\Alight\data\uploads\`.

Migrating from the **old SQLite** version: after `deploy.ps1` has created the empty tables, run (with
`DATABASE_URL` loaded as above) `node prisma\import-sqlite.cjs D:\path\to\alight.db`. It copies every table and
refuses to run if the target already has data.

### 7. Create the first admin
Browse to `https://alightconsultants.in/admin/setup`, enter the setup token and create the Super Admin.
Then clear `ADMIN_SETUP_TOKEN` in `alight.env` and run `.\manage.ps1 restart`.

---

## Updating the site
```powershell
cd D:\Alight\source
# get the new source (git pull, or copy the updated files over)
.\deploy\windows\deploy.ps1
```
`deploy.ps1` builds into `source\release` while the site keeps running, takes a `pre-deploy` backup,
stops the site, runs `prisma migrate deploy`, swaps `D:\Alight\app` (keeping `app.previous`), starts it and
checks it responds. If the new version does not answer within 60 seconds it **rolls back** to the previous
app folder automatically. Database migrations are not reversed — restore the `pre-deploy` backup if needed.

Changing `NEXT_PUBLIC_SITE_URL` requires a redeploy (it is compiled into the build). Other settings in
`alight.env` only need `.\manage.ps1 restart`. Settings edited in Admin → Settings apply immediately.

## Day-to-day operations
```powershell
cd D:\Alight\scripts
.\manage.ps1 status      # task state, node process, health check, last backup
.\manage.ps1 restart
.\manage.ps1 logs        # last 80 lines of today's log
```

**Restart & recovery**
- The `Alight Website` task starts at boot (no sign-in needed). `start-server.ps1` restarts Node within
  5–60 seconds if it exits; the task itself is restarted by Task Scheduler if it stops.
- If the site is down: `.\manage.ps1 status`, then `.\manage.ps1 logs`. Common causes: wrong path in
  `alight.env`, PostgreSQL service stopped or wrong password in `DATABASE_URL`, port 3000 already in use.
- IIS shows **502.3** when Node is not running; **502.4**/**503** if the ARR proxy is disabled (re-run `setup-iis.ps1`).
- Run only **one** Node process. Login rate limiting is kept in process memory, so a second copy
  (e.g. a web farm) would not share it.

## Backups
- `Alight Backup` runs nightly at 02:00: a consistent online `pg_dump` of the database (`alight.dump`, custom
  format, verified with `pg_restore --list`) plus a zip of uploads, in `D:\Alight\backups\<timestamp>\`.
- Manual backup: `.\backup.ps1` (optionally `-Label before-change`).
- **Copy `D:\Alight\backups` off the server** (another disk, NAS or cloud storage) — a backup on the same
  disk does not protect against disk failure. Test a restore every few months.
- Results are logged to `D:\Alight\logs\backup.log`.

## Restore
```powershell
cd D:\Alight\scripts
.\restore.ps1 -Backup D:\Alight\backups\20261031-020000           # database + uploads
.\restore.ps1 -Backup D:\Alight\backups\20261031-020000 -SkipUploads
```
The script verifies the dump, stops the site, saves the current database as `alight.pre-restore-<time>.dump`
and current uploads as `*.pre-restore-<time>` (so a restore can be undone), restores in a single transaction,
starts the site and checks it responds.

## Security checklist
- [ ] Port 3000 is not reachable from outside (Node binds to 127.0.0.1 only).
- [ ] PostgreSQL port 5432 not reachable from outside; the app uses a dedicated `alight` role, not `postgres`.
- [ ] `D:\Alight\config` readable only by Administrators and SYSTEM.
- [ ] `ADMIN_SETUP_TOKEN` cleared after the first admin was created.
- [ ] HTTPS binding with a valid certificate; HTTP redirects to HTTPS.
- [ ] Backups copied off-server.
- [ ] Windows Update and Node.js LTS patch releases applied regularly.
