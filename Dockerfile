FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

# Development stage
FROM node:20-alpine
COPY . /app
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
ENV PORT=3005
CMD ["npm", "run", "dev"]

# Production stages (commented out for now)
# FROM node:20-alpine AS production-dependencies-env
# COPY ./package.json package-lock.json /app/
# WORKDIR /app
# RUN npm ci --omit=dev

# FROM node:20-alpine AS build-env
# COPY . /app/
# COPY --from=development-dependencies-env /app/node_modules /app/node_modules
# WORKDIR /app
# RUN npm run build

# FROM node:20-alpine
# COPY ./package.json package-lock.json /app/
# COPY --from=production-dependencies-env /app/node_modules /app/node_modules
# COPY --from=build-env /app/build /app/build
# WORKDIR /app
# ENV PORT=80
# CMD ["npm", "run", "start"]