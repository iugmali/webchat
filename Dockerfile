FROM node:20.6-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV production

RUN npm run build

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
RUN chown nodejs:nodejs dist

RUN rm -rf src

USER nodejs

EXPOSE 8080

ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
