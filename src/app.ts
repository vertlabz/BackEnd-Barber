import express from 'express';
import 'dotenv/config';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import appointmentsRoutes from './routes/appointments.routes';
import providersRoutes from './routes/providers.routes';
import availabilityRoutes from './routes/availability.routes';

const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/providers', providersRoutes);
app.use('/availability', availabilityRoutes);

export default app;
