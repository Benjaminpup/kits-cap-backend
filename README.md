# KITS CAP Backend

SAP CAP (Cloud Application Programming Model) Node.js backend for the KITS application, deployed on SAP BTP with HANA DB.

## Project Structure

```
kits_cap_be/
├── db/
│   └── schema.cds          # Database entity models (HANA tables)
├── srv/
│   ├── server.js            # Express middleware, auth routes, CRUD APIs
│   ├── service.cds          # CAP service definitions
│   └── service.js           # CAP service event handlers
├── package.json             # Dependencies & CAP configuration
├── mta.yaml                 # MTA deployment descriptor for BTP
└── xs-security.json         # XSUAA security config
```

## Local Development

```bash
npm install
npx cds watch
```
Runs on `http://localhost:4004` with SQLite in-memory.

## Deploy to SAP BTP

```bash
mbt build
cf deploy mta_archives/kits-cap-backend_1.0.0.mtar
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sendotp` | Send OTP to user email |
| POST | `/api/login` | Login with username, password, OTP |
| GET | `/api/user_actions/:id` | Get user by ID |
| GET/POST/PUT | `/api/user/register` | User CRUD |
| GET | `/api/dashboard` | Dashboard stats |
| GET/POST/PUT/DELETE | `/api/sponsors` | Sponsor CRUD (via CAP) |
| GET/POST/PUT/DELETE | `/api/cros` | CRO CRUD (via CAP) |
