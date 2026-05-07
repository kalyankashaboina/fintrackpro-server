FROM node:20-alpine AS base

ENV NODE_ENV=production

WORKDIR /app

FROM base AS dependencies

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force

FROM base AS production

RUN apk add --no-cache dumb-init

RUN addgroup -S nodejs -g 1001 && \
    adduser -S expressjs -u 1001 -G nodejs

ENV NODE_ENV=production \
    PORT=5000

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY --chown=expressjs:nodejs . .

RUN chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 5000

HEALTHCHECK --interval=30s \
             --timeout=5s \
             --start-period=15s \
             --retries=3 \
  CMD node -e "\
    require('http')\
      .get('http://127.0.0.1:5000/api/health', (res) => {\
        process.exit(res.statusCode === 200 ? 0 : 1)\
      })\
      .on('error', () => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "server.js"]