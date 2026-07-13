SHELL := /bin/bash
PATH  := /opt/homebrew/bin:$(PATH)

.PHONY: dev dev-be dev-fe stop build clean status

# Build Go server to a known path so we can reliably kill it.
build:
	@mkdir -p backend/bin
	@cd backend && go build -o bin/server ./cmd/server
	@echo "built backend/bin/server"

# Kill anything on our dev ports + any stray go-build/next-dev processes.
stop:
	@for port in 3000 8080; do \
		pid=$$(lsof -ti:$$port 2>/dev/null || true); \
		if [ -n "$$pid" ]; then \
			echo "killing PID $$pid on :$$port"; \
			kill -9 $$pid 2>/dev/null || true; \
		fi; \
	done
	@pkill -9 -f "lumio/backend/bin/server" 2>/dev/null || true
	@pkill -9 -f "go-build.*server" 2>/dev/null || true
	@pkill -9 -f "next dev" 2>/dev/null || true
	@pkill -9 -f "next-server" 2>/dev/null || true
	@sleep 0.5
	@echo "ports clean"

# Show which ports are in use
status:
	@echo "3000: $$(lsof -ti:3000 2>/dev/null | tr '\n' ' ' || echo 'free')"
	@echo "8080: $$(lsof -ti:8080 2>/dev/null | tr '\n' ' ' || echo 'free')"

# Backend only — kills :8080 first, then runs from bin/server
dev-be: stop build
	@cd backend && ./bin/server

# Frontend only — kills :3000 first
dev-fe: stop
	@cd frontend && npm run dev

# Both, in parallel. Ctrl-C stops; `make stop` cleans up.
dev: stop build
	@trap 'kill 0' EXIT; \
	./backend/bin/server & \
	(cd frontend && npm run dev) & \
	wait