import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
    console.log("Testing DB connection...");
    try {
        const start = Date.now();
        const courses = await prisma.course.findMany();
        console.log(`DB OK! Found ${courses.length} courses in ${Date.now() - start}ms`);
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
