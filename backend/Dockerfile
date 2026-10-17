FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source (excluded files handled by .dockerignore)
COPY . .

# Set ownership for non-root user
RUN chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "start"]