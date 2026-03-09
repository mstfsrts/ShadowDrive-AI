// ─── ShadowDrive AI — Offline Demo Scenarios ───
// Hardcoded, realistic scenarios that load instantly when the API is unavailable.
// These ensure the app NEVER shows a dead end.
// Native language: TURKISH (for Turkish speakers learning Dutch)

import { Scenario } from '@/types/dialogue';

const OFFLINE_SCENARIOS: Scenario[] = [
    {
        title: 'Kahve sipariş etmek',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
            { id: 1, targetText: 'Goedemorgen!', nativeText: 'Günaydın!', pauseMultiplier: 1.2 },
            { id: 2, targetText: 'Mag ik een koffie, alstublieft?', nativeText: 'Bir kahve alabilir miyim, lütfen?', pauseMultiplier: 1.5 },
            { id: 3, targetText: 'Met melk en suiker.', nativeText: 'Süt ve şekerli.', pauseMultiplier: 1.3 },
            { id: 4, targetText: 'Hoeveel kost dat?', nativeText: 'Ne kadar tutar?', pauseMultiplier: 1.4 },
            { id: 5, targetText: 'Dat is twee euro vijftig.', nativeText: 'İki euro elli sent.', pauseMultiplier: 1.5 },
            { id: 6, targetText: 'Kan ik pinnen?', nativeText: 'Kartla ödeyebilir miyim?', pauseMultiplier: 1.3 },
            { id: 7, targetText: 'Ja, natuurlijk.', nativeText: 'Evet, tabii ki.', pauseMultiplier: 1.2 },
            { id: 8, targetText: 'Dank u wel, fijne dag!', nativeText: 'Teşekkür ederim, iyi günler!', pauseMultiplier: 1.4 },
        ],
    },
    {
        title: 'Süpermarkette alışveriş',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
            { id: 1, targetText: 'Waar kan ik de melk vinden?', nativeText: 'Sütü nerede bulabilirim?', pauseMultiplier: 1.4 },
            { id: 2, targetText: 'Het is in gangpad drie.', nativeText: 'Üçüncü koridorda.', pauseMultiplier: 1.3 },
            { id: 3, targetText: 'Heeft u een klantenkaart?', nativeText: 'Müşteri kartınız var mı?', pauseMultiplier: 1.5 },
            { id: 4, targetText: 'Nee, ik heb er geen.', nativeText: 'Hayır, yok.', pauseMultiplier: 1.3 },
            { id: 5, targetText: 'Wilt u een tasje?', nativeText: 'Poşet ister misiniz?', pauseMultiplier: 1.3 },
            { id: 6, targetText: 'Ja, graag. Wat kost het?', nativeText: 'Evet, lütfen. Ne kadar?', pauseMultiplier: 1.5 },
            { id: 7, targetText: 'Vijfentwintig cent.', nativeText: 'Yirmi beş sent.', pauseMultiplier: 1.2 },
            { id: 8, targetText: 'Alstublieft, prettige dag.', nativeText: 'Buyurun, iyi günler.', pauseMultiplier: 1.3 },
        ],
    },
    {
        title: 'Yol tarifi sormak',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
            { id: 1, targetText: 'Pardon, kunt u mij helpen?', nativeText: 'Affedersiniz, bana yardımcı olabilir misiniz?', pauseMultiplier: 1.4 },
            { id: 2, targetText: 'Waar is het dichtstbijzijnde station?', nativeText: 'En yakın istasyon nerede?', pauseMultiplier: 1.6 },
            { id: 3, targetText: 'Ga rechtdoor en sla links af.', nativeText: 'Düz gidin ve sola dönün.', pauseMultiplier: 1.5 },
            { id: 4, targetText: 'Is het ver lopen?', nativeText: 'Yürüyerek uzak mı?', pauseMultiplier: 1.3 },
            { id: 5, targetText: 'Het is ongeveer tien minuten.', nativeText: 'Yaklaşık on dakika.', pauseMultiplier: 1.4 },
            { id: 6, targetText: 'Kan ik ook de bus nemen?', nativeText: 'Otobüsle de gidebilir miyim?', pauseMultiplier: 1.4 },
            { id: 7, targetText: 'Ja, de halte is daar.', nativeText: 'Evet, durak orada.', pauseMultiplier: 1.3 },
            { id: 8, targetText: 'Heel erg bedankt!', nativeText: 'Çok teşekkür ederim!', pauseMultiplier: 1.2 },
        ],
    },
    {
        title: 'Yeni meslektaşlarla tanışma',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
            { id: 1, targetText: 'Hallo, ik ben de nieuwe collega.', nativeText: 'Merhaba, ben yeni çalışma arkadaşıyım.', pauseMultiplier: 1.5 },
            { id: 2, targetText: 'Aangenaam kennis te maken.', nativeText: 'Tanıştığımıza memnun oldum.', pauseMultiplier: 1.4 },
            { id: 3, targetText: 'Op welke afdeling werk jij?', nativeText: 'Hangi departmanda çalışıyorsun?', pauseMultiplier: 1.5 },
            { id: 4, targetText: 'Ik werk bij de design afdeling.', nativeText: 'Tasarım departmanında çalışıyorum.', pauseMultiplier: 1.4 },
            { id: 5, targetText: 'Hoe lang werk je hier al?', nativeText: 'Burada ne kadar süredir çalışıyorsun?', pauseMultiplier: 1.5 },
            { id: 6, targetText: 'Ongeveer twee jaar nu.', nativeText: 'Yaklaşık iki yıldır.', pauseMultiplier: 1.3 },
            { id: 7, targetText: 'Zullen we samen lunchen?', nativeText: 'Birlikte öğle yemeği yiyelim mi?', pauseMultiplier: 1.4 },
            { id: 8, targetText: 'Ja, dat lijkt me leuk!', nativeText: 'Evet, çok iyi olur!', pauseMultiplier: 1.3 },
        ],
    },
    {
        title: 'UX tasarım toplantısı',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
            { id: 1, targetText: 'Goedemorgen allemaal, laten we beginnen.', nativeText: 'Günaydın herkese, başlayalım.', pauseMultiplier: 1.5 },
            { id: 2, targetText: 'Ik heb de wireframes klaar.', nativeText: 'Wireframe\'leri hazırladım.', pauseMultiplier: 1.4 },
            { id: 3, targetText: 'Wat vinden jullie van dit ontwerp?', nativeText: 'Bu tasarım hakkında ne düşünüyorsunuz?', pauseMultiplier: 1.6 },
            { id: 4, targetText: 'Het ziet er strak uit!', nativeText: 'Çok şık görünüyor!', pauseMultiplier: 1.3 },
            { id: 5, targetText: 'Kunnen we de kleuren nog aanpassen?', nativeText: 'Renkleri hâlâ değiştirebilir miyiz?', pauseMultiplier: 1.5 },
            { id: 6, targetText: 'Natuurlijk, dat pas ik aan.', nativeText: 'Tabii, onu düzeltirim.', pauseMultiplier: 1.3 },
            { id: 7, targetText: 'Wanneer is de deadline?', nativeText: 'Son teslim tarihi ne zaman?', pauseMultiplier: 1.4 },
            { id: 8, targetText: 'Volgende week vrijdag.', nativeText: 'Gelecek cuma.', pauseMultiplier: 1.2 },
        ],
    },
];

/**
 * Pick a random offline scenario.
 * Optionally pass a topic string to try to match by title first.
 */
export function getOfflineScenario(topic?: string): Scenario {
    if (topic) {
        const normalizedTopic = topic.toLowerCase().trim();
        const match = OFFLINE_SCENARIOS.find((s) =>
            s.title.toLowerCase().includes(normalizedTopic) ||
            normalizedTopic.includes(s.title.toLowerCase())
        );
        if (match) {
            return { ...match, title: `${match.title} (Çevrimdışı)` };
        }
    }

    // Random pick
    const idx = Math.floor(Math.random() * OFFLINE_SCENARIOS.length);
    const picked = OFFLINE_SCENARIOS[idx];
    return { ...picked, title: `${picked.title} (Çevrimdışı)` };
}
