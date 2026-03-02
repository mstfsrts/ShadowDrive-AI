// ─── ShadowDrive AI — Database Seed ───
// All course data is inline. No JSON imports.
// Safe to re-run (deletes + re-creates in a transaction).

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Types ──────────────────────────────────────────────────────────────────

interface Line {
  id: number;
  targetText: string;
  nativeText: string;
  pauseMultiplier: number;
}

interface Scenario {
  title: string;
  targetLang: string;
  nativeLang: string;
  lines: Line[];
}

interface LessonData {
  id: string;
  title: string;
  scenario: Scenario;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  order: number;
  category: string;
  subcategory: string | null;
  lessons: LessonData[];
}

// ─── Course 1: Groene Boek (Beginners) ─────────────────────────────────────

const groeneBoek: CourseData = {
  id: 'groene_boek',
  title: 'Beginners',
  description: 'Temel Hollandaca. Günlük yaşam cümleleri.',
  emoji: '📗',
  color: 'emerald',
  order: 0,
  category: 'Delftse Methode',
  subcategory: null,
  lessons: [
    {
      id: 'groene_boek_les_1',
      title: 'Les 1 — Kennis maken',
      scenario: {
        title: 'Groene Boek – Les 1: Kennis maken',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
          { id: 1, targetText: 'Hallo, hoe heet je?', nativeText: 'Merhaba, adın ne?', pauseMultiplier: 1.5 },
          { id: 2, targetText: 'Ik heet Anna. En jij?', nativeText: 'Benim adım Anna. Ya senin?', pauseMultiplier: 1.5 },
          { id: 3, targetText: 'Ik ben Mehmet. Aangenaam.', nativeText: 'Ben Mehmet. Memnun oldum.', pauseMultiplier: 1.4 },
          { id: 4, targetText: 'Waar kom je vandaan?', nativeText: 'Nerelisin?', pauseMultiplier: 1.4 },
          { id: 5, targetText: 'Ik kom uit Turkije.', nativeText: "Türkiye'den geliyorum.", pauseMultiplier: 1.3 },
          { id: 6, targetText: 'Hoe gaat het met je?', nativeText: 'Nasılsın?', pauseMultiplier: 1.3 },
          { id: 7, targetText: 'Goed, dank je wel!', nativeText: 'İyiyim, teşekkür ederim!', pauseMultiplier: 1.3 },
          { id: 8, targetText: 'Leuk je te ontmoeten.', nativeText: 'Tanıştığımıza memnun oldum.', pauseMultiplier: 1.5 },
        ],
      },
    },
    {
      id: 'groene_boek_les_2',
      title: 'Les 2 — Boodschappen doen',
      scenario: {
        title: 'Groene Boek – Les 2: Boodschappen doen',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
          { id: 1, targetText: 'Goedemorgen, kan ik u helpen?', nativeText: 'Günaydın, size yardımcı olabilir miyim?', pauseMultiplier: 1.6 },
          { id: 2, targetText: 'Ja, ik zoek brood.', nativeText: 'Evet, ekmek arıyorum.', pauseMultiplier: 1.4 },
          { id: 3, targetText: 'Het brood is in gangpad twee.', nativeText: 'Ekmek ikinci koridorda.', pauseMultiplier: 1.5 },
          { id: 4, targetText: 'Hoeveel kost de kaas?', nativeText: 'Peynir ne kadar?', pauseMultiplier: 1.4 },
          { id: 5, targetText: 'Dat is drie euro vijftig.', nativeText: 'Üç euro elli sent.', pauseMultiplier: 1.4 },
          { id: 6, targetText: 'Wilt u een tasje?', nativeText: 'Poşet ister misiniz?', pauseMultiplier: 1.3 },
          { id: 7, targetText: 'Nee, dank u. Ik heb een tas.', nativeText: 'Hayır, teşekkürler. Çantam var.', pauseMultiplier: 1.5 },
          { id: 8, targetText: 'Alstublieft, de bon.', nativeText: 'Buyurun, fişiniz.', pauseMultiplier: 1.3 },
        ],
      },
    },
    {
      id: 'groene_boek_les_3',
      title: 'Les 3 — De weg vragen',
      scenario: {
        title: 'Groene Boek – Les 3: De weg vragen',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
          { id: 1, targetText: 'Pardon, waar is het station?', nativeText: 'Affedersiniz, istasyon nerede?', pauseMultiplier: 1.5 },
          { id: 2, targetText: 'Ga rechtdoor en dan links.', nativeText: 'Düz gidin ve sonra sola dönün.', pauseMultiplier: 1.5 },
          { id: 3, targetText: 'Is het ver lopen?', nativeText: 'Yürüyerek uzak mı?', pauseMultiplier: 1.3 },
          { id: 4, targetText: 'Nee, het is vijf minuten.', nativeText: 'Hayır, beş dakika.', pauseMultiplier: 1.3 },
          { id: 5, targetText: 'Welke bus moet ik nemen?', nativeText: 'Hangi otobüse binmeliyim?', pauseMultiplier: 1.4 },
          { id: 6, targetText: 'Neem bus nummer twaalf.', nativeText: 'On iki numaralı otobüse binin.', pauseMultiplier: 1.5 },
          { id: 7, targetText: 'Waar is de halte?', nativeText: 'Durak nerede?', pauseMultiplier: 1.3 },
          { id: 8, targetText: 'Bedankt voor uw hulp!', nativeText: 'Yardımınız için teşekkürler!', pauseMultiplier: 1.4 },
        ],
      },
    },
  ],
};

// ─── Course 2: Tweede Ronde (Halfgevorderden) ──────────────────────────────

const tweedeRonde: CourseData = {
  id: 'tweede_ronde',
  title: 'Halfgevorderden',
  description: 'Orta seviye. Profesyonel ve sosyal durumlar.',
  emoji: '📘',
  color: 'blue',
  order: 1,
  category: 'Delftse Methode',
  subcategory: null,
  lessons: [
    {
      id: 'tweede_ronde_les_1',
      title: 'Les 1 — Op het werk',
      scenario: {
        title: 'Tweede Ronde – Les 1: Op het werk',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
          { id: 1, targetText: 'Goedemorgen, hoe was je weekend?', nativeText: 'Günaydın, hafta sonun nasıldı?', pauseMultiplier: 1.5 },
          { id: 2, targetText: 'Het was gezellig, dank je.', nativeText: 'Güzeldi, teşekkürler.', pauseMultiplier: 1.4 },
          { id: 3, targetText: 'Heb je de vergadering gezien?', nativeText: 'Toplantıyı gördün mü?', pauseMultiplier: 1.5 },
          { id: 4, targetText: 'Ja, die is om twee uur.', nativeText: 'Evet, saat ikide.', pauseMultiplier: 1.3 },
          { id: 5, targetText: 'Kun je het rapport even sturen?', nativeText: 'Raporu gönderebilir misin?', pauseMultiplier: 1.5 },
          { id: 6, targetText: 'Natuurlijk, ik stuur het nu.', nativeText: 'Tabii, şimdi gönderiyorum.', pauseMultiplier: 1.4 },
          { id: 7, targetText: 'Zullen we samen lunchen?', nativeText: 'Birlikte öğle yemeği yiyelim mi?', pauseMultiplier: 1.5 },
          { id: 8, targetText: 'Goed idee, tot straks!', nativeText: 'İyi fikir, sonra görüşürüz!', pauseMultiplier: 1.3 },
        ],
      },
    },
    {
      id: 'tweede_ronde_les_2',
      title: 'Les 2 — Bij de dokter',
      scenario: {
        title: 'Tweede Ronde – Les 2: Bij de dokter',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
          { id: 1, targetText: 'Goedemiddag, ik heb een afspraak.', nativeText: 'İyi günler, randevum var.', pauseMultiplier: 1.5 },
          { id: 2, targetText: 'Wat zijn uw klachten?', nativeText: 'Şikayetleriniz neler?', pauseMultiplier: 1.4 },
          { id: 3, targetText: 'Ik heb al drie dagen hoofdpijn.', nativeText: 'Üç gündür başım ağrıyor.', pauseMultiplier: 1.5 },
          { id: 4, targetText: 'Heeft u ook koorts?', nativeText: 'Ateşiniz de var mı?', pauseMultiplier: 1.3 },
          { id: 5, targetText: 'Een beetje, sinds gisteren.', nativeText: 'Biraz, dünden beri.', pauseMultiplier: 1.3 },
          { id: 6, targetText: 'Ik schrijf een recept voor u.', nativeText: 'Size bir reçete yazıyorum.', pauseMultiplier: 1.5 },
          { id: 7, targetText: 'Moet ik nog terugkomen?', nativeText: 'Tekrar gelmem gerekiyor mu?', pauseMultiplier: 1.4 },
          { id: 8, targetText: 'Als het niet beter wordt, bel ons.', nativeText: 'İyileşmezse bizi arayın.', pauseMultiplier: 1.6 },
        ],
      },
    },
  ],
};

// ─── Course 3: Derde Ronde (Gevorderden) ────────────────────────────────────

