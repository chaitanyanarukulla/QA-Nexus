FROM node:20-bullseye-slim AS base

# Install dependencies only when needed
FROM base AS deps
# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl libssl-dev ca-certificates
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

# Set HOME environment variable
ENV HOME=/home/nextjs

# Create home directory for nextjs user
RUN mkdir -p /home/nextjs && chown nextjs:nodejs /home/nextjs

# Install k6
COPY --from=grafana/k6:latest /usr/bin/k6 /usr/bin/k6

# Create tmp directory for k6 scripts
RUN mkdir -p /app/tmp && chown nextjs:nodejs /app/tmp

# Set npm cache to a writable directory
ENV npm_config_cache=/tmp/.npm

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy Playwright config
COPY --from=builder --chown=nextjs:nodejs /app/playwright-api.config.ts ./

# Install Playwright (since it's a dev dependency not included in standalone)
RUN npm install @playwright/test

USER nextjs

EXPOSE 3004

ENV PORT 3004
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
