# Farmboard Makefile
# Intelligent commands for development workflow

.PHONY: help quickstart sync rebuild restart dev build clean install check-env setup docker-up docker-down test lint

# Default target - show help
.DEFAULT_GOAL := help

##@ General

help: ## Display this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\n\033[1mUsage:\033[0m\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Quick Start

quickstart: ## 🚀 Sync, rebuild, and prepare the app (one command to rule them all!)
	@echo "🚀 Starting Farmboard quickstart..."
	@$(MAKE) sync
	@$(MAKE) rebuild
	@$(MAKE) stop
	@echo ""
	@echo "✅ Quickstart complete!"
	@echo ""
	@echo "🎯 Next step: Start the dev server with one of:"
	@echo "   make dev        - Run in foreground (recommended)"
	@echo "   make dev-bg     - Run in background"

##@ Development

dev: install check-env ## Start development server
	@echo "🔥 Starting development server..."
	@npm run dev

build: install ## Build for production
	@echo "🏗️  Building for production..."
	@npm run build

preview: build ## Preview production build
	@echo "👀 Starting preview server..."
	@npm run preview

##@ Sync & Update

sync: ## Pull latest changes from git
	@echo "📥 Syncing with remote repository..."
	@git fetch origin
	@if git rev-parse --abbrev-ref HEAD@{upstream} > /dev/null 2>&1; then \
		echo "⬇️  Pulling latest changes..."; \
		git pull --rebase origin $$(git rev-parse --abbrev-ref HEAD) || { \
			echo "⚠️  Rebase conflict detected. Please resolve manually."; \
			exit 1; \
		}; \
	else \
		echo "⚠️  No upstream branch set. Skipping pull."; \
	fi
	@echo "✅ Sync complete!"

##@ Build & Install

install: ## Install dependencies (smart - only if needed)
	@if [ ! -d "node_modules" ]; then \
		echo "📦 Installing dependencies..."; \
		npm install; \
	else \
		echo "✅ Dependencies already installed"; \
		echo "💡 Run 'make install-force' to reinstall"; \
	fi

install-force: ## Force reinstall all dependencies
	@echo "🔄 Force reinstalling dependencies..."
	@rm -rf node_modules package-lock.json
	@npm install

rebuild: sync install ## Rebuild app (sync + install)
	@echo "🔨 Rebuilding app..."
	@npm run build || { \
		echo "⚠️  Build failed. Trying to fix..."; \
		$(MAKE) install-force; \
		npm run build; \
	}
	@echo "✅ Rebuild complete!"

##@ Process Management

restart: stop dev-bg ## Restart dev server (stop + start in background)

dev-bg: ## Start dev server in background
	@echo "🚀 Starting dev server in background..."
	@(nohup npm run dev > /tmp/farmboard-dev.log 2>&1 & echo $$! > /tmp/farmboard-dev.pid) || true
	@sleep 3
	@if [ -f /tmp/farmboard-dev.pid ] && kill -0 $$(cat /tmp/farmboard-dev.pid) 2>/dev/null; then \
		echo "✅ Dev server started successfully!"; \
		echo "📋 PID: $$(cat /tmp/farmboard-dev.pid)"; \
		echo "📋 Logs: tail -f /tmp/farmboard-dev.log"; \
		echo "🌐 URL: http://localhost:5173"; \
		echo "🛑 Stop: make stop"; \
	else \
		echo "❌ Failed to start dev server"; \
		echo "📋 Check logs: cat /tmp/farmboard-dev.log"; \
		exit 1; \
	fi

stop: ## Stop dev server
	@echo "🛑 Stopping dev server..."
	@if [ -f /tmp/farmboard-dev.pid ]; then \
		kill $$(cat /tmp/farmboard-dev.pid) 2>/dev/null || true; \
		rm -f /tmp/farmboard-dev.pid; \
	fi
	@pkill -f "[v]ite" 2>/dev/null || true
	@echo "✅ Dev server stopped"

status: ## Check if dev server is running
	@if [ -f /tmp/farmboard-dev.pid ] && kill -0 $$(cat /tmp/farmboard-dev.pid) 2>/dev/null; then \
		echo "✅ Dev server is running"; \
		echo "📋 PID: $$(cat /tmp/farmboard-dev.pid)"; \
		echo "📋 Logs: tail -f /tmp/farmboard-dev.log"; \
		echo "🌐 URL: http://localhost:5173"; \
	elif pgrep -f "[v]ite" > /dev/null; then \
		echo "⚠️  Dev server is running (no PID file)"; \
		echo "📋 PID: $$(pgrep -f '[v]ite' | head -1)"; \
		echo "💡 Run 'make stop' to stop it"; \
	else \
		echo "❌ Dev server is not running"; \
		echo "💡 Run 'make dev' or 'make dev-bg' to start"; \
	fi

logs: ## Show dev server logs
	@tail -f /tmp/farmboard-dev.log

##@ Environment

