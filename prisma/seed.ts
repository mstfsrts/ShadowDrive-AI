// ─── ShadowDrive AI — Database Seed ───
// Migrates offline JSON courses → PostgreSQL
// Safe to re-run (upsert). Real content will replace mock data later.

import { PrismaClient } from '@prisma/client';
import groeneBoek from '../data/courses/groene_boek.json';
import tweedeRonde from '../data/courses/tweede_ronde.json';
import derdeRonde from '../data/courses/derde_ronde.json';
import goedbezig from '../data/courses/goedbezig.json';

const prisma = new PrismaClient();

const COURSES = [
    { data: groeneBoek, order: 0 },
    { data: tweedeRonde, order: 1 },
    { data: derdeRonde, order: 2 },
    { data: goedbezig, order: 3 },
];

async function main() {
    console.log('🌱 Seeding courses...');

    for (const { data, order } of COURSES) {
        await prisma.course.upsert({
            where: { id: data.id },
            update: {
                title: data.title,
                description: data.description,
                emoji: data.emoji,
                color: data.color,
                order,
            },
            create: {
                id: data.id,
                title: data.title,
                description: data.description,
                emoji: data.emoji,
                color: data.color,
                order,
            },
        });

        for (let i = 0; i < data.lessons.length; i++) {
            const lesson = data.lessons[i];
            await prisma.lesson.upsert({
                where: { id: lesson.id },
                update: {
                    title: lesson.title,
                    order: i,
                    content: lesson.scenario as object,
                },
                create: {
                    id: lesson.id,
                    courseId: data.id,
                    title: lesson.title,
                    order: i,
                    content: lesson.scenario as object,
                },
            });
        }

        console.log(`  ✓ ${data.emoji} ${data.title} (${data.lessons.length} ders)`);
    }

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
