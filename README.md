# KITS CAP Backend

SAP CAP (Cloud Application Programming Model) Node.js backend for the KITS application, deployed on SAP BTP with HANA DB.

## Project Structure

```
kits_cap_be/
├── db/
│   ├── schema.cds          # Database entity models (HANA/SQLite tables)
│   └── data/
│       └── kits.Users.csv  # Seed data for local dev
├── srv/
│   ├── server.js           # Express middleware, auth routes, URL rewrites
│   ├── service.cds         # CAP service definitions (@path: '/api')
│   └── service.js          # CAP service event handlers (before hooks)
├── .env                    # Local dev env vars (CDS_ENV=development → SQLite)
├── package.json            # Dependencies & CAP configuration
├── mta.yaml                # MTA deployment descriptor for BTP (backend + frontend)
└── xs-security.json        # XSUAA security config
```

## Running in SAP BAS (Local Dev)

Open **two terminals** in BAS:

**Terminal 1 — Backend:**
```bash
cd kits_cap_be
npm install
npm run dev
# Serves API at http://localhost:4004
```

**Terminal 2 — Frontend:**
```bash
cd kits_fe
npm install
npm start
# Serves Angular UI at http://localhost:4200
```

BAS will auto-detect both ports and show **"Open in New Tab"** buttons.

### Default Login Credentials (dev mode)
| Field | Value |
|-------|-------|
| Email | `jafar.p@roboxaservices.com` |
| Password | `Kits@123` |
| OTP | `123456` |

## Deploy to SAP BTP

```bash
npm install -g mbt
cd kits_cap_be
mbt build
cf deploy mta_archives/kits-cap-backend_1.0.0.mtar
```

## API Endpoints

| Method | Frontend Path | CAP Path | Description |
|--------|--------------|----------|-------------|
| POST | `/api/sendotp` | (custom) | Send OTP |
| POST | `/api/login` | (custom) | Login |
| GET/PUT/DELETE | `/api/user_actions/:id` | (custom) | User by ID |
| GET/POST/PUT | `/api/user/register` | (custom) | User CRUD |
| GET | `/api/dashboard` | (custom) | Dashboard stats |
| GET/POST/PUT/DELETE | `/api/sponsor[/:id]` | `/api/sponsors[/:id]` | Sponsor CRUD |
| GET/POST/PUT/DELETE | `/api/cro[/:id]` | `/api/cros[/:id]` | CRO CRUD |
| GET/POST/PUT/DELETE | `/api/sites_data` | `/api/site_data` | Sites CRUD |
| GET/POST/PUT/DELETE | `/api/cro_protocol[/:id]` | `/api/cro_protocols[/:id]` | Protocol CRUD |
| GET/POST/PUT/DELETE | `/api/clab_kit_preparation[/:id]` | `/api/clab_kit_preparations[/:id]` | Kit Prep CRUD |
