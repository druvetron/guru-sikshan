import express from 'express';
import cors from 'cors';
import pool from './db.js';
import { supabase } from './supabaseClient.js'
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/feedback', async (req, res) => {
    const { teacher_id, issue, cluster } = req.body;
  
    if (!teacher_id || !issue || !cluster) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const { data, error } = await supabase
      .from('feedback')
      .insert([{ teacher_id, issue, cluster }])
      .select(); 
  
    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save feedback' });
    }
  
    console.log('Saved to DB:', data[0]);
    res.status(201).json({ success: true, feedback: data[0] });
  });

app.get('/health' , (req,res) => {
    res.json({ status: 'ok'});
});

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://0.0.0.0:${PORT}`);
});