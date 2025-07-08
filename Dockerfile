FROM oven/bun:latest
WORKDIR /app

# Install dependencies using bun
COPY bun.lockb bun.lock package.json ./
RUN bun install --frozen-lockfile

# Copy rest of the source code
COPY . .

EXPOSE 8080

CMD ["bun", "run", "dev"]
