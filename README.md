# LUIZA kontra AREK

Prototyp webowej gry zręcznościowej 2D w Phaserze. LUIZA automatycznie sprząta meble po dotknięciu, a AREK chodzi po mieszkaniu i z powrotem robi bałagan.

## Co już działa

- trzy poziomy mieszkań widziane z góry
- punktacja i licznik czasu 60 sekund na poziom
- automatyczne sprzątanie obiektów z animacją i dźwiękiem
- przeciwnik AREK, który psuje tylko już posprzątane obiekty
- dwie umiejętności: `Wynieś śmieci` i `Foch`
- HUD w DOM i podstawowe sterowanie dotykowe
- proceduralne, bardziej czytelne asety LUIZY, ARKA i mebli

## Sterowanie

- `WASD` lub strzałki: ruch LUIZY
- `1`: aktywuj `Wynieś śmieci`
- `2`: aktywuj `Foch`
- na telefonie: przyciski kierunkowe i przyciski umiejętności na ekranie

## Uruchomienie

```bash
npm install
npm run dev
```

## Następne kroki

- dodać prawdziwe ściany i kolizje labiryntu
- zamienić placeholderowe kształty na rysowane sprite'y
- dopracować menu startowe, ekran końca gry i restart poziomu
- wzbogacić audio oraz efekty wizualne sprzątania


ODPALAMY