import { PrismaClient } from "generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
try {
	await prisma.$executeRaw`TRUNCATE TABLE comments RESTART IDENTITY;`;
	const { comments } = await import("seed_data/comments.json");
	const data = comments.map(x => ({ ...x, id: Number(x.id), date: new Date(x.date) }));
	await prisma.comment.createMany({ data });
	await prisma.$executeRawUnsafe(`ALTER SEQUENCE comments_id_seq RESTART WITH ${comments.reduce((max, curr) => Math.max(Number(curr.id), max), 0) + 1}`);
	console.log("Seeding complete!");
} catch (e) {
	console.error(e);
	process.exit(1);
} finally {
	await prisma.$disconnect();
}
