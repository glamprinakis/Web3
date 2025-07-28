# Web3 E‑Commerce App

A Dockerized full‑stack e‑commerce web application built with React, Node.js/Express, and MySQL, served behind Nginx. Production‑ready deployment to AWS EC2 with SSL support.

## Features

- **React frontend** with dynamic product listings, categories, cart, checkout, user auth, and profile management.
- **Express API** with JWT‑based authentication, secure parameterized MySQL queries, and order management.
- **MySQL 8** datastore, initialized from SQL dumps.
- **phpMyAdmin** for DB administration (SSH/SSM tunnel only).
- **Nginx reverse proxy** serving static React build, proxying `/api` to the backend, with automated Let’s Encrypt SSL.
- **Docker Compose** (`docker-compose.prod.yml`) orchestrates all services on a private network.
- **Bootstrap script** for one‑step EC2 setup.
- **GitHub Actions** pipeline for zero‑touch frontend UI deploys.

## Repository Structure

```
Web3/
├─ react/                # React source
├─ node/                 # Express API source
├─ db/                   # SQL initialization scripts
├─ nginx.conf            # Nginx config for HTTP/HTTPS
├─ Dockerfile.frontend   # Multi‑stage build for React static assets
├─ Dockerfile.backend    # Build instructions for Express API
├─ docker-compose.prod.yml # Production Docker Compose file
├─ bootstrap.sh          # One‑step EC2 deploy script
├─ Makefile              # Helper targets (build, up, down, logs, ssh‑tunnel)
└─ .env.example          # Example environment variables
```

## Prerequisites

- **Docker** & **Docker Compose**
- **Node.js** & **npm** (for local frontend dev)
- AWS EC2 instance (Ubuntu 22.04+)
- Domain (e.g. `glamprinakis.com`)

## Quickstart (Local)

```bash
# Clone
git clone https://github.com/glamprinakis/Web3.git
cd Web3

# Copy example env
cp .env.example .env
# Edit .env for local testing

# Build React and start all services
make build up

# Visit frontend: http://localhost/
# phpMyAdmin: http://localhost:8000
```

## Production Deploy (EC2)

1. **Launch EC2**, open ports 80/443, attach Elastic IP.
2. **SSH** in, install Docker & Compose.
3. **Clone repo** and set secrets:
   ```bash
   git clone https://github.com/glamprinakis/Web3.git
   cd Web3
   ./bootstrap.sh DB_PASSWORD=yourDbPw JWT_SECRET=yourJwtSecret
   ```
4. **Visit**: http\://\<your‑elastic‑ip>/ (or [https://glamprinakis.com/](https://glamprinakis.com/) once SSL is configured)

## GitHub Actions Deploy

A workflow in `.github/workflows/deploy.yml` automatically rebuilds and redeploys the frontend UI on every push to `main`, without SSH.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `DB_PASSWORD` — MySQL root password
- `JWT_SECRET` — secret for JWT signing
- (Optional) `CORS_ORIGIN` — restrict CORS during development

## Common Commands

| Target            | Description                                  |
| ----------------- | -------------------------------------------- |
| `make setup`      | Copy `.env.example` → `.env`                 |
| `make build`      | Build React static bundle (frontend‑builder) |
| `make up`         | Start prod stack (nginx, backend, db)        |
| `make down`       | Stop and remove containers                   |
| `make logs`       | Tail logs for proxy, backend, and db         |
| `make ssh-tunnel` | SSH‑tunnel to phpMyAdmin (`localhost:8000`)  |

---

## License

MIT © Glamprinakis

