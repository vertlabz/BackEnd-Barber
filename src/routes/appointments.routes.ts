import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import ensureAuthenticated from '../middlewares/authMiddleware';

const prisma = new PrismaClient();
const router = Router();

// criar agendamento
router.post('/', ensureAuthenticated, async (req, res) => {
  const { providerId, date, serviceId, notes } = req.body;
  // @ts-ignore
  const userId = req.user.id as string;

  if (!providerId || !date) return res.status(400).json({ message: 'providerId and date required' });

  // basic checks: provider exists and is provider
  const provider = await prisma.user.findUnique({ where: { id: providerId } });
  if (!provider || !provider.isProvider) return res.status(400).json({ message: 'Invalid provider' });

  const appointment = await prisma.appointment.create({
    data: {
      date: new Date(date),
      customerId: userId,
      providerId,
      serviceId,
      notes,
    },
  });

  return res.status(201).json(appointment);
});

// listar agendamentos do usuário autenticado
router.get('/me', ensureAuthenticated, async (req, res) => {
  // @ts-ignore
  const userId = req.user.id as string;

  const appointments = await prisma.appointment.findMany({
    where: { customerId: userId },
    include: { provider: { select: { id: true, name: true } }, service: true },
    orderBy: { date: 'asc' },
  });

  return res.json(appointments);
});

// provider: listar agendamentos do provider (dia)
router.get('/provider/:providerId', ensureAuthenticated, async (req, res) => {
  const { providerId } = req.params;
  const { date } = req.query; // optional date filter YYYY-MM-DD

  const where: any = { providerId };
  if (date) {
    const dayStart = new Date(String(date) + 'T00:00:00Z');
    const dayEnd = new Date(String(date) + 'T23:59:59Z');
    where.date = { gte: dayStart, lte: dayEnd };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { customer: { select: { id: true, name: true } }, service: true },
    orderBy: { date: 'asc' },
  });

  return res.json(appointments);
});

// cancelar (simples)
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  // @ts-ignore
  const userId = req.user.id as string;

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

  // only customer or provider can cancel
  if (appointment.customerId !== userId && appointment.providerId !== userId) {
    return res.status(403).json({ message: 'Not allowed' });
  }

  await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED' } });
  return res.json({ message: 'Cancelled' });
});

export default router;
