import { Router } from 'express';
import { supabase } from './supabaseClient.js';
import bcrypt from 'bcrypt';

const router = Router();

// ==================== AUTH ENDPOINTS ====================

// Login endpoint
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Fetch teacher by email
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !teacher) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, teacher.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Remove password hash from response
    const { password_hash, ...teacherData } = teacher;

    res.json({
      success: true,
      teacher: {
        id: teacherData.id,
        name: teacherData.name,
        email: teacherData.email,
        cluster: teacherData.cluster,
        employeeId: teacherData.employee_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register endpoint (optional - for testing)
router.post('/auth/register', async (req, res) => {
  const { name, email, password, cluster, employeeId } = req.body;

  if (!name || !email || !password || !cluster || !employeeId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('teachers')
      .insert([{
        name,
        email,
        password_hash: passwordHash,
        cluster,
        employee_id: employeeId,
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Email or Employee ID already exists' });
      }
      throw error;
    }

    const { password_hash, ...teacherData } = data;

    res.status(201).json({
      success: true,
      teacher: {
        id: teacherData.id,
        name: teacherData.name,
        email: teacherData.email,
        cluster: teacherData.cluster,
        employeeId: teacherData.employee_id,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== FEEDBACK ENDPOINTS ====================

// Submit feedback
router.post('/feedback', async (req, res) => {
  const { teacherId, cluster, category, description } = req.body;

  if (!teacherId || !cluster || !category || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        teacher_id: teacherId,
        cluster,
        category,
        description,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save feedback' });
    }

    res.status(201).json({
      success: true,
      feedback: {
        id: data.id,
        teacherId: data.teacher_id,
        cluster: data.cluster,
        category: data.category,
        description: data.description,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        adminRemarks: data.admin_remarks,
      },
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all feedback for a teacher
router.get('/feedback/teacher/:teacherId', async (req, res) => {
  const { teacherId } = req.params;

  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const feedbacks = data.map(item => ({
      id: item.id,
      teacherId: item.teacher_id,
      cluster: item.cluster,
      category: item.category,
      description: item.description,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      adminRemarks: item.admin_remarks,
    }));

    res.json({ success: true, feedbacks });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single feedback by ID
router.get('/feedback/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({
      success: true,
      feedback: {
        id: data.id,
        teacherId: data.teacher_id,
        cluster: data.cluster,
        category: data.category,
        description: data.description,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        adminRemarks: data.admin_remarks,
      },
    });
  } catch (error) {
    console.error('Get feedback by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
