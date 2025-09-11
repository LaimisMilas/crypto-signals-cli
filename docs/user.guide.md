# Naudotojo gidas

Šis dokumentas paaiškina, kaip pradėti naudotis `crypto-signals-cli` ir gauti pirmą sugeneruotą prekybos signalą.

## 1. Pasiruošimas

1. Nukopijuokite `.env.example` į `.env` ir sukonfigūruokite prisijungimus.
2. Paleiskite PostgreSQL duomenų bazę:
   ```bash
   docker compose up -d db
   ```
3. Įdiekite priklausomybes ir paleiskite migracijas:
   ```bash
   npm install
   npm run migrate
   ```
4. (Pasirinktinai) užpildykite simbolių lentelę:
   ```bash
   npm run seed
   ```

## 2. Duomenų paruošimas

1. Atsisiųskite žvakes:
   ```bash
   node bin/cs fetch:klines --symbol BTCUSDT --interval 1m --limit 1000
   ```
2. Apskaičiuokite indikatorius:
   ```bash
   node bin/cs compute:indicators --symbol BTCUSDT --interval 1m
   ```
3. Aptikite žvakių modelius (pattern'us):
   ```bash
   node bin/cs detect:patterns --symbol BTCUSDT --interval 1m
   ```

## 3. Signalų generavimas

Sugeneruokite signalus pasirinkta strategija:
```bash
node bin/cs signals:generate --symbol BTCUSDT --interval 1m \
  --strategy SidewaysReversal --strategy-config '{"oversoldRsi":25}'
```
Komanda įrašys pirkimo ir pardavimo signalus į `signals` lentelę ir išves, kiek jų buvo sugeneruota.

## 4. Scenarijaus pavyzdys

Jonas nori greitai sužinoti, kada verta pirkti arba parduoti BTCUSDT 1 minutės intervale. Jis atlieka aukščiau aprašytus žingsnius ir paleidžia `signals:generate` su strategija `SidewaysReversal`. Po komandos įvykdymo Jonas gauna signalų sąrašą, kurį gali naudoti backtestui ar realiai prekybai.

## 5. Nauda

- Automatizuotas duomenų surinkimas ir apdorojimas.
- Konsistentiškai taikomos strategijos.
- Galimybė lengvai išbandyti idėjas (backtest) prieš realią prekybą.