const derdeRonde: CourseData = {
  id: 'derde_ronde',
  title: 'Gevorderden',
  description: 'İleri seviye. Karmaşık konuşmalar ve deyimler.',
  emoji: '📕',
  color: 'rose',
  order: 2,
  category: 'Delftse Methode',
  subcategory: null,
  lessons: [
    {
      id: 'derde_ronde_les_1',
      title: 'Les 1 — Sollicitatiegesprek',
      scenario: {
        title: 'Derde Ronde – Les 1: Sollicitatiegesprek',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
          { id: 1, targetText: 'Welkom, gaat u zitten alstublieft.', nativeText: 'Hoş geldiniz, lütfen oturun.', pauseMultiplier: 1.5 },
          { id: 2, targetText: 'Kunt u iets over uzelf vertellen?', nativeText: 'Kendinizden biraz bahseder misiniz?', pauseMultiplier: 1.6 },
          { id: 3, targetText: 'Ik ben UX designer met vijf jaar ervaring.', nativeText: 'Beş yıllık deneyimli bir UX tasarımcıyım.', pauseMultiplier: 1.7 },
          { id: 4, targetText: 'Waarom wilt u bij ons werken?', nativeText: 'Neden bizimle çalışmak istiyorsunuz?', pauseMultiplier: 1.5 },
          { id: 5, targetText: 'Uw bedrijf loopt voorop in innovatie.', nativeText: 'Şirketiniz inovasyonda öncü.', pauseMultiplier: 1.5 },
          { id: 6, targetText: 'Wat zijn uw sterke punten?', nativeText: 'Güçlü yönleriniz neler?', pauseMultiplier: 1.4 },
          { id: 7, targetText: 'Ik ben een echte teamspeler.', nativeText: 'Gerçek bir takım oyuncusuyum.', pauseMultiplier: 1.4 },
          { id: 8, targetText: 'We nemen binnenkort contact met u op.', nativeText: 'Yakında sizinle iletişime geçeceğiz.', pauseMultiplier: 1.7 },
        ],
      },
    },
    {
      id: 'derde_ronde_les_2',
      title: 'Les 2 — Maatschappelijke discussie',
      scenario: {
        title: 'Derde Ronde – Les 2: Maatschappelijke discussie',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
          { id: 1, targetText: 'Heb je het nieuws gezien over de woningmarkt?', nativeText: 'Konut piyasası hakkındaki haberleri gördün mü?', pauseMultiplier: 1.7 },
          { id: 2, targetText: 'Ja, de huurprijzen zijn belachelijk hoog.', nativeText: 'Evet, kira fiyatları inanılmaz yüksek.', pauseMultiplier: 1.6 },
          { id: 3, targetText: 'De overheid moet ingrijpen, vind je niet?', nativeText: 'Hükümet müdahale etmeli, sence de öyle değil mi?', pauseMultiplier: 1.7 },
          { id: 4, targetText: 'Daar ben ik het helemaal mee eens.', nativeText: 'Tamamen katılıyorum.', pauseMultiplier: 1.4 },
          { id: 5, targetText: 'Het is ook een kwestie van vraag en aanbod.', nativeText: 'Aynı zamanda arz ve talep meselesi.', pauseMultiplier: 1.7 },
          { id: 6, targetText: 'Dat klopt, maar er speelt meer mee.', nativeText: 'Doğru, ama işin içinde başka şeyler de var.', pauseMultiplier: 1.6 },
          { id: 7, targetText: 'We moeten dit serieus nemen.', nativeText: 'Bunu ciddiye almalıyız.', pauseMultiplier: 1.4 },
          { id: 8, targetText: 'Ik hoop dat het snel verandert.', nativeText: 'Umarım yakında değişir.', pauseMultiplier: 1.4 },
        ],
      },
    },
  ],
};

// ─── Course 4: Hollandaca Ogreniyoruz (Goedbezig Oude Series) ───────────────

