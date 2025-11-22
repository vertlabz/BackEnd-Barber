import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import ensureAuthenticated from '../middlewares/authMiddleware';

const prisma = new PrismaClient();
const router = Router();

// criar disponibilidade (provider somente)
router.post('/', ensureAuthenticated, async (req, res) => {
  const { weekday, startTime, endTime } = req.body;
  // @ts-ignore
  const userId = req.user.id as string;

  // check provider
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isProvider) return res.status(403).json({ message: 'Only providers can set availability' });

  // simple validation
  if (weekday < 0 || weekday > 6) return res.status(400).json({ message: 'weekday must be 0-6' });

  const created = await prisma.providerAvailability.create({
    data: { providerId: userId, weekday, startTime, endTime },
  });

  return res.status(201).json(created);
});

// listar disponibilidade de um provider (por semana ou dia)
router.get('/:providerId', async (req, res) => {
  const { providerId } = req.params;
  const avail = await prisma.providerAvailability.findMany({
    where: { providerId },
    orderBy: { weekday: 'asc' },
  });
  return res.json(avail);
});

export default router;
