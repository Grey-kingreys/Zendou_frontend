# syntax=docker/dockerfile:1
#
# Image Docker du frontend Zendou (Next.js 16.3, App Router) pour Dokploy.
#
# Trois stages :
#   1. deps    : installe les dépendances, sans exécuter de scripts
#                d'installation (garde `allow-scripts` du repo, voir
#                backend/Dockerfile pour le détail).
#   2. build   : `next build` avec `output: "standalone"` (next.config.ts)
#                -> produit .next/standalone (serveur node minimal + deps
#                tracées) et .next/static séparément.
#   3. runtime : copie uniquement standalone + static + public. Utilisateur
#                non-root, ~120 Mo au lieu de la totalité de node_modules.
#
# ── IMPORTANT : NEXT_PUBLIC_API_URL est inliné au BUILD ─────────────────────
# Next.js remplace `process.env.NEXT_PUBLIC_*` par sa valeur littérale dans
# le bundle JS envoyé au navigateur *pendant* `next build` (src/lib/api.ts
# lit `process.env.NEXT_PUBLIC_API_URL`). La définir seulement au `docker run`
# (ENV runtime) n'a AUCUN EFFET : le code déjà compilé contient la valeur
# figée au moment du build. Il FAUT donc la passer en `--build-arg` à
# `docker build`, pas seulement en variable d'environnement du service
# Dokploy. Voir docs/DEPLOIEMENT-DOKPLOY.md pour la configuration exacte
# côté Dokploy (build-time env vars du service).
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ---------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Valeur publique inlinée dans le bundle JS au build. Doit pointer vers
# l'URL publique du backend (ex: https://api.zendou.dev) en production.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# .next/standalone contient un server.js minimal + un node_modules réduit
# (uniquement ce que le traçage de Next.js a jugé nécessaire). .next/static
# et public/ ne sont pas copiés dedans par `next build` et doivent l'être
# manuellement (cf. doc Next.js sur `output: "standalone"`).
COPY --from=build --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nodejs:nodejs /app/public ./public

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get({host:'127.0.0.1',port:process.env.PORT||3000,path:'/'},(res)=>{process.exit(res.statusCode<500?0:1)}).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
