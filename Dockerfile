############################
# Build (devDependencies needed for nest build)
############################
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

RUN npm ci && npm run build

############################
# Production runtime
############################
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]

