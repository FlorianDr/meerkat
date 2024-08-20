FROM denoland/deno:1.45.5

# The port that your application listens to.
EXPOSE 8000

# Prefer not to run as root.
# TODO: Use non-root user if esbuild doesn't fail with permission errors.
# USER deno

WORKDIR /app

ENV DENO_DIR=/app/.cache

COPY . .

RUN deno task api:cache && \
		deno task api:patch:linux && \
		deno task ui:cache && \
		deno task ui:build

CMD ["task", "api:start"]
