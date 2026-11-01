// R5: scheduled job (cron or Vercel Cron): delete expired applications
import { prisma } from '@/lib/prisma';

export async function purgeExpiredApplications() {
  const { count } = await prisma.application.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return count;
}
