# PakkausPro Advanced

PakkausPro on helppokäyttöinen työkalu, joka auttaa Suomen yrityksiä täyttämään pakkaustietojen raportointivelvoitteet (Extended Producer Responsibility, EPR). Tämä versio on kehittyneempi kuin alkuperäinen MVP ja sisältää datan validoinnin, virheiden tunnistamisen sekä ohjeet jatkotoimenpiteille.

## Ominaisuudet

- **CSV‑lataus**: Käyttäjä voi ladata CSV‑tiedoston, jossa on kaksi saraketta: `material` (materiaalilaji) ja `weight` (paino kilogrammoina). Tuen kieli on englanti ja suomi, joten `materiaali`/`paino` kelpaavat.
- **Datan validointi**: Palvelin tarkistaa, että painot ovat numeerisia ja materiaali kuuluu tunnistettuun kategoriaan (paper, plastic, metal, glass, wood, composite, other). Tuntemattomat materiaalit ja puuttuvat arvot kirjataan virhelistaan.
- **Yhteenvedon laskenta**: Käsittelee kaikki kelvolliset rivit ja summaa materiaalien painot.
- **Virheiden ja suositusten raportointi**: Palauttaa listan riveistä, joissa oli puutteita, ja antaa suosituksia esimerkiksi kirjoitusasujen korjaamiseen.
- **Regulaatioon liittyvä ohjeistus**: Käyttöliittymässä näkyy tiivis lista EPR‑velvoitteista, kuten raportoinnin määräpäivät ja liityntä Rinki Oy:hin【75085986780873†L197-L217】.
- **Käyttöliittymä**: Yksinkertainen HTML5‑sivu, jossa on tiedostonvalitsin, lähetyspainike, taulukko yhteenvetotuloksille sekä suositukset.

## Käyttö

1. **Asenna riippuvuudet** (vaatii Node.js:n):

   ```bash
   npm install
   ```

2. **Käynnistä palvelin**:

   ```bash
   node server.js
   ```

3. Avaa selain osoitteessa `http://localhost:3000` ja lataa CSV‑tiedostosi.

## CSV‑muoto

CSV:ssä tulee olla otsikkorivi. Vähintään seuraavat sarakkeet hyväksytään:

| Sarake   | Kuvaus                                                                                |
|----------|---------------------------------------------------------------------------------------|
| material | Materiaalin nimi (paper, plastic, metal, glass, wood, composite, other)              |
| weight   | Paino kilogrammoina                                                                   |

Myös suomenkieliset otsikot `materiaali` ja `paino` käyvät. Jos paino ei ole numeerinen tai materiaali ei kuulu tunnettuihin luokkiin, rivi raportoidaan virhelistaan.

## Kehitysehdotuksia

Tämä versio on perusprototyyppi. Tulevaisuudessa voidaan kehittää mm. seuraavia ominaisuuksia:

- **Käyttäjien tunnistautuminen** ja tietojen tallennus tietokantaan (esim. PostgreSQL), jotta raportteja voi tallentaa ja lähettää suoraan viranomaiselle.
- **API‑integraatio Rinki Oy:n järjestelmiin**, jotta raportit voidaan automatisoida.
- **Kielituki ja laajempi materiaalisanaston tuki**, esimerkiksi kotimaiset termit suoraan tunnistuslistaan.
- **Graafiset raportit**: pylväsdiagrammit ja trendit visualisoivat materiaalien käyttöä.

## Lähteet

PakkausPro noudattaa Suomen tuottajavastuuta koskevia ohjeita. Rinki Oy:n mukaan kaikkien markkinoille pakkauksia saattavien yritysten on raportoitava käyttämänsä pakkaukset vuosittain ja ilmoitettava ne 31.1. mennessä【75085986780873†L197-L217】.