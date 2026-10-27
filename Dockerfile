FROM oven/bun:1 AS frontend
WORKDIR /app
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY frontend/ ./
RUN bun run build

FROM golang:1.27 AS backend
WORKDIR /app
COPY backend/ ./
RUN CGO_ENABLED=0 go build -o /server ./cmd/server

FROM gcr.io/distroless/static-debian12
COPY --from=backend /server /server
COPY --from=frontend /app/dist /static
ENV STATIC_DIR=/static PORT=8080
EXPOSE 8080
ENTRYPOINT ["/server"]
