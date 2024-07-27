FROM node:21.4.0-alpine AS build

WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN rm -rf ./dist
RUN npm run build

# Production stage
FROM node:21.4.0-alpine AS production

WORKDIR /app
COPY package*.json .
COPY scripts/ /scripts
RUN apk update && apk add bash && npm ci --only=production && chmod -R +x /scripts
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/utils/swagger.yaml ./dist/utils/

EXPOSE 5000
ENV PATH="/scripts:usr/local/bin:$PATH"
ENTRYPOINT ["automation.sh"]