const hollandacaOgreniyoruzLessons: LessonData[] = [
  {
    id: 'ho_les_1',
    title: 'Les 1 — Introductie',
    scenario: {
      title: 'Hollandaca Ogreniyoruz – Les 1: Introductie (Giriş)',
      targetLang: 'nl-NL',
      nativeLang: 'tr-TR',
      lines: [
        { id: 1, targetText: 'Ik zie.', nativeText: 'Görüyorum.', pauseMultiplier: 1.5 },
        { id: 2, targetText: 'Ik zie niet.', nativeText: 'Görmüyorum.', pauseMultiplier: 1.5 },
        { id: 3, targetText: 'Ik zie het.', nativeText: 'Onu görüyorum.', pauseMultiplier: 1.5 },
        { id: 4, targetText: 'Ik zie het niet.', nativeText: 'Onu görmüyorum.', pauseMultiplier: 1.5 },
        { id: 5, targetText: 'Zie je?', nativeText: 'Görüyor musun?', pauseMultiplier: 1.5 },
        { id: 6, targetText: 'Zie je het?', nativeText: 'Onu görüyor musun?', pauseMultiplier: 1.5 },
        { id: 7, targetText: 'Ik zie de auto.', nativeText: 'Arabayı görüyorum.', pauseMultiplier: 1.5 },
        { id: 8, targetText: 'Ik zie een auto.', nativeText: 'Bir araba görüyorum.', pauseMultiplier: 1.5 },
        { id: 9, targetText: 'Zie je deze auto?', nativeText: 'Bu arabayı görüyor musun?', pauseMultiplier: 1.5 },
        { id: 10, targetText: 'Zie je die auto?', nativeText: 'Şu arabayı görüyor musun?', pauseMultiplier: 1.5 },
        { id: 11, targetText: 'Zie je een huis?', nativeText: 'Bir ev görüyor musun?', pauseMultiplier: 1.5 },
        { id: 12, targetText: 'Zie je het huis?', nativeText: 'Evi görüyor musun?', pauseMultiplier: 1.5 },
        { id: 13, targetText: 'Zie je dit huis?', nativeText: 'Bu evi görüyor musun?', pauseMultiplier: 1.5 },
        { id: 14, targetText: 'Zie je dat huis?', nativeText: 'Şu evi görüyor musun?', pauseMultiplier: 1.5 },
        { id: 15, targetText: 'Wil je zien?', nativeText: 'Görmek istiyor musun?', pauseMultiplier: 1.5 },
        { id: 16, targetText: 'Willen jullie zien?', nativeText: 'Görmek istiyor musunuz?', pauseMultiplier: 1.5 },
        { id: 17, targetText: 'Ik drink koffie.', nativeText: 'Kahve içiyorum.', pauseMultiplier: 1.5 },
        { id: 18, targetText: 'Drink je koffie?', nativeText: 'Kahve içiyor musun?', pauseMultiplier: 1.5 },
        { id: 19, targetText: 'Wat drink je?', nativeText: 'Ne içiyorsun?', pauseMultiplier: 1.5 },
        { id: 20, targetText: 'Ik wil dat.', nativeText: 'Şunu istiyorum.', pauseMultiplier: 1.5 },
        { id: 21, targetText: 'Ik wil een boek.', nativeText: 'Bir kitap istiyorum.', pauseMultiplier: 1.5 },
        { id: 22, targetText: 'Wat wil je?', nativeText: 'Ne istiyorsun?', pauseMultiplier: 1.5 },
        { id: 23, targetText: 'Wat wil je nu?', nativeText: 'Şu anda ne istiyorsun?', pauseMultiplier: 1.5 },
        { id: 24, targetText: 'Wat wil je morgen?', nativeText: 'Yarın ne istiyorsun?', pauseMultiplier: 1.5 },
        { id: 25, targetText: 'Ik wil water.', nativeText: 'Ben su istiyorum.', pauseMultiplier: 1.5 },
        { id: 26, targetText: 'Ik wil graag water.', nativeText: 'Su istiyorum (lütfen).', pauseMultiplier: 1.5 },
        { id: 27, targetText: 'Wil je water?', nativeText: 'Su istiyor musun?', pauseMultiplier: 1.5 },
        { id: 28, targetText: 'Drink je water?', nativeText: 'Su içer misin?', pauseMultiplier: 1.5 },
        { id: 29, targetText: 'Wil je water drinken?', nativeText: 'Su içmek ister misin?', pauseMultiplier: 1.5 },
        { id: 30, targetText: 'Drink je koffie?', nativeText: 'Kahve içer misin?', pauseMultiplier: 1.5 },
        { id: 31, targetText: 'Eet je brood?', nativeText: 'Ekmek yer misin?', pauseMultiplier: 1.5 },
        { id: 32, targetText: 'Slaap je goed?', nativeText: 'İyi uyur musun?', pauseMultiplier: 1.5 },
        { id: 33, targetText: 'Ik slaap later.', nativeText: 'Ben sonra uyuyacağım.', pauseMultiplier: 1.5 },
        { id: 34, targetText: 'Ik eet na de les.', nativeText: 'Dersten sonra yiyeceğim.', pauseMultiplier: 1.5 },
        { id: 35, targetText: 'Ik eet later.', nativeText: 'Ben sonra yiyeceğim.', pauseMultiplier: 1.5 },
        { id: 36, targetText: 'Ik werk.', nativeText: 'Ben çalışıyorum.', pauseMultiplier: 1.5 },
        { id: 37, targetText: 'Ik werk niet.', nativeText: 'Ben çalışmıyorum.', pauseMultiplier: 1.5 },
        { id: 38, targetText: 'Ik werk hier niet.', nativeText: 'Ben burada çalışmıyorum.', pauseMultiplier: 1.5 },
        { id: 39, targetText: 'Ik werk nu niet.', nativeText: 'Ben şu anda çalışmıyorum.', pauseMultiplier: 1.5 },
        { id: 40, targetText: 'Ik werk vandaag niet.', nativeText: 'Ben bugün çalışmıyorum.', pauseMultiplier: 1.5 },
        { id: 41, targetText: 'Wij werken morgen niet.', nativeText: 'Biz yarın çalışmıyoruz.', pauseMultiplier: 1.5 },
        { id: 42, targetText: 'Werk je daar?', nativeText: 'Sen orada mı çalışıyorsun?', pauseMultiplier: 1.5 },
        { id: 43, targetText: 'Ik kan werken.', nativeText: 'Ben çalışabiliyorum.', pauseMultiplier: 1.5 },
        { id: 44, targetText: 'Ik kan morgen werken.', nativeText: 'Ben yarın çalışabilirim.', pauseMultiplier: 1.5 },
        { id: 45, targetText: 'Ik kan morgen met jou werken.', nativeText: 'Ben yarın seninle çalışabilirim.', pauseMultiplier: 1.5 },
        { id: 46, targetText: 'Ik kan morgen niet werken.', nativeText: 'Ben yarın çalışamıyorum.', pauseMultiplier: 1.5 },
        { id: 47, targetText: 'Ik kan vandaag niet slapen.', nativeText: 'Ben bugün uyuyamam.', pauseMultiplier: 1.5 },
        { id: 48, targetText: 'Ik wil vandaag niet eten.', nativeText: 'Ben bugün yemek istemiyorum.', pauseMultiplier: 1.5 },
        { id: 49, targetText: 'Wat eten we?', nativeText: 'Ne yiyoruz?', pauseMultiplier: 1.5 },
        { id: 50, targetText: 'Wat zie je?', nativeText: 'Ne görüyorsun?', pauseMultiplier: 1.5 },
        { id: 51, targetText: 'Wat zie je daar?', nativeText: 'Orada ne görüyorsun?', pauseMultiplier: 1.5 },
        { id: 52, targetText: 'Wat drink je?', nativeText: 'Ne içiyorsun?', pauseMultiplier: 1.5 },
        { id: 53, targetText: 'Wat eten we vanavond?', nativeText: 'Akşama ne yiyiyoruz.', pauseMultiplier: 1.5 },
        { id: 54, targetText: 'Wat eten jullie morgen?', nativeText: 'Yarın ne yiyiyorsunuz?', pauseMultiplier: 1.5 },
        { id: 55, targetText: 'Wat drinken we nu?', nativeText: 'Şu anda ne içiyoruz.', pauseMultiplier: 1.5 },
        { id: 56, targetText: 'Wat willen we nu?', nativeText: 'Şu anda ne istiyoruz.', pauseMultiplier: 1.5 },
        { id: 57, targetText: 'Wat wil je?', nativeText: 'Ne istiyorsun?', pauseMultiplier: 1.5 },
        { id: 58, targetText: 'Wat zie je?', nativeText: 'Ne görüyorsun?', pauseMultiplier: 1.5 },
        { id: 59, targetText: 'Ik zie jullie.', nativeText: 'Sizi görüyorum.', pauseMultiplier: 1.5 },
        { id: 60, targetText: 'Ik zie jullie morgen.', nativeText: 'Sizi yarın görürüm.', pauseMultiplier: 1.5 },
        { id: 61, targetText: 'Ik zie je vanavond.', nativeText: 'Seni akşam görürüm.', pauseMultiplier: 1.5 },
        { id: 62, targetText: 'Ik zie je volgende week.', nativeText: 'Seni gelecek hafta görürüm.', pauseMultiplier: 1.5 },
        { id: 63, targetText: 'Wij willen eten.', nativeText: 'Biz yemek istiyoruz.', pauseMultiplier: 1.5 },
        { id: 64, targetText: 'Wij willen niet eten.', nativeText: 'Biz yemek istemiyoruz.', pauseMultiplier: 1.5 },
        { id: 65, targetText: 'De kinderen willen niet eten.', nativeText: 'Çocuklar yemek istemiyor.', pauseMultiplier: 1.5 },
        { id: 66, targetText: 'De kinderen willen niets eten.', nativeText: 'Çocuklar hiçbir şey yemek istemiyor.', pauseMultiplier: 1.5 },
        { id: 67, targetText: 'Wij willen nu niet eten.', nativeText: 'Biz şu anda yemek istemiyoruz.', pauseMultiplier: 1.5 },
        { id: 68, targetText: 'Wij willen nu slapen.', nativeText: 'Şu anda uyumak istiyoruz.', pauseMultiplier: 1.5 },
        { id: 69, targetText: 'Tot ziens.', nativeText: 'Görüşmek üzere.', pauseMultiplier: 1.5 },
      ],
    },
  },
  {
    id: 'ho_les_2',
    title: 'Les 2 — Hebben',
    scenario: {
      title: 'Hollandaca Ogreniyoruz – Les 2: Hebben (Sahip Olmak)',
      targetLang: 'nl-NL',
      nativeLang: 'tr-TR',
      lines: [
        { id: 1, targetText: 'We hebben een afspraak.', nativeText: 'Bir randevumuz var.', pauseMultiplier: 1.5 },
        { id: 2, targetText: 'We hebben morgen een afspraak.', nativeText: 'Yarın bir randevumuz var.', pauseMultiplier: 1.5 },
        { id: 3, targetText: 'Ik heb een vraag.', nativeText: 'Bir sorum var.', pauseMultiplier: 1.5 },
        { id: 4, targetText: 'Ik heb twee kinderen.', nativeText: 'İki çocuğum var.', pauseMultiplier: 1.5 },
        { id: 5, targetText: 'Ik heb tijd.', nativeText: 'Zamanım var.', pauseMultiplier: 1.5 },
        { id: 6, targetText: 'We hebben geen afspraak.', nativeText: 'Bizim randevumuz yok.', pauseMultiplier: 1.5 },
        { id: 7, targetText: 'Ik heb geen tijd.', nativeText: 'Zamanım yok.', pauseMultiplier: 1.5 },
        { id: 8, targetText: 'Ik heb morgen geen tijd.', nativeText: 'Yarın zamanım yok.', pauseMultiplier: 1.5 },
        { id: 9, targetText: 'Ik heb geen tijd voor je.', nativeText: 'Senin için zamanım yok.', pauseMultiplier: 1.5 },
        { id: 10, targetText: 'Ik heb geen vraag.', nativeText: 'Sorum yok.', pauseMultiplier: 1.5 },
        { id: 11, targetText: 'Ik heb geen idee.', nativeText: 'Bir fikrim yok.', pauseMultiplier: 1.5 },
        { id: 12, targetText: 'Ik heb geen kinderen.', nativeText: 'Çocuğum yok.', pauseMultiplier: 1.5 },
        { id: 13, targetText: 'Ik heb honger.', nativeText: 'Açım.', pauseMultiplier: 1.5 },
        { id: 14, targetText: 'Ik heb geen honger.', nativeText: 'Aç değilim.', pauseMultiplier: 1.5 },
        { id: 15, targetText: 'Ik heb geld.', nativeText: 'Param var.', pauseMultiplier: 1.5 },
        { id: 16, targetText: 'Ik heb geen geld.', nativeText: 'Param yok.', pauseMultiplier: 1.5 },
        { id: 17, targetText: 'Ik heb weinig geld.', nativeText: 'Az param var', pauseMultiplier: 1.5 },
        { id: 18, targetText: 'Ik heb iets voor je.', nativeText: 'Senin için bir şeyim var.', pauseMultiplier: 1.5 },
        { id: 19, targetText: 'Ik heb niets voor jou.', nativeText: 'Senin için hiçbir şeyim yok', pauseMultiplier: 1.5 },
        { id: 20, targetText: 'Ik heb niks voor jou.', nativeText: 'Senin için hiçbir şeyim yok', pauseMultiplier: 1.5 },
        { id: 21, targetText: 'Ik heb helaas niks voor je.', nativeText: 'Senin için maalesef hiçbir şeyim yok', pauseMultiplier: 1.5 },
        { id: 22, targetText: 'Heb je een foto van haar?', nativeText: 'Sende onun bir fotoğrafı var mı', pauseMultiplier: 1.5 },
        { id: 23, targetText: 'Heb je misschien een foto van haar?', nativeText: 'Sende onun bir fotoğrafı olabilir mi (acaba)', pauseMultiplier: 1.5 },
        { id: 24, targetText: 'Heb je misschien de sleutel van die deur?', nativeText: 'Sende şu kapının anahtarı olabilir mi (acaba)?', pauseMultiplier: 1.5 },
        { id: 25, targetText: 'Heb je plannen voor vanavond?', nativeText: 'Bu akşam için planın var mı?', pauseMultiplier: 1.5 },
        { id: 26, targetText: 'Heb je plannen voor het weekend?', nativeText: 'Hafta sonu için planın var mı?', pauseMultiplier: 1.5 },
        { id: 27, targetText: 'Ik heb een zoon van 10 en een dochter van 13.', nativeText: '10 yaşında bir oğlum, 13 yaşında da bir kızım var.', pauseMultiplier: 1.5 },
        { id: 28, targetText: 'Ik heb interesse in IT.', nativeText: "IT'ye ilgim var.", pauseMultiplier: 1.5 },
        { id: 29, targetText: 'Heb je morgen een afspraak?', nativeText: 'Yarın randevun var mı?', pauseMultiplier: 1.5 },
        { id: 30, targetText: 'Heb je een vraag?', nativeText: 'Bir sorun (soracagin soru) var mı?', pauseMultiplier: 1.5 },
        { id: 31, targetText: 'Heb je kinderen?', nativeText: 'Çocuğun var mı?', pauseMultiplier: 1.5 },
        { id: 32, targetText: 'Heb je een vriendin?', nativeText: 'Kız arkadaşın var mı?', pauseMultiplier: 1.5 },
        { id: 33, targetText: 'Heb je een huis voor mij?', nativeText: 'Benim için bir evin var mı?', pauseMultiplier: 1.5 },
        { id: 34, targetText: 'Heb je veel geld?', nativeText: 'Çok paran var mı?', pauseMultiplier: 1.5 },
        { id: 35, targetText: 'Heb je haar nummer?', nativeText: 'Sende onun numarası var mı?', pauseMultiplier: 1.5 },
        { id: 36, targetText: 'Heb je mijn nummer?', nativeText: 'Sende benim numaram var mı?', pauseMultiplier: 1.5 },
        { id: 37, targetText: 'We hebben geen probleem.', nativeText: 'Bir problemimiz yok', pauseMultiplier: 1.5 },
        { id: 38, targetText: 'Ik heb pijn.', nativeText: 'Ağrım var.', pauseMultiplier: 1.5 },
        { id: 39, targetText: 'Ik heb hoofdpijn.', nativeText: 'Başağrım var.', pauseMultiplier: 1.5 },
        { id: 40, targetText: 'Ik heb geen pijn.', nativeText: 'Ağrım yok.', pauseMultiplier: 1.5 },
        { id: 41, targetText: 'Ik heb geen tijd.', nativeText: 'Zamanım yok.', pauseMultiplier: 1.5 },
        { id: 42, targetText: 'Ik heb geen tijd meer.', nativeText: 'Artık zamanım yok/zamanım kalmadı.', pauseMultiplier: 1.5 },
        { id: 43, targetText: 'Ik heb geen geld meer.', nativeText: 'Başka param yok/param kalmadı.', pauseMultiplier: 1.5 },
        { id: 44, targetText: 'We hebben een gast.', nativeText: 'Bir misafirimiz var.', pauseMultiplier: 1.5 },
        { id: 45, targetText: 'We hebben haast.', nativeText: 'Acelemiz var.', pauseMultiplier: 1.5 },
        { id: 46, targetText: 'Ik heb geen gast.', nativeText: 'Misafirim yok.', pauseMultiplier: 1.5 },
        { id: 47, targetText: 'Ik heb geen haast.', nativeText: 'Acelem yok.', pauseMultiplier: 1.5 },
        { id: 48, targetText: 'Ik heb haar nodig.', nativeText: 'Ona ihtiyacım var.', pauseMultiplier: 1.5 },
        { id: 49, targetText: 'Ik heb het nodig.', nativeText: 'Ona (esya) ihtiyacım var.', pauseMultiplier: 1.5 },
        { id: 50, targetText: 'Ik heb geld nodig.', nativeText: 'Paraya ihtiyacım var. Bana para lazım.', pauseMultiplier: 1.5 },
        { id: 51, targetText: 'Ik heb tijd nodig.', nativeText: 'Zamana ihtiyacım var.', pauseMultiplier: 1.5 },
        { id: 52, targetText: 'Ik heb een vriendin nodig.', nativeText: 'Bir kız arkadaşına ihtiyacım var.', pauseMultiplier: 1.5 },
        { id: 53, targetText: 'Ik heb iemand nodig.', nativeText: 'Birisine ihtiyacım var.', pauseMultiplier: 1.5 },
        { id: 54, targetText: 'Ik heb niemand nodig.', nativeText: 'Kimseye ihtiyacım yok.', pauseMultiplier: 1.5 },
        { id: 55, targetText: 'Heb je geld nodig?', nativeText: 'Paraya ihtiyacın var mı/para lazım mı?', pauseMultiplier: 1.5 },
        { id: 56, targetText: 'Heb je tijd nodig?', nativeText: 'Zamana ihtiyacın var mı?', pauseMultiplier: 1.5 },
        { id: 57, targetText: 'Heb je iets nodig?', nativeText: 'Bir şeye ihtiyacın var mı?', pauseMultiplier: 1.5 },
        { id: 58, targetText: 'Heb je het nodig?', nativeText: 'Ona (esya) htiyacın var mı?', pauseMultiplier: 1.5 },
        { id: 59, targetText: 'Heb je mijn hulp nodig?', nativeText: 'Yardımıma ihtiyacın var mı?', pauseMultiplier: 1.5 },
        { id: 60, targetText: 'Heb je hulp nodig?', nativeText: 'Yardıma ihtiyacın var mı?', pauseMultiplier: 1.5 },
        { id: 61, targetText: 'Ik heb dit nodig.', nativeText: 'Buna ihtiyacım var.', pauseMultiplier: 1.5 },
        { id: 62, targetText: 'Heb je dat nodig?', nativeText: 'Şuna ihtiyacın var mı?', pauseMultiplier: 1.5 },
        { id: 63, targetText: 'Heb je dat boek nodig?', nativeText: 'Şu kitaba ihtiyacın var mi?', pauseMultiplier: 1.5 },
        { id: 64, targetText: 'Ik heb er zin in.', nativeText: 'Çok istekliyim (ona), heyecanlıyım. Dört gözle bekliyorum.', pauseMultiplier: 1.5 },
      ],
    },
  },
  {
    id: 'ho_les_3',
    title: 'Les 3 — Kunnen 1',
    scenario: {
      title: 'Hollandaca Ogreniyoruz – Les 3: Kunnen 1 (Yapabilmek 1)',
      targetLang: 'nl-NL',
      nativeLang: 'tr-TR',
      lines: [
        { id: 1, targetText: 'Kun je me horen?', nativeText: 'Beni duyabiliyor musun?', pauseMultiplier: 1.5 },
        { id: 2, targetText: 'Kunnen jullie me horen?', nativeText: 'Beni duyabiliyor musunuz?', pauseMultiplier: 1.5 },
        { id: 3, targetText: 'Ik kan nu slapen.', nativeText: 'Simdi uyuyabilirim.', pauseMultiplier: 1.5 },
        { id: 4, targetText: 'Ik kan nu niet slapen.', nativeText: 'Simdi uyuyamam/uyuyamiyorum.', pauseMultiplier: 1.5 },
        { id: 5, targetText: 'Ik kan zwemmen.', nativeText: 'Yuzebilirim/Yuzebiliyorum.', pauseMultiplier: 1.5 },
        { id: 6, targetText: 'Kun je me helpen?', nativeText: 'Bana yardim edebilir misin?', pauseMultiplier: 1.5 },
        { id: 7, targetText: 'Kun je me begrijpen?', nativeText: 'Beni anlayabiliyor musun?', pauseMultiplier: 1.5 },
        { id: 8, targetText: 'Kan ik jou helpen?', nativeText: 'Sana yardim edebilir miyim?', pauseMultiplier: 1.5 },
        { id: 9, targetText: 'Kan ik je bellen?', nativeText: 'Seni arayabilir miyim?', pauseMultiplier: 1.5 },
        { id: 10, targetText: 'Kan ik je even bellen?', nativeText: 'Seni bir arayabilir miyim?', pauseMultiplier: 1.5 },
        { id: 11, targetText: 'Ik kan alles doen.', nativeText: 'Herseyi yapabilirim.', pauseMultiplier: 1.5 },
        { id: 12, targetText: 'Ik kan het kopen.', nativeText: 'Onu satin alabilirim.', pauseMultiplier: 1.5 },
        { id: 13, targetText: 'Ik kan dit ook kopen.', nativeText: 'Bunu da satin alabilirim.', pauseMultiplier: 1.5 },
        { id: 14, targetText: 'Ik kan later komen.', nativeText: 'Ben daha sonra gelebilirim/gelebilecegim.', pauseMultiplier: 1.5 },
        { id: 15, targetText: 'Ik kan het vandaag niet doen.', nativeText: 'Onu bugun yapamam/yapamayacagim.', pauseMultiplier: 1.5 },
        { id: 16, targetText: 'Kunnen we dit vaker doen?', nativeText: 'Bunu daha sık yapabilir miyiz?', pauseMultiplier: 1.5 },
        { id: 17, targetText: 'Kunnen we dit nog een keer doen?', nativeText: 'Bunu bir kez daha yapabilir miyiz?', pauseMultiplier: 1.5 },
        { id: 18, targetText: 'Kunnen we dit weer doen?', nativeText: 'Bunu tekrar yapabilir miyiz?', pauseMultiplier: 1.5 },
        { id: 19, targetText: 'Ik kan morgen niet komen.', nativeText: 'Yarin gelemem/gelemiyorum.', pauseMultiplier: 1.5 },
        { id: 20, targetText: 'Ik kan het nu niet vinden.', nativeText: 'Onu simdi bulamiyorum.', pauseMultiplier: 1.5 },
        { id: 21, targetText: 'Hoe kan ik dat doen?', nativeText: 'Sunu nasil yapabilirim.', pauseMultiplier: 1.5 },
        { id: 22, targetText: 'Hoe kan ik beter spreken?', nativeText: 'Daha iyi nasil konusabilirim.', pauseMultiplier: 1.5 },
        { id: 23, targetText: 'Wat kan ik voor jou doen?', nativeText: 'Senin icin ne yapabilirim?', pauseMultiplier: 1.5 },
        { id: 24, targetText: 'Wie kan morgen komen?', nativeText: 'Yarin kim gelebilir?', pauseMultiplier: 1.5 },
        { id: 25, targetText: 'Wanneer kan je komen?', nativeText: 'Ne zaman gelebilirsin?', pauseMultiplier: 1.5 },
        { id: 26, targetText: 'Hoe laat kan je morgen komen?', nativeText: 'Yarin saat kacta gelebilirsin?', pauseMultiplier: 1.5 },
        { id: 27, targetText: 'Hoe laat kan je morgen hier zijn?', nativeText: 'Yarin saat kacta burada olabilirsin?', pauseMultiplier: 1.5 },
        { id: 28, targetText: 'Ik kan niet goed denken.', nativeText: 'Iyi dusunemiyorum.', pauseMultiplier: 1.5 },
        { id: 29, targetText: 'Kan ik je iets vragen?', nativeText: 'Sana birsey sorabilir miyim?', pauseMultiplier: 1.5 },
        { id: 30, targetText: 'Kan je me goed horen?', nativeText: 'Beni iyi duyabiliyor musun?', pauseMultiplier: 1.5 },
        { id: 31, targetText: 'Kunnen jullie mij goed zien?', nativeText: 'Beni iyi gorebiliyor musunuz?', pauseMultiplier: 1.5 },
        { id: 32, targetText: 'Kan je me zien?', nativeText: 'Beni gorebiliyor musun?', pauseMultiplier: 1.5 },
        { id: 33, targetText: 'Ik kan het niet zien.', nativeText: 'Onu (esya) goremiyorum.', pauseMultiplier: 1.5 },
        { id: 34, targetText: 'Wie kan me helpen?', nativeText: 'Bana kim yardim edebilir?', pauseMultiplier: 1.5 },
        { id: 35, targetText: 'Wie kan me nu helpen?', nativeText: 'Bana simdi kim yardim edebilir?', pauseMultiplier: 1.5 },
        { id: 36, targetText: 'Ik kan eerder komen.', nativeText: 'Ben daha erken gelebilirim.', pauseMultiplier: 1.5 },
        { id: 37, targetText: 'Kan je eerder komen?', nativeText: 'Daha erken gelebilir misin?', pauseMultiplier: 1.5 },
        { id: 38, targetText: 'Kan je misschien eerder komen?', nativeText: 'Acaba daha erken gelebilir misin?', pauseMultiplier: 1.5 },
        { id: 39, targetText: 'Het kan ook!', nativeText: 'O da olabilir/o da mumkun.', pauseMultiplier: 1.5 },
        { id: 40, targetText: 'Kan zij ook komen?', nativeText: 'O da gelebilir mi?', pauseMultiplier: 1.5 },
        { id: 41, targetText: 'Iedereen kan leren.', nativeText: 'Herkes ogrenebilir.', pauseMultiplier: 1.5 },
      ],
    },
  },
  {
    id: 'ho_les_4',
    title: 'Les 4 — Kunnen II',
    scenario: {
      title: 'Hollandaca Ogreniyoruz – Les 4: Kunnen II (Yapabilmek 2)',
      targetLang: 'nl-NL',
      nativeLang: 'tr-TR',
      lines: [
        { id: 1, targetText: 'Kunnen jullie me horen?', nativeText: 'Beni duyabiliyor musunuz?', pauseMultiplier: 1.5 },
        { id: 2, targetText: 'Ik kan jou horen.', nativeText: 'Seni duyabiliyorum.', pauseMultiplier: 1.5 },
        { id: 3, targetText: 'Kunnen jullie me goed horen?', nativeText: 'Beni iyi duyabiliyor musunuz?', pauseMultiplier: 1.5 },
        { id: 4, targetText: 'Kunnen jullie me niet horen?', nativeText: 'Beni duyamıyor musunuz?', pauseMultiplier: 1.5 },
        { id: 5, targetText: 'Ik kan jou niet horen.', nativeText: 'Seni duyamıyorum.', pauseMultiplier: 1.5 },
        { id: 6, targetText: 'Ik kan je nu niet horen.', nativeText: 'Seni şimdi duyamıyorum.', pauseMultiplier: 1.5 },
        { id: 7, targetText: 'Kun je me helpen?', nativeText: 'Bana yardım edebilir misin?', pauseMultiplier: 1.5 },
        { id: 8, targetText: 'Kun je me misschien helpen?', nativeText: 'Bana yardım edebilir misin acaba?', pauseMultiplier: 1.5 },
        { id: 9, targetText: 'Kun je me misschien morgen helpen?', nativeText: 'Bana yarın yardım edebilir misin acaba?', pauseMultiplier: 1.5 },
        { id: 10, targetText: 'Jij kan beginnen.', nativeText: 'Başlayabilirsin.', pauseMultiplier: 1.5 },
        { id: 11, targetText: 'Jij kan morgen beginnen.', nativeText: 'Yarın başlayabilirsin.', pauseMultiplier: 1.5 },
        { id: 12, targetText: 'Jullie kunnen volgende week beginnen.', nativeText: 'Gelecek hafta başlayabilirsiniz.', pauseMultiplier: 1.5 },
        { id: 13, targetText: 'Kan ik iets voor jou doen?', nativeText: 'Senin için bir şey yapabilir miyim?', pauseMultiplier: 1.5 },
        { id: 14, targetText: 'Kan jij misschien iets voor mij doen?', nativeText: 'Benim için bir şey yapabilir misin acaba?', pauseMultiplier: 1.5 },
        { id: 15, targetText: 'Ik kan helaas niks voor jou doen.', nativeText: 'Maalesef senin için hiçbir şey yapamam.', pauseMultiplier: 1.5 },
        { id: 16, targetText: 'Helaas kan ik je morgen niet helpen.', nativeText: 'Yarın sana maalesef yardım edemem.', pauseMultiplier: 1.5 },
        { id: 17, targetText: 'Kan zij ook komen?', nativeText: 'O da gelebiliyor mu?', pauseMultiplier: 1.5 },
        { id: 18, targetText: 'Ze kan helaas niet komen.', nativeText: 'O maalesef gelemiyor.', pauseMultiplier: 1.5 },
        { id: 19, targetText: 'Helaas kan ze niet.', nativeText: 'O maalesef gelemiyor.', pauseMultiplier: 1.5 },
        { id: 20, targetText: 'Kan je morgen naar Amsterdam (gaan)?', nativeText: "Yarın Amsterdam'a gidebilir misin?", pauseMultiplier: 1.5 },
        { id: 21, targetText: 'Moet je het zien?', nativeText: 'Onu (esya) görmek zorunda mısın?', pauseMultiplier: 1.5 },
        { id: 22, targetText: 'Kan je langzaam praten?', nativeText: 'Yavaş konuşabilir misin?', pauseMultiplier: 1.5 },
        { id: 23, targetText: 'Kan je iets/wat langzamer praten?', nativeText: 'Birazcık daha yavaş konuşabilir misin?', pauseMultiplier: 1.5 },
        { id: 24, targetText: 'Ik kan je niet volgen.', nativeText: 'Seni takip edemiyorum.', pauseMultiplier: 1.5 },
        { id: 25, targetText: 'Ik kan je niet goed volgen.', nativeText: 'Seni iyi takip edemiyorum.', pauseMultiplier: 1.5 },
        { id: 26, targetText: 'Waar kan ik slapen?', nativeText: 'Nerede uyuyabilirim?', pauseMultiplier: 1.5 },
        { id: 27, targetText: 'Waar kan ik wachten?', nativeText: 'Nerede bekleyebilirim?', pauseMultiplier: 1.5 },
        { id: 28, targetText: 'Wanneer kan ik slapen?', nativeText: 'Ne zaman uyuyabilirim?', pauseMultiplier: 1.5 },
        { id: 29, targetText: 'Hoe laat kan ik slapen?', nativeText: 'Saat kaçta uyuyabilirim?', pauseMultiplier: 1.5 },
        { id: 30, targetText: 'Hoe kan ik beter slapen?', nativeText: 'Daha iyi nasıl uyuyabilirim?', pauseMultiplier: 1.5 },
        { id: 31, targetText: 'Hoe kan ik minder slapen?', nativeText: 'Daha az nasıl uyuyabilirim?', pauseMultiplier: 1.5 },
        { id: 32, targetText: 'Kan ik beter slapen?', nativeText: 'Daha az uyuyabilir miyim?', pauseMultiplier: 1.5 },
        { id: 33, targetText: 'Slaap je goed?', nativeText: 'İyi uyuyor musun?', pauseMultiplier: 1.5 },
        { id: 34, targetText: 'Kan je dat doen?', nativeText: 'Şunu yapabilir misin?', pauseMultiplier: 1.5 },
        { id: 35, targetText: 'Kan je hier werken?', nativeText: 'Burada çalışabilir misin?', pauseMultiplier: 1.5 },
        { id: 36, targetText: 'Kan je daar slapen?', nativeText: 'Orada uyuyabilir misin?', pauseMultiplier: 1.5 },
        { id: 37, targetText: 'Kan je vanavond komen?', nativeText: 'Bu akşam gelebilir misin?', pauseMultiplier: 1.5 },
        { id: 38, targetText: 'Kunnen we de taal leren?', nativeText: 'Dili öğrenebilir miyiz?', pauseMultiplier: 1.5 },
        { id: 39, targetText: 'We kunnen de taal zeker leren.', nativeText: 'Dili kesinlikle öğrenebiliriz.', pauseMultiplier: 1.5 },
        { id: 40, targetText: 'Kan het morgen?', nativeText: 'Yarın olabilir mi?', pauseMultiplier: 1.5 },
        { id: 41, targetText: 'Kan het ook morgen?', nativeText: 'Yarın da olabilir mi?', pauseMultiplier: 1.5 },
        { id: 42, targetText: 'Kan het niet morgen?', nativeText: 'Yarın olamaz mı?', pauseMultiplier: 1.5 },
        { id: 43, targetText: 'Kan het wat eerder?', nativeText: 'Biraz erken olabilir mi?', pauseMultiplier: 1.5 },
        { id: 44, targetText: 'Kan het wat later?', nativeText: 'Biraz geç olabilir mi?', pauseMultiplier: 1.5 },
        { id: 45, targetText: 'Kunnen jullie spelen?', nativeText: 'Oynayabilir misiniz?', pauseMultiplier: 1.5 },
        { id: 46, targetText: 'Kunnen jullie ons helpen?', nativeText: 'Bize yardım edebilir misiniz?', pauseMultiplier: 1.5 },
        { id: 47, targetText: 'Kunnen we afspreken?', nativeText: 'Buluşabilir miyiz?', pauseMultiplier: 1.5 },
        { id: 48, targetText: 'Kunnen we een afspraak maken?', nativeText: 'Randevu yapabilir miyiz?', pauseMultiplier: 1.5 },
        { id: 49, targetText: 'Ik kan morgen helaas niet (doen).', nativeText: 'Ben yarın maalesef yapamıyorum', pauseMultiplier: 1.5 },
        { id: 50, targetText: 'Hoe kan ik een baan vinden?', nativeText: 'Nasıl iş bulabilirim?', pauseMultiplier: 1.5 },
        { id: 51, targetText: 'Hoe kan ik een huis kopen?', nativeText: 'Nasıl ev satın alabilirim?', pauseMultiplier: 1.5 },
        { id: 52, targetText: 'Hoe kan ik een bedrijf starten?', nativeText: 'Nasıl şirket kurabilirim?', pauseMultiplier: 1.5 },
        { id: 53, targetText: 'Hoe kan ik een email schrijven?', nativeText: 'Nasıl email yazabilirim?', pauseMultiplier: 1.5 },
        { id: 54, targetText: 'Kan ik een vaccinatie krijgen?', nativeText: 'Aşı olabilir miyim?', pauseMultiplier: 1.5 },
        { id: 55, targetText: 'Kan jij naar Turkije reizen?', nativeText: "Sen Türkiye'ye seyahat edebiliyor musun?", pauseMultiplier: 1.5 },
        { id: 56, targetText: 'Kan je mij bellen?', nativeText: 'Beni arayabilir misin?', pauseMultiplier: 1.5 },
      ],
    },
  },
  {
    id: 'ho_les_5',
    title: 'Les 5 — Willen',
    scenario: {
      title: 'Hollandaca Ogreniyoruz – Les 5: Willen',
      targetLang: 'nl-NL',
      nativeLang: 'tr-TR',
      lines: [
        { id: 1, targetText: 'Ik wil het.', nativeText: 'Onu istiyorum.', pauseMultiplier: 1.5 },
        { id: 2, targetText: 'Ik wil het ook.', nativeText: 'Onu ben de istiyorum.', pauseMultiplier: 1.5 },
        { id: 3, targetText: 'Ik wil het niet.', nativeText: 'Onu istemiyorum.', pauseMultiplier: 1.5 },
        { id: 4, targetText: 'Ik wil het nu niet.', nativeText: 'Onu simdi istemiyorum.', pauseMultiplier: 1.5 },
        { id: 5, targetText: 'Wil je het zien?', nativeText: 'Onu (eşya) görmek ister misin?', pauseMultiplier: 1.5 },
        { id: 6, targetText: 'Wil je hier werken?', nativeText: 'Burada çalışmak ister misin?', pauseMultiplier: 1.5 },
        { id: 7, targetText: 'Wil je die proberen?', nativeText: 'Şunu denemek ister misin?', pauseMultiplier: 1.5 },
        { id: 8, targetText: 'Willen jullie dat proberen?', nativeText: 'Şunu denemek ister misiniz?', pauseMultiplier: 1.5 },
        { id: 9, targetText: 'Willen jullie deze auto zien?', nativeText: 'Bu arabayı görmek ister misiniz?', pauseMultiplier: 1.5 },
        { id: 10, targetText: 'Wil je echt slapen?', nativeText: 'Gerçekten uyumak istiyor musun?', pauseMultiplier: 1.5 },
        { id: 11, targetText: 'Wat wil je nu?', nativeText: 'Şimdi ne istiyorsun?', pauseMultiplier: 1.5 },
        { id: 12, targetText: 'Wat wil je nu doen?', nativeText: 'Şimdi ne yapmak istiyorsun?', pauseMultiplier: 1.5 },
        { id: 13, targetText: 'Wat willen jullie vanavond eten?', nativeText: 'Bu akşam ne yemek istiyorsunuz?', pauseMultiplier: 1.5 },
        { id: 14, targetText: 'Wat wil je vertellen?', nativeText: 'Ne anlatmak istiyorsun?', pauseMultiplier: 1.5 },
        { id: 15, targetText: 'Waar wil je wonen?', nativeText: 'Nerede yaşamak istiyorsun?', pauseMultiplier: 1.5 },
        { id: 16, targetText: 'Wat wil je leren?', nativeText: 'Ne öğrenmek istiyorsun?', pauseMultiplier: 1.5 },
        { id: 17, targetText: 'Wat wil je van mij?', nativeText: 'Benden ne istiyorsun?', pauseMultiplier: 1.5 },
        { id: 18, targetText: 'Wat willen jullie van ons?', nativeText: 'Bizden ne istiyorsunuz?', pauseMultiplier: 1.5 },
        { id: 19, targetText: 'Waarom wil je hier werken?', nativeText: 'Burada niçin çalışmak istiyorsun?', pauseMultiplier: 1.5 },
        { id: 20, targetText: 'Wat wil je later worden?', nativeText: 'Büyüyünce ne olmak istiyorsun?', pauseMultiplier: 1.5 },
        { id: 21, targetText: 'Wil je koffie?', nativeText: 'Kahve istiyor musun?', pauseMultiplier: 1.5 },
        { id: 22, targetText: 'Wil je thee drinken?', nativeText: 'Çay içmek istiyor musun?', pauseMultiplier: 1.5 },
        { id: 23, targetText: 'Ik wil het niet meer.', nativeText: 'Onu artık istemiyorum.', pauseMultiplier: 1.5 },
        { id: 24, targetText: 'Ik wil niet gaan.', nativeText: 'Gitmek istemiyorum.', pauseMultiplier: 1.5 },
        { id: 25, targetText: 'Ik wil niet naar Amsterdam (gaan).', nativeText: 'Amsterdam’a gitmek istemiyorum.', pauseMultiplier: 1.5 },
        { id: 26, targetText: 'Ik wil vandaag niet naar Amsterdam (gaan)', nativeText: 'Bugün Amsterdam’a gitmek istemiyorum.', pauseMultiplier: 1.5 },
        { id: 27, targetText: 'Ik wil niet wachten', nativeText: 'Beklemek istemiyorum.', pauseMultiplier: 1.5 },
        { id: 28, targetText: 'Ik wil het niet wachten.', nativeText: 'Onu beklemek istemiyorum.', pauseMultiplier: 1.5 },
        { id: 29, targetText: 'Ik wil het niet weten', nativeText: 'Onu bilmek istemiyorum.', pauseMultiplier: 1.5 },
        { id: 30, targetText: 'Ik wil het niet proberen.', nativeText: 'Onu denemek istemiyorum.', pauseMultiplier: 1.5 },
        { id: 31, targetText: 'Ik wil het niet doen.', nativeText: 'Onu yapmak istemiyorum.', pauseMultiplier: 1.5 },
        { id: 32, targetText: 'Ik wil het nu niet doen.', nativeText: 'Onu şimdi yapmak istemiyorum.', pauseMultiplier: 1.5 },
        { id: 33, targetText: 'Ik wil geen discussie.', nativeText: 'Tartışma istemiyorum.', pauseMultiplier: 1.5 },
        { id: 34, targetText: 'Ik wil geen ruzie.', nativeText: 'Kavga istemiyorum.', pauseMultiplier: 1.5 },
        { id: 35, targetText: 'Ik wil Nederlands leren', nativeText: 'Hollandaca öğrenmek istiyorum.', pauseMultiplier: 1.5 },
        { id: 36, targetText: 'Ik wil snel Nederlands leren.', nativeText: 'Hızlı bir şekilde Hollandaca öğrenmek istiyorum.', pauseMultiplier: 1.5 },
        { id: 37, targetText: 'Ik wil graag zo snel mogelijk Nederlands leren.', nativeText: 'Mümkün olan en kısa sürede Hollandaca öğrenmek istiyorum', pauseMultiplier: 1.5 },
        { id: 38, targetText: 'Ik wil graag mijn Nederlands verbeteren.', nativeText: 'Hollandacamı geliştirmek istiyorum.', pauseMultiplier: 1.5 },
        { id: 39, targetText: 'Ik wil graag mensen helpen.', nativeText: 'İnsanlara yardım etmek istiyorum.', pauseMultiplier: 1.5 },
        { id: 40, targetText: 'Ik wil graag vrijwilligerswerk doen.', nativeText: 'Gönül iş yapmak istiyorum.', pauseMultiplier: 1.5 },
        { id: 41, targetText: 'Willen jullie iets?', nativeText: 'Bir şey istiyor musunuz?', pauseMultiplier: 1.5 },
        { id: 42, targetText: 'Ik wil graag trouwen.', nativeText: 'Evlenmek istiyorum.', pauseMultiplier: 1.5 },
        { id: 43, targetText: 'Ik wil nu niet slapen', nativeText: 'Şu anda uyumak istemiyorum.', pauseMultiplier: 1.5 },
        { id: 44, targetText: 'Wat wil je zeggen?', nativeText: 'Ne söylemek istiyorsun?', pauseMultiplier: 1.5 },
        { id: 45, targetText: 'Wil je iets vragen?', nativeText: 'Bir şey sormak istiyor musun?', pauseMultiplier: 1.5 },
        { id: 46, targetText: 'Wat wil je vragen?', nativeText: 'Ne sormak istiyorsun?', pauseMultiplier: 1.5 },
        { id: 47, targetText: 'Ik wil pizza eten.', nativeText: 'Pizza yemek istiyorum.', pauseMultiplier: 1.5 },
        { id: 48, targetText: 'Ik wil heel graag een kat.', nativeText: 'Bir kediye sahip olmayı çok istiyorum.', pauseMultiplier: 1.5 },
        { id: 49, targetText: 'Ik wil gitaarspelen.', nativeText: 'Gitar çalmak istiyorum.', pauseMultiplier: 1.5 },
        { id: 50, targetText: 'Ik wil vandaag niet spelen.', nativeText: 'Bugün oynamak istemiyorum.', pauseMultiplier: 1.5 },
        { id: 51, targetText: 'Ik wil vandaag niks spelen.', nativeText: 'Bugün hiçbir şey oynamak istemiyorum.', pauseMultiplier: 1.5 },
        { id: 52, targetText: 'Hoe wil je leven?', nativeText: 'Nasıl yaşamak/yaşam sürmek istiyorsun?', pauseMultiplier: 1.5 },
        { id: 53, targetText: 'Semih wil melk drinken.', nativeText: 'Semih süt içmek istiyor.', pauseMultiplier: 1.5 },
        { id: 54, targetText: 'Wat willen jullie morgen?', nativeText: 'Yarın ne istiyorsunuz?', pauseMultiplier: 1.5 },
        { id: 55, targetText: 'Hoe laat willen jullie komen?', nativeText: 'Saat kaçta gelmek istiyorsunuz?', pauseMultiplier: 1.5 },
        { id: 56, targetText: 'Hoe laat wil je afspreken?', nativeText: 'Saat kaçta buluşmak istiyorsun?', pauseMultiplier: 1.5 },
      ],
    },
  },
  {
    id: 'ho_les_6',
    title: 'Les 6 — Gaan',
    scenario: {
      title: 'Hollandaca Ogreniyoruz – Les 6: Gaan',
      targetLang: 'nl-NL',
      nativeLang: 'tr-TR',
      lines: [
        { id: 1, targetText: 'Ik ga.', nativeText: 'Ben gidiyorum.', pauseMultiplier: 1.5 },
        { id: 2, targetText: 'We/wij gaan.', nativeText: 'Biz gidiyoruz.', pauseMultiplier: 1.5 },
        { id: 3, targetText: 'We gaan niet.', nativeText: 'Biz gitmiyoruz.', pauseMultiplier: 1.5 },
        { id: 4, targetText: 'We gaan niet zonder jou.', nativeText: 'Biz sensiz gitmiyoruz.', pauseMultiplier: 1.5 },
        { id: 5, targetText: 'We gaan niet naar buiten', nativeText: 'Biz dışarı gitmiyoruz.', pauseMultiplier: 1.5 },
        { id: 6, targetText: 'Ik ga naar school', nativeText: 'Ben okula gidiyorum.', pauseMultiplier: 1.5 },
        { id: 7, targetText: 'Ik ga naar bed', nativeText: 'Ben yatağa gidiyorum.', pauseMultiplier: 1.5 },
        { id: 8, targetText: 'Ik ga naar boven', nativeText: 'Ben yukarı gidiyorum.', pauseMultiplier: 1.5 },
        { id: 9, targetText: 'Ze gaat naar speeltuin', nativeText: 'O oyun parkına gidiyor.', pauseMultiplier: 1.5 },
        { id: 10, targetText: 'Ali gaat naar universiteit', nativeText: 'Ali üniversiteye gidiyor.', pauseMultiplier: 1.5 },
        { id: 11, targetText: 'Je gaat naar school', nativeText: 'Sen okula gidiyorsun.', pauseMultiplier: 1.5 },
        { id: 12, targetText: 'Ga je naar Lidl?', nativeText: 'Lidl’a gidiyor musun? Lidl’a mı gidiyorsun? (vurgu ile)', pauseMultiplier: 1.5 },
        { id: 13, targetText: 'Ga je naar huis?', nativeText: 'Eve mi gidiyorsunuz? Eve gidiyor musunuz? (vurgu ile)', pauseMultiplier: 1.5 },
        { id: 14, targetText: 'Gaan jullie naar werk?', nativeText: 'İşe mi gidiyorsunuz? Ise gidiyor musunuz? (vurgu ile)', pauseMultiplier: 1.5 },
        { id: 15, targetText: 'Waar ga je nu?', nativeText: 'Şu anda nereye gidiyorsun?', pauseMultiplier: 1.5 },
        { id: 16, targetText: 'Waar ga je heen/Waar ga je naartoe?', nativeText: 'Nereye (doğru) gidiyorsun?', pauseMultiplier: 1.5 },
        { id: 17, targetText: 'Hoe ga je naar huis?', nativeText: 'Eve nasıl gidiyorsun?', pauseMultiplier: 1.5 },
        { id: 18, targetText: 'Hoe gaat het?', nativeText: 'Nasıl gidiyor?', pauseMultiplier: 1.5 },
        { id: 19, targetText: 'Hoe gaat het met jou?', nativeText: 'Nasılsın?', pauseMultiplier: 1.5 },
        { id: 20, targetText: 'Hoe gaat het met jullie?', nativeText: '(sizler) Nasılsınız?', pauseMultiplier: 1.5 },
        { id: 21, targetText: 'Hoe gaat het met je dochter?', nativeText: 'Kızın nasıl?', pauseMultiplier: 1.5 },
        { id: 22, targetText: 'Hoe gaat het met je familie in Turkije?', nativeText: 'Türkiye’deki ailen nasıl?', pauseMultiplier: 1.5 },
        { id: 23, targetText: 'Hoe gaat het verder?', nativeText: 'Daha daha nasıl gidiyor?', pauseMultiplier: 1.5 },
        { id: 24, targetText: 'Hoe gaat het op school?', nativeText: 'Okul nasıl gidiyor?', pauseMultiplier: 1.5 },
        { id: 25, targetText: 'Hoe gaat het schat/Hoe gaat het schat/schatje?', nativeText: 'Nasılsın canım/tatlim?', pauseMultiplier: 1.5 },
        { id: 26, targetText: 'Het gaat goed met mij.', nativeText: 'Ben iyiyim, her şey yolunda.', pauseMultiplier: 1.5 },
        { id: 27, targetText: 'Het gaat goed met mijn vader', nativeText: 'Babam iyi, her şey yolunda.', pauseMultiplier: 1.5 },
        { id: 28, targetText: 'Het gaat goed met ons.', nativeText: 'Biz iyiyiz, iyi gidiyor.', pauseMultiplier: 1.5 },
        { id: 29, targetText: 'Wanneer gaan we?', nativeText: 'Ne zaman gidiyoruz?', pauseMultiplier: 1.5 },
        { id: 30, targetText: 'Wanneer gaan jullie naar Duitsland?', nativeText: 'Ne zaman Almanya’ya gidiyorsunuz?', pauseMultiplier: 1.5 },
        { id: 31, targetText: 'Wanneer ga je naar Griekenland?', nativeText: 'Ne zaman Yunanistan’a gidiyorsun?', pauseMultiplier: 1.5 },
        { id: 32, targetText: 'Waarom ga je naar Italië?', nativeText: 'Niçin İtalya’ya gidiyorsun?', pauseMultiplier: 1.5 },
        { id: 33, targetText: 'Hoe laat ga je naar bed?', nativeText: 'Saat kaçta yatağa gidiyorsun?', pauseMultiplier: 1.5 },
        { id: 34, targetText: 'Zij/hij gaat naar de bibliotheek', nativeText: 'O kütüphaneye gidiyor.', pauseMultiplier: 1.5 },
        { id: 35, targetText: 'Ze gaat eerst naar de bibliotheek', nativeText: 'O önce kütüphaneye gidiyor.', pauseMultiplier: 1.5 },
        { id: 36, targetText: 'We gaan volgende week op vakantie', nativeText: 'Biz gelecek hafta tatile gideceğiz.', pauseMultiplier: 1.5 },
        { id: 37, targetText: 'Waar gaat het over?', nativeText: 'O neyle ilgili/ne hakkında?', pauseMultiplier: 1.5 },
        { id: 38, targetText: 'Waar gaat dit boek over?', nativeText: 'Bu kitabın konusu ne?', pauseMultiplier: 1.5 },
        { id: 39, targetText: 'Waar gaat de film over?', nativeText: 'Filmin konusu ne?', pauseMultiplier: 1.5 },
        { id: 40, targetText: 'Het gaat over een kindje.', nativeText: '(Konusu) bir çocuk hakkında.', pauseMultiplier: 1.5 },
        { id: 41, targetText: 'Het leven gaat niet altijd over rozen.', nativeText: 'Hayat her zaman tozpembe değildir.', pauseMultiplier: 1.5 },
        { id: 42, targetText: 'Alles gaat goed.', nativeText: 'Her şey iyi gidiyor, her şey yolunda.', pauseMultiplier: 1.5 },
        { id: 43, targetText: 'Gaat het?', nativeText: 'Hey, iyi misin? Bir şeyin yok ya?', pauseMultiplier: 1.5 },
        { id: 44, targetText: 'Ga je mee?', nativeText: 'Hey, sen de gelir misin?', pauseMultiplier: 1.5 },
        { id: 45, targetText: 'Ga je mee naar de film?', nativeText: 'Sen de filme gelir misin?', pauseMultiplier: 1.5 },
        { id: 46, targetText: 'Ga je mee naar de bieb?', nativeText: 'Sen de kütüphaneye gelir misin?', pauseMultiplier: 1.5 },
        { id: 47, targetText: 'Ga je mee naar de markt', nativeText: 'Benimle pazara gelir misin?', pauseMultiplier: 1.5 },
        { id: 48, targetText: 'Ik ga naar Albert Heijn. Ga je mee?', nativeText: 'Ben Albert Heijn’e gidiyorum, sen de gelir misin?', pauseMultiplier: 1.5 },
        { id: 49, targetText: 'Ik ga niet weg.', nativeText: 'Ben buradan gitmiyorum, bir yere gitmiyorum.', pauseMultiplier: 1.5 },
        { id: 50, targetText: 'Goeiemorgen, hoe gaat het vandaag?', nativeText: 'Günaydın, bugün nasılsın?', pauseMultiplier: 1.5 },
        { id: 51, targetText: 'Het gaat heel goed met mij', nativeText: 'Ben çok iyiyim, her şey çok iyi.', pauseMultiplier: 1.5 },
        { id: 52, targetText: 'Het komt allemaal goed.', nativeText: 'Her şey iyi olacak.', pauseMultiplier: 1.5 },
      ],
    },
  },
];

