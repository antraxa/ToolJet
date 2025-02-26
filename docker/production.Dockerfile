FROM node:18.18.2-buster as builder

RUN npm i -g npm@9.8.1

RUN mkdir -p /app
WORKDIR /app

COPY ./package.json ./package.json
COPY ./plugins/package.json ./plugins/package-lock.json ./plugins/
RUN npm --prefix plugins install
COPY ./plugins/ ./plugins/
RUN NODE_ENV=production npm --prefix plugins run build
RUN npm --prefix plugins prune --production

COPY ./frontend/package.json ./frontend/package-lock.json ./frontend/
RUN npm --prefix frontend install
COPY ./frontend/ ./frontend/
RUN npm --prefix frontend run build --production
RUN npm --prefix frontend prune --production

COPY ./server/package.json ./server/package-lock.json ./server/
RUN npm --prefix server install
COPY ./server/ ./server/
RUN npm install -g @nestjs/cli
RUN npm --prefix server run build

FROM node:18.18.2-slim

RUN apt-get update && apt-get install -y \
    postgresql-client \
    freetds-dev \
    libaio1 \
    wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/plugins/dist ./plugins/dist
COPY --from=builder /app/plugins/client.js ./plugins/client.js
COPY --from=builder /app/plugins/node_modules ./plugins/node_modules
COPY --from=builder /app/plugins/packages/common ./plugins/packages/common
COPY --from=builder /app/plugins/package.json ./plugins/package.json
COPY --from=builder /app/frontend/build ./frontend/build
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/server/.version ./server/.version
COPY --from=builder /app/server/entrypoint.sh ./server/entrypoint.sh
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/templates ./server/templates
COPY --from=builder /app/server/scripts ./server/scripts
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/templates ./templates
COPY --from=builder /app/server/.version ./.version

RUN npm install dotenv@10.0.0 joi@17.4.1

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

ENV PATH /app/node_modules/.bin:$PATH

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
