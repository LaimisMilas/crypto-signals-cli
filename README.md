# crypto-signals-cli

Command line tools for fetching market data, computing indicators, detecting patterns and generating trading signals.

## Usage

Copy `.env.example` to `.env` and adjust settings.

```bash
npm install
npm run migrate
node bin/cs fetch:klines --symbol BTCUSDT
```

See `bin/cs --help` for all commands.
