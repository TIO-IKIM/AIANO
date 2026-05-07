# Dockerfile (or Dockerfile.prod)
FROM node:20-slim AS builder

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
# Enable Corepack for Yarn
RUN corepack enable && corepack prepare yarn@4.5.3 --activate

# Copy yarn configuration files
COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .

# Make sure yarn's cache and state directories exist
RUN mkdir -p .yarn/cache .yarn/install-state

# Install dependencies
RUN --mount=type=cache,target=/root/.yarn/berry/cache \
    yarn install --immutable

# Copy the rest of the application
COPY . .

# Build the application
RUN yarn build --mode production

# Create a lightweight production image
FROM node:20-slim

WORKDIR /app

# Install curl for health checks and serve to host the static files
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* && \
    yarn global add serve

# Copy the built files from builder
COPY --from=builder /app/dist ./dist

# Copy PWA assets
COPY --from=builder /app/public/favicon.ico ./dist/

# Expose the port serve will use
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the server with cache control headers
# -s: single page application mode
# -l: listen port
# --no-clipboard: don't copy URL to clipboard
# Note: serve doesn't support custom headers directly, but Vite already adds hash-based filenames for cache busting
CMD ["serve", "-s", "dist", "-l", "3000"]
