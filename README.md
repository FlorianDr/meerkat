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
5. Start the local development server with `deno task dev`.

Open your browser and visit `http://localhost:8000` to view the app.

