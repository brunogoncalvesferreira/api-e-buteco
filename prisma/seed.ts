import { hash } from "bcryptjs";
import { prisma } from "../src/lib/prisma.ts";

async function main() {
  const USER = {
    name: "Bruno Gonçalves Ferreira",
    email: "bruno@email.com",
    password: "123456",
  };

  const PASSWORDHASH = await hash(USER.password, 6);

  await prisma.user.create({
    data: {
      name: USER.name,
      email: USER.email,
      password: PASSWORDHASH,
    },
  });
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
