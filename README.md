# Bobyard take home interview

## Getting started

### Shortlist to run

* Clone this repo
* Install [Bun runtime](https://bun.com)
* `bun install` -- Install dependencies
* Copy `.env.example` file -> `.env` or manually define env vars
* Setup Postgres instance, if using existing instance or some other method, just update `.env` file with target DB connection information, otherwise below are steps for Docker Compose
    * Install [Docker](https://docs.docker.com/compose/install/) (or my preferred [Podman](https://github.com/containers/podman-compose)) Compose
    * `docker compose up db` -- This will use existing `.env` file to set up user + pass + database schema
* `bun run start:fresh-db` -- Runs runs database migrations, seeds data, runs app in production. Bun automatically pulls in `.env` file and uses it's `DATABASE_URL` to determine connection

### Development

To start a development server:

```bash
bun run dev
```

To run for production:

```bash
bun run start
```

If creating new files, recommended to run `bun run barrel` to update `index.ts` files


This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
