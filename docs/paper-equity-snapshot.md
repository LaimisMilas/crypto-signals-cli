# paper:equity:snapshot

Įrašo dabartinį “paper trading“ kapitalo dydį.

## Naudojimas
```bash
node bin/cs paper:equity:snapshot --equity 10500 --source live [OPCIJOS]
```

## Opcijos
- `--equity <sum>` – privalomas; balansas.
- `--source <name>` – privalomas; šaltinio identifikatorius.
- Globalios: `--dry-run`, `--verbose`.

## Aktyvumo srautas
1. Paimamas dabartinis laiko žymuo.
2. Įrašo į `equity_paper` lentelę (nebent `--dry-run`).
3. Išveda „equity snapshot recorded“.

