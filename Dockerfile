# Use official Node.js image as the base
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies based on lock file if available
COPY package.json ./
COPY bun.lockb* ./
COPY package-lock.json* ./
COPY yarn.lock* ./

# Install dependencies (prefer Bun if lockfile exists, else npm)
RUN if [ -f bun.lockb ]; then \
    npm install -g bun && bun install; \
  elif [ -f yarn.lock ]; then \
    yarn install; \
  else \
    npm ci; \
  fi

# Copy the rest of the application code
COPY . .

# Build the React app
RUN if [ -f bun.lockb ]; then \
    bun run build; \
  elif [ -f yarn.lock ]; then \
    yarn build; \
  else \
    npm run build; \
  fi

# Production image, copy built assets to nginx or use 'serve'
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package.json ./

# Install 'serve' to serve the static files
RUN npm install -g serve

# Expose port 4173 (default for Vite preview/serve) or 3000
EXPOSE 4173
ENV PORT=4173

# Start the app
CMD ["serve", "-s", "dist", "-l", "4173"]