// Generate placeholder lessons 7-116
for (let i = 7; i <= 116; i++) {
  hollandacaOgreniyoruzLessons.push({
    id: `ho_les_${i}`,
    title: `Les ${i}`,
    scenario: {
      title: `Hollandaca Ogreniyoruz – Les ${i}`,
      targetLang: 'nl-NL',
      nativeLang: 'tr-TR',
      lines: [],
    },
  });
}

const hollandacaOgreniyoruz: CourseData = {
  id: 'hollandaca_ogreniyoruz',
  title: 'Hollandaca Ogreniyoruz',
  description: 'GoedBezig YouTube kanalından 116 ders.',
  emoji: '🎬',
  color: 'amber',
  order: 0,
  category: 'Goedbezig Youtube Series',
  subcategory: 'Oude Series',
  lessons: hollandacaOgreniyoruzLessons,
};

// ─── Courses 5-12: Atolyesi (Goedbezig Nieuwe Series) ──────────────────────

const atolyesiCourses: CourseData[] = [
  {
    id: 'atolyesi_1',
    title: 'Hollandaca Atolyesi Bolum 1: Ilk Adimlar',
    description: 'Temel yapılar ve ilk adımlar.',
    emoji: '🔤',
    color: 'violet',
    order: 1,
    category: 'Goedbezig Youtube Series',
    subcategory: 'Nieuwe Series',
    lessons: [],
  },
  {
    id: 'atolyesi_2',
    title: 'Hollandaca Atolyesi Bolum 2: Modal Fiiller',
    description: 'Modal fiiller ve kullanımları.',
    emoji: '📝',
    color: 'violet',
    order: 2,
    category: 'Goedbezig Youtube Series',
    subcategory: 'Nieuwe Series',
    lessons: [],
  },
  {
    id: 'atolyesi_3',
    title: 'Hollandaca Atolyesi Bolum 3: "Dat" ve Arkadaslari',
    description: 'Dat bağlacı ve yan cümleler.',
    emoji: '🔗',
    color: 'violet',
    order: 3,
    category: 'Goedbezig Youtube Series',
    subcategory: 'Nieuwe Series',
    lessons: [],
  },
  {
    id: 'atolyesi_4',
    title: 'Hollandaca Atolyesi Bolum 4: Om te ile derinlere',
    description: 'Om te yapısı ve kullanımları.',
    emoji: '🎯',
    color: 'violet',
    order: 4,
    category: 'Goedbezig Youtube Series',
    subcategory: 'Nieuwe Series',
    lessons: [],
  },
  {
    id: 'atolyesi_5',
    title: 'Hollandaca Atolyesi Bolum 5: Zamanlar',
    description: 'Fiil zamanları.',
    emoji: '⏰',
    color: 'violet',
    order: 5,
    category: 'Goedbezig Youtube Series',
    subcategory: 'Nieuwe Series',
    lessons: [],
  },
  {
    id: 'atolyesi_6',
    title: 'Hollandaca Atolyesi Bolum 6: "Die" ve Arkadaslari',
    description: 'İlgi zamirleri.',
    emoji: '🔍',
    color: 'violet',
    order: 6,
    category: 'Goedbezig Youtube Series',
    subcategory: 'Nieuwe Series',
    lessons: [],
  },
  {
    id: 'atolyesi_7',
    title: 'Hollandaca Atolyesi Bolum 7: Ayrilabilen Fiiller',
    description: 'Ayrılabilen fiiller.',
    emoji: '✂️',
    color: 'violet',
    order: 7,
    category: 'Goedbezig Youtube Series',
    subcategory: 'Nieuwe Series',
    lessons: [],
  },
  {
    id: 'atolyesi_8',
    title: 'Hollandaca Atolyesi Bolum 8: Donuslu Fiiller',
    description: 'Dönüşlü fiiller.',
    emoji: '🔄',
    color: 'violet',
    order: 8,
    category: 'Goedbezig Youtube Series',
    subcategory: 'Nieuwe Series',
    lessons: [],
  },
];

// ─── All courses ────────────────────────────────────────────────────────────

const ALL_COURSES: CourseData[] = [
  groeneBoek,
  tweedeRonde,
  derdeRonde,
  hollandacaOgreniyoruz,
  ...atolyesiCourses,
];

// ─── Seed function ──────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding courses...');

  await prisma.$transaction(async (tx) => {
    // Delete all existing lessons and courses
    await tx.lesson.deleteMany();
    await tx.course.deleteMany();

    for (const course of ALL_COURSES) {
      await tx.course.create({
        data: {
          id: course.id,
          title: course.title,
          description: course.description,
          emoji: course.emoji,
          color: course.color,
          order: course.order,
          category: course.category,
          subcategory: course.subcategory,
          lessons: {
            create: course.lessons.map((lesson, index) => ({
              id: lesson.id,
              title: lesson.title,
              order: index,
              content: lesson.scenario as object,
            })),
          },
        },
      });

      const lessonCount = course.lessons.length;
      console.log(`  ✓ ${course.emoji} ${course.title} (${lessonCount} ders)`);
    }
  });

  const courseCount = await prisma.course.count();
  const lessonCount = await prisma.lesson.count();
  console.log(`\n✅ Done: ${courseCount} kurs, ${lessonCount} ders.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
