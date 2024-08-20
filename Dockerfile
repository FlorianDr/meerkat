FROM denoland/deno:1.45.5 AS builder

WORKDIR /app

COPY . .

RUN deno task ui:cache && \
	deno task ui:build

FROM denoland/deno:1.45.5

WORKDIR /app

# Prefer not to run as root.
# TODO: Enable when there is a way to run as non-root user.
# USER deno

ENV DENO_DIR=/app/.cache

COPY . .

RUN deno task api:cache && \
		deno task api:patch:linux 

COPY --from=builder /app/ui/dist /app/ui/dist

CMD ["task", "api:start"]