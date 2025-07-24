# PakkausPro MVP

Tämä hakemisto sisältää minimoitun ratkaisun (Minimum Viable Product) PakkausPro‑palvelulle. MVP on toteutettu Node.js:llä ja Expressillä ja tarjoaa yksinkertaisen tavan ladata CSV‑tiedosto, josta lasketaan pakkausmateriaaleittain yhteenlasketut painot. Tämän avulla pk‑yritykset voivat nopeasti arvioida pakkausraportoinnin perusteet.

## Ominaisuudet

- **CSV‑upload**: Lähetä CSV‑tiedosto, jossa sarakkeet `packaging_material` ja `weight_grams` kuvaavat pakkausmateriaalin nimeä ja painoa grammoissa.
- **Aggregointi**: Sovellus laskee jokaiselle materiaalille yhteenlasketun painon ja palauttaa tuloksen JSON‑muodossa.
- **Web‑käyttöliittymä**: Mukana on yksinkertainen HTML‑sivu, josta voit valita tiedoston ja nähdä tulokset.
- **CORS**: CORS on sallittu, joten tätä API:ta voi käyttää myös muista sovelluksista.

## Käyttöönotto

1. Varmista, että sinulla on Node.js (>14) asennettuna.
2. Asenna riippuvuudet hakemiston juuresta:

   ```bash
   npm install
   ```

3. Käynnistä palvelin:

   ```bash
   npm start
   ```

4. Avaa selaimessa osoite `http://localhost:3000`. Lataa CSV‑tiedosto ja tarkastele tuloksia.

## CSV‑tiedoston muoto

CSV‑tiedostossa tulee olla otsakerivi ja kaksi saraketta:

```
order_id,product_name,packaging_material,weight_grams
1001,Tuote A,pahvi,25
1001,Tuote A,muovi,10
1002,Tuote B,pahvi,30
```

Nimet eivät ole tärkeitä; parseri yrittää käyttää vaihtoehtoisia sarake­nimikkeitä `packaging` ja `material` sekä `weight`.

## Jatkokehitys

Tämä MVP keskittyy CSV‑datan aggregointiin. Jatkokehityksessä voidaan:

- Lisätä käyttäjäkohtainen kirjautuminen ja tietokanta, johon pakkaustiedot tallennetaan.
- Tukea automaattista API‑integraatiota verkkokauppa‑alustoihin (esim. Shopify, WooCommerce).
- Generoida PDF‑raportteja ja automatisoida lähetykset Rinki‑järjestelmään.
- Laajentaa tuki tuleviin EPR‑kategorioihin (akut, kalastusvälineet, tekstiilit).

## Lisenssi

Tämä projekti on tarkoitettu demonstraatiokäyttöön eikä sisällä takuita.