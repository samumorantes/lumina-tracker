require('ts-node').register({ transpileOnly: true });
const { prisma } = require('./src/lib/prisma.ts');

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log("Users:", users);
    } catch (e) {
        console.error("Prisma Error:", e);
    }
}

main().catch(console.error);
