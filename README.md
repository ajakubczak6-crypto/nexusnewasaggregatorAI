# Nexus AI — Inteligentny Agregator Newsów Live

Gotowy do wdrożenia online serwis informacyjny czasu rzeczywistego (React + Vite + Tailwind CSS + Serverless API dla Vercel i Netlify).

## Funkcje aplikacji
- **4 zakładki tematyczne z podtematami i czystym routingiem URL**:
  - `/prawo` (*Nowa legislatywa i zmiany w obecnej*, *Orzecznictwo*, *Prawo międzynarodowe*)
  - `/ai` (*Innowacje w modelach AI*, *Regulacje i etyka AI*, *Wdrożenia biznesowe*)
  - `/polityka` (*Afery i kontrowersje*, *Wybory i sondaże*, *Polityka gospodarcza*)
  - `/gry` (*Prawo gier komputerowych*, *Guilty Gear Strive*, *Inne*)
- **Wyszukiwanie na żywo (Auto-Sync co 60s + wyszukiwanie zapytań)**: pobieranie z Google News RSS (PL/EN), Hacker News API, Reddit JSON oraz Gemini Search Grounding.
- **Weryfikacja poprawności i dostępności HTTP linków**: walidacja składni URL, usuwanie parametrów śledzących (`utm_*`), sprawdzanie kodów odpowiedzi HTTP, opóźnienia (`ms`) i tagów paywalla przez wbudowane funkcje serwerowe (`/api/proxy`) z automatycznym fallbackiem CORS.
- **Dynamiczny algorytm rankingu**: `Score = (Waga Nowości * Nowość) + (Waga Istotności * Relevance)` z czasem względnym aktualizowanym na żywo co 5 sekund oraz wielowarstwową deduplikacją.

---

## Szybkie wdrożenie online (3 sposoby)

### Opcja 1: Vercel (Zalecana — pełny backend proxy + frontend w 60 sekund)
1. Rozpakuj archiwum i wgraj folder do nowego repozytorium na **GitHub** (lub zainstaluj CLI: `npm i -g vercel`).
2. Wejdź na [vercel.com/new](https://vercel.com/new) i zaimportuj repozytorium (lub wpisz `vercel --prod` w terminalu wewnątrz folderu projektu).
3. *(Opcjonalnie)* W ustawieniach projektu Vercel (**Settings -> Environment Variables**) dodaj `GEMINI_API_KEY` (darmowy klucz z [Google AI Studio](https://aistudio.google.com/apikey)), aby włączyć klasyfikację LLM i Google Search Grounding po stronie serwera.
4. Kliknij **Deploy** — otrzymasz publiczny adres `https://twoja-nazwa.vercel.app`.

### Opcja 2: Netlify (Drag & Drop lub GitHub)
1. W terminalu uruchom:
   ```bash
   npm install
   npm run build
   ```
2. Przeciągnij wygenerowany folder `dist` na stronę [app.netlify.com/drop](https://app.netlify.com/drop) — strona będzie natychmiast online!
3. Jeśli połączysz repozytorium GitHub z Netlify, automatycznie zadziałają również funkcje serwerowe z katalogu `netlify/functions`.

### Opcja 3: Uruchomienie lokalne
```bash
npm install
npm run dev
```
Aplikacja uruchomi się pod adresem `http://localhost:3000`.
