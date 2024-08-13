## Meerkat

A privacy-preserving audience engagement tool for in-person and virtual
conferences. Meerkat uses Zupass for authentication and collection of associated
data.

### Prerequisites

- [Deno](https://deno.land/)
- [Docker](https://www.docker.com/)

## Get Started

1. Copy `.env.example` to `.env` and update the values as needed.
2. Start the database with `docker compose up -d`.
3. Run database setup with `deno task db:setup`.
4. Run database migration with `deno task db:migrate`.
5. Seed the database with `./scripts/seed.sh`.
6. Cache dependencies with `deno task cache`.
7. Patch dependencies with `./scripts/patch-dependencies-macos.sh` or
   `./scripts/patch-dependencies-linux.sh`.
8. Start the local development server with `deno task dev`.

Open your browser and visit
[http://localhost:8000/events/01j4yc358mf4xrd5aqj8kvj75t](http://localhost:8000/events/01j4yc358mf4xrd5aqj8kvj75t)
to view the app.
