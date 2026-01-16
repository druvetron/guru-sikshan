import express from 'express';
import cors from 'cors';
import pool from './db';
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health' , (req,res) => {
    res.json({ status: 'ok'});
});

app.post('/api/feedback',async (req,res) => {
    const {teacher_id, issue,cluster} = req.body;
    try{
        const result = await pool.query(
            'INSERT INTO feedback (teacher_id, issue, cluster) VALUES ($1, $2, $3) RETURNING *',
            [teacher_id,issue,cluster]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: String(err)});
    }
});

const PORT = process.env.PORT;
app.listen(PORT,() => console.log('Backend running on ${PORT}'));