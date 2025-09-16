#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

LOG_DIR="logs"
LOG_FILE="$LOG_DIR/signals.log"

mkdir -p "$LOG_DIR"

# Redirect all output to the log file for cron usage
exec >>"$LOG_FILE" 2>&1

log() {
  local timestamp
  timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
  printf '[%s] %s\n' "$timestamp" "$*"
}

trap 'log "Script failed at line ${LINENO}."' ERR

log "Starting signal generation run."

if [[ -f .env ]]; then
  set -o allexport
  # shellcheck disable=SC1091
  source ".env"
  set +o allexport
  log "Loaded environment variables from .env."
else
  log "Missing .env file. Aborting."
  exit 1
fi

SYMBOLS_FROM_ENV="${SYMBOLS:-}"
unset SYMBOLS

declare -a SYMBOLS
if [[ -n "$SYMBOLS_FROM_ENV" ]]; then
  IFS=', ' read -r -a SYMBOLS <<< "${SYMBOLS_FROM_ENV//,/ }"
else
  SYMBOLS=(BTCUSDT ETHUSDT SOLUSDT)
fi

INTERVAL="${INTERVAL:-1h}"
STRATEGY="${STRATEGY:-sma}"

log "Using interval '$INTERVAL' and strategy '$STRATEGY' for symbols: ${SYMBOLS[*]}"

for symbol in "${SYMBOLS[@]}"; do
  log "Processing $symbol"
  node bin/cs fetch:klines --symbol "$symbol" --interval "$INTERVAL" --resume
  node bin/cs compute:indicators --symbol "$symbol" --interval "$INTERVAL"
  node bin/cs detect:patterns --symbol "$symbol" --interval "$INTERVAL"
  node bin/cs signals:generate --symbol "$symbol" --interval "$INTERVAL" --strategy "$STRATEGY"
  log "Completed $symbol"
done

log "Signal generation run finished successfully."
