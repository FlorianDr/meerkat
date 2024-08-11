FROM denoland/deno:1.45.5

# The port that your application listens to.
EXPOSE 8000

# Prefer not to run as root.
USER deno

WORKDIR /app

ENV DENO_DIR=/app/.cache

COPY . .
RUN deno cache ./main.ts

RUN ./scripts/patch-dependencies-linux.sh

CMD ["task", "start"]
