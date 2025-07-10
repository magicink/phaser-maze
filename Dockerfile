FROM oven/bun:latest AS builder
WORKDIR /app

# Install all dependencies to build the app
COPY bun.lockb bun.lock package.json ./
RUN bun install --frozen-lockfile

# Copy source and build the production bundle
COPY . .
RUN bun run build

FROM oven/bun:latest
WORKDIR /app

# Install only production dependencies
COPY bun.lockb bun.lock package.json ./
RUN bun install --production --frozen-lockfile

# Copy the built app from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["bun", "x", "serve", "dist", "-l", "8080"]
