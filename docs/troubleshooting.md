# Troubleshooting & Debugging Guide

This guide provides solutions for common issues encountered when setting up or running AIANO.

## 🗄️ Database Connection Issues

If you encounter issues connecting to the PostgreSQL database:

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# View PostgreSQL logs for error messages
docker compose logs postgres

# Restart the PostgreSQL service
docker compose restart postgres
```

### Common DB errors:
- **"Connection refused"**: Usually means the database container hasn't finished starting yet. Wait 10-20 seconds.
- **"Authentication failed"**: Check your `POSTGRES_USER` and `POSTGRES_PASSWORD` in `api/.env` and ensure they match what's in `docker-compose.yml`.

---

## 🎨 Frontend Build Issues

If the UI fails to start or build:

```bash
# Clear node modules and reinstall dependencies
cd ui
rm -rf node_modules
yarn install
```

### Common UI errors:
- **"VITE_API_URL not found"**: Ensure `ui/.env` exists and has the correct backend URL.
- **Dependency conflicts**: If `yarn install` fails, try `yarn install --force`.

---

## ⚙️ Backend Issues

If the API is not responding:

```bash
# Recreate the Python virtual environment
cd api
rm -rf .venv
uv sync
```

### Common API errors:
- **"ModuleNotFoundError"**: Ensure you are running with `uv run` or have activated the virtual environment.
- **Environment variables missing**: Check the console output for "SECRET_KEY mandatory" or similar validation warnings.

---

## 🔄 Migration Issues

If the database schema is out of sync with the models:

```bash
# Check current migration status
cd api
uv run alembic current

# View migration history
uv run alembic history

# If migrations are out of sync, try force-upgrading
uv run alembic upgrade head
```

### Docker Migration Management:
For Docker setups, migrations run automatically on startup. To manually run them inside a running container:
```bash
docker compose exec backend uv run alembic upgrade head
```

---

## 🐛 General Debugging

### Logging
AIANO uses environment-aware logging.
- **Dev mode**: Detailed, human-readable logs in the console.
- **Prod mode**: Structured JSON logs for ingestion by monitoring tools.

You can set the log level using the `LOG_LEVEL` environment variable (e.g., `DEBUG`, `INFO`, `WARNING`).
