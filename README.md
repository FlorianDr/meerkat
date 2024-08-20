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
3. Run database migration with `deno task db:migrate`.
4. Seed the database with `deno task db:seed`.
5. Cach dependencies with `deno task api:cache` and patch dependencies with
   `deno task api:patch:mac` or `deno task:api:patch:linux`.
6. Start the local development server with `deno task api:dev`.
7. Open a second terminal and start the frontend with `deno task ui:dev`.

Open your browser and visit
[http://localhost:8000/events/01j4yc358mf4xrd5aqj8kvj75t](http://localhost:8000/events/01j4yc358mf4xrd5aqj8kvj75t)
to view the app.
