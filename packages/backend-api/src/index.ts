import express from 'express';
import cors from 'cors';
import teacherRoutes from './teacher-routes.js';
import dashboardRoutes from './dashboard-routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api/teacher', teacherRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
  console.log('\nAvailable routes:');
  console.log('  Teacher App: /api/teacher/*');
  console.log('  Dashboard: /api/dashboard/*');
});