check-env: ## Check if .env file exists and is configured
	@if [ ! -f ".env" ]; then \
		echo "⚠️  .env file not found!"; \
		echo "📝 Creating from .env.example..."; \
		cp .env.example .env; \
		echo "⚠️  Please edit .env with your Supabase credentials"; \
		echo "💡 The app will work offline without Supabase"; \
	else \
		echo "✅ .env file exists"; \
		if grep -q "your_supabase" .env; then \
			echo "⚠️  .env contains placeholder values"; \
			echo "💡 Update with real Supabase credentials for cloud sync"; \
			echo "💡 The app will work offline without Supabase"; \
		else \
			echo "✅ .env appears configured"; \
		fi \
	fi

setup: ## Initial setup (install + env + docker)
	@echo "🎯 Running initial setup..."
	@$(MAKE) install
	@$(MAKE) check-env
	@echo ""
	@echo "✅ Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Edit .env with your Supabase credentials (optional)"
	@echo "  2. Run 'make dev' to start development"
	@echo "  3. Run 'make docker-up' for local database (optional)"

##@ Docker

docker-up: ## Start local PostgreSQL with Docker Compose
	@echo "🐳 Starting Docker services..."
	@docker-compose up -d
	@echo "✅ PostgreSQL running on port 5432"

docker-down: ## Stop Docker services
	@echo "🛑 Stopping Docker services..."
	@docker-compose down

docker-logs: ## Show Docker logs
	@docker-compose logs -f

docker-restart: docker-down docker-up ## Restart Docker services

##@ Quality & Testing

lint: ## Run ESLint
	@echo "🔍 Running linter..."
	@npm run lint

lint-fix: ## Run ESLint with auto-fix
	@echo "🔧 Running linter with auto-fix..."
	@npm run lint || true

test: ## Run tests (when implemented)
	@echo "🧪 Running tests..."
	@echo "⚠️  Tests not yet implemented"

typecheck: ## Run TypeScript type checking
	@echo "📝 Type checking..."
	@npx tsc --noEmit

##@ Cleanup

clean: ## Clean build artifacts and caches
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf dist
	@rm -rf .vite
	@rm -rf node_modules/.vite
	@echo "✅ Clean complete!"

clean-all: clean ## Deep clean (including node_modules)
	@echo "🧹 Deep cleaning..."
	@rm -rf node_modules
	@rm -rf package-lock.json
	@echo "✅ Deep clean complete!"

##@ Database

db-schema: ## Apply Supabase schema (requires supabase CLI)
	@if [ -f "supabase/schema.sql" ]; then \
		echo "📊 Supabase schema found"; \
		echo "💡 Run this in your Supabase SQL Editor:"; \
		echo ""; \
		cat supabase/schema.sql; \
	else \
		echo "❌ Schema file not found"; \
	fi

db-shell: ## Connect to local PostgreSQL (Docker must be running)
	@docker-compose exec postgres psql -U postgres -d farmboard

##@ Git

commit: ## Quick commit (prompts for message)
	@echo "💬 Enter commit message:"
	@read msg; \
	git add -A && \
	git commit -m "$$msg"

push: ## Push to current branch
	@echo "⬆️  Pushing to remote..."
	@git push -u origin $$(git rev-parse --abbrev-ref HEAD)

pull: ## Pull from current branch
	@echo "⬇️  Pulling from remote..."
	@git pull origin $$(git rev-parse --abbrev-ref HEAD)

##@ Deployment

deploy-vercel: ## Deploy to Vercel
	@echo "🚀 Deploying to Vercel..."
	@vercel --prod

deploy-preview: ## Deploy preview to Vercel
	@echo "👀 Deploying preview to Vercel..."
	@vercel

##@ Information

info: ## Show project information
	@echo ""
	@echo "📊 Farmboard Project Info"
	@echo "========================="
	@echo ""
	@echo "Git:"
	@echo "  Branch: $$(git rev-parse --abbrev-ref HEAD)"
	@echo "  Commit: $$(git rev-parse --short HEAD)"
	@echo "  Remote: $$(git remote get-url origin 2>/dev/null || echo 'No remote')"
	@echo ""
	@echo "Node:"
	@echo "  Version: $$(node --version)"
	@echo "  NPM: $$(npm --version)"
	@echo ""
	@echo "Dependencies:"
	@echo "  Installed: $$([ -d "node_modules" ] && echo "Yes" || echo "No")"
	@echo ""
	@echo "Environment:"
	@echo "  .env exists: $$([ -f ".env" ] && echo "Yes" || echo "No")"
	@echo ""
	@echo "Docker:"
	@echo "  Services: $$(docker-compose ps --services 2>/dev/null | wc -l || echo "0")"
	@echo ""
	@echo "Dev Server:"
	@if [ -f /tmp/farmboard-dev.pid ] && kill -0 $$(cat /tmp/farmboard-dev.pid) 2>/dev/null; then \
		echo "  Status: Running ✅"; \
		echo "  PID: $$(cat /tmp/farmboard-dev.pid)"; \
		echo "  Logs: /tmp/farmboard-dev.log"; \
	elif pgrep -f "[v]ite" > /dev/null; then \
		echo "  Status: Running ⚠️  (no PID file)"; \
		echo "  PID: $$(pgrep -f '[v]ite' | head -1)"; \
	else \
		echo "  Status: Stopped ❌"; \
	fi
	@echo ""
