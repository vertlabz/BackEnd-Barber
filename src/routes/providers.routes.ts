import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import ensureAuthenticated from '../middlewares/authMiddleware';

const prisma = new PrismaClient();
const router = Router();

// listar providers
router.get('/', ensureAuthenticated, async (req, res) => {
  const providers = await prisma.user.findMany({
    where: { isProvider: true },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });
  return res.json(providers);
});

// detalhes do provider
router.get('/:providerId', ensureAuthenticated, async (req, res) => {
  const { providerId } = req.params;
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      services: true,
      providerAvailabilities: true,
    },
  });
  if (!provider) return res.status(404).json({ message: 'Provider not found' });
  return res.json(provider);
});

export default router;
