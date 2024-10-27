FROM denoland/deno:2.0.2 AS base
FROM base AS builder

WORKDIR /app

COPY . .

RUN deno install && deno task ui:build

FROM base

WORKDIR /app

# Prefer not to run as root.
# TODO: Enable when there is a way to run as non-root user.
# USER deno

ENV DENO_DIR=/app/.cache

COPY . .

RUN deno install && \
 deno task api:cache && \
 deno task api:patch

COPY --from=builder /app/ui/dist /app/ui/dist

CMD ["task", "api:start"]
