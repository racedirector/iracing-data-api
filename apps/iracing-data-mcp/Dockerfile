# Build from the repository root. No credential input or publication.
FROM node:24-bookworm-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6 AS build
WORKDIR /build
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts \
 && pnpm --filter '@iracing-data/iracing-data-mcp...' build \
 && pnpm --filter '@iracing-data/iracing-data-mcp' deploy --legacy --prod --frozen-lockfile --ignore-scripts /runtime \
 && rm -rf /runtime/node_modules/@iracing-data/api-client-fetch/src /runtime/node_modules/@iracing-data/api-client-fetch/docs \
 && rm -f /runtime/node_modules/@iracing-data/api-client-fetch/tsconfig.json

FROM node:24-bookworm-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6 AS runtime
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /opt/yarn* \
 && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/pnpm /usr/local/bin/pnpx /usr/local/bin/yarn /usr/local/bin/yarnpkg
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /runtime /app
USER 1000:1000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s CMD ["node", "-e", "require('node:http').get('http://127.0.0.1:3000/healthz',{headers:{Host:(process.env.IRACING_MCP_ALLOWED_HOSTS||'127.0.0.1:3000').split(',')[0]}},r=>{r.resume();process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"]
CMD ["node", "dist/main.js"]
