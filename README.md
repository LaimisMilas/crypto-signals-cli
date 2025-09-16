# crypto-signals-cli

Command line tools for fetching market data, computing indicators, detecting patterns and generating trading signals.

## Usage

Copy `.env.example` to `.env` and adjust settings.

Start the PostgreSQL database and run migrations:

```bash
docker compose up -d db

npm install
npm run migrate
node bin/cs fetch:klines --symbol BTCUSDT
```

See `bin/cs --help` for all commands.

## Scheduling

You can automate signal generation with cron once the environment is configured:

```cron
*/30 * * * * /usr/bin/env bash /path/to/crypto-signals-cli/scripts/run-signals.sh
```

Ensure the `.env` file contains the required API keys, database credentials, and any symbol overrides before scheduling the job. The script relies on the Node.js runtime and an accessible PostgreSQL database, so install dependencies with `npm install`, run the migrations, and keep the database service running on the host where cron executes.
