.PHONY: setup build up down logs ssh-tunnel

# 1) Create .env from example (no secrets committed here)
setup:
	@cp .env.example .env || echo ".env already exists"

# 2) Build the React static files
build:
	docker compose -f docker-compose.prod.yml run --rm frontend-builder

# 3) Bring up the production stack
up:
	docker compose -f docker-compose.prod.yml up -d --build

# 4) Tear down
down:
	docker compose -f docker-compose.prod.yml down

# 5) Tail logs
logs:
	docker compose -f docker-compose.prod.yml logs -f proxy backend db

# 6) Easy phpMyAdmin tunnel
#    make ssh-tunnel && open http://localhost:8000 in your browser
ssh-tunnel:
	ssh -i ~/path/to/your-key.pem -L 8000:localhost:8000 ubuntu@$(shell curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
