FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
WORKDIR /app


######################################
# Pre Stage: Turbo prune
######################################
FROM base AS prestage
RUN apk add --no-cache libc6-compat
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm add -g turbo
COPY . .
RUN turbo prune @repo/api --docker


######################################
# First Stage: Install dependencies
######################################
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

COPY .gitignore .gitignore
COPY --from=prestage /app/out/json/ .
COPY --from=prestage /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts


######################################
# Second Stage: Build
######################################
FROM base AS builder
COPY --from=deps /app/ .
COPY --from=prestage /app/out/full/ .

RUN pnpm turbo build --filter=@repo/api...


######################################
# Third Stage: Production runner
######################################
FROM node:24-alpine AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

WORKDIR /app

ENV NODE_ENV="production"

COPY --from=builder --chown=nestjs:nodejs /app .

CMD ["node", "dist/main.js"]
