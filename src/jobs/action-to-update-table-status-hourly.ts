/* import { prisma } from '../lib/prisma.ts'

async function actionToUpdateTableStatusHourly() {
  const busyTables = await prisma.table.findMany({
    where: {
      tableStatus: 'BUSY',
    },

    select: {
      id: true,
      upadetedAt: true,
    },
  })

  busyTables.forEach(async (table) => {
    if (
      table.upadetedAt &&
      table.upadetedAt <
        new Date(new Date().setHours(new Date().getHours() - 1))
    ) {
      await prisma.table.update({
        where: {
          id: table.id,
        },

        data: {
          tableStatus: 'FREE',
        },
      })
    }
  })
}

export { actionToUpdateTableStatusHourly }
 */
