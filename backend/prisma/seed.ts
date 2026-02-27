// ─── Database Seed ───
// Seeds initial courses with Dutch-Turkish dialogue lessons.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Course 1: Beginner — Daily Basics ───
  const course1 = await prisma.course.create({
    data: {
      title: 'Günlük Temel İfadeler',
      description: 'Hollandaca günlük yaşamda kullanılan temel ifadeler ve selamlaşmalar.',
      difficulty: 'beginner',
      targetLang: 'nl-NL',
      nativeLang: 'tr-TR',
      lessons: {
        create: [
          {
            title: 'Selamlaşma',
            sortOrder: 1,
            lines: JSON.parse(JSON.stringify([
              { id: 1, targetText: 'Goedemorgen!', nativeText: 'Günaydın!', pauseMultiplier: 1.0 },
              { id: 2, targetText: 'Hoe gaat het met u?', nativeText: 'Nasılsınız?', pauseMultiplier: 1.2 },
              { id: 3, targetText: 'Het gaat goed, dank u wel.', nativeText: 'İyiyim, teşekkür ederim.', pauseMultiplier: 1.5 },
              { id: 4, targetText: 'Aangenaam kennis te maken.', nativeText: 'Tanıştığımıza memnun oldum.', pauseMultiplier: 1.5 },
              { id: 5, targetText: 'Tot ziens!', nativeText: 'Hoşça kalın!', pauseMultiplier: 1.0 },
            ])),
          },
          {
            title: 'Kendinizi Tanıtma',
            sortOrder: 2,
            lines: JSON.parse(JSON.stringify([
              { id: 1, targetText: 'Ik heet Mustafa.', nativeText: 'Benim adım Mustafa.', pauseMultiplier: 1.0 },
              { id: 2, targetText: 'Ik kom uit Turkije.', nativeText: 'Türkiye\'den geliyorum.', pauseMultiplier: 1.2 },
              { id: 3, targetText: 'Ik woon in Amsterdam.', nativeText: 'Amsterdam\'da yaşıyorum.', pauseMultiplier: 1.2 },
              { id: 4, targetText: 'Ik ben UX designer.', nativeText: 'Ben UX tasarımcıyım.', pauseMultiplier: 1.2 },
              { id: 5, targetText: 'Ik spreek een beetje Nederlands.', nativeText: 'Biraz Hollandaca konuşuyorum.', pauseMultiplier: 1.5 },
            ])),
          },
        ],
      },
    },
  });

  // ─── Course 2: Intermediate — At the Office ───
  const course2 = await prisma.course.create({
    data: {
      title: 'Ofis Konuşmaları',
      description: 'İş yerinde günlük konuşmalar ve toplantı ifadeleri.',
      difficulty: 'intermediate',
      targetLang: 'nl-NL',
      nativeLang: 'tr-TR',
      lessons: {
        create: [
          {
            title: 'Sabah Toplantısı',
            sortOrder: 1,
            lines: JSON.parse(JSON.stringify([
              { id: 1, targetText: 'Goedemorgen allemaal, kunnen we beginnen?', nativeText: 'Günaydın herkese, başlayabilir miyiz?', pauseMultiplier: 1.5 },
              { id: 2, targetText: 'Ik heb de agenda gedeeld via e-mail.', nativeText: 'Gündemi e-posta ile paylaştım.', pauseMultiplier: 1.5 },
              { id: 3, targetText: 'Wie wil de notulen bijhouden?', nativeText: 'Toplantı notlarını kim tutmak ister?', pauseMultiplier: 1.5 },
              { id: 4, targetText: 'Laten we de deadline bespreken.', nativeText: 'Son tarihi tartışalım.', pauseMultiplier: 1.5 },
              { id: 5, targetText: 'Zijn er nog vragen?', nativeText: 'Başka soru var mı?', pauseMultiplier: 1.2 },
            ])),
          },
          {
            title: 'Mola Sohbeti',
            sortOrder: 2,
            lines: JSON.parse(JSON.stringify([
              { id: 1, targetText: 'Heb je zin in koffie?', nativeText: 'Kahve ister misin?', pauseMultiplier: 1.2 },
              { id: 2, targetText: 'Hoe was je weekend?', nativeText: 'Hafta sonun nasıldı?', pauseMultiplier: 1.2 },
              { id: 3, targetText: 'Ik ben een beetje moe vandaag.', nativeText: 'Bugün biraz yorgunum.', pauseMultiplier: 1.5 },
              { id: 4, targetText: 'Het weer is lekker vandaag!', nativeText: 'Bugün hava güzel!', pauseMultiplier: 1.2 },
              { id: 5, targetText: 'Zullen we buiten lunchen?', nativeText: 'Dışarıda öğle yemeği yiyelim mi?', pauseMultiplier: 1.5 },
            ])),
          },
        ],
      },
    },
  });

  console.log(`✅ Created course: ${course1.title} (${course1.id})`);
  console.log(`✅ Created course: ${course2.title} (${course2.id})`);
  console.log('🌱 Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
