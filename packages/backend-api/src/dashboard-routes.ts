import { Router } from 'express';
import { supabase } from './supabaseClient.js';

const router = Router();

// ==================== DASHBOARD ENDPOINTS ====================

// Get all feedback (for admin dashboard)
router.get('/feedback/all', async (req, res) => {
  const { status, cluster, limit = 50, offset = 0 } = req.query;

  try {
    let query = supabase
      .from('feedback')
      .select('*, teachers!inner(name, email, employee_id)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (cluster) {
      query = query.eq('cluster', cluster);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const feedbacks = data.map(item => ({
      id: item.id,
      teacherId: item.teacher_id,
      teacherName: item.teachers.name,
      teacherEmail: item.teachers.email,
      teacherEmployeeId: item.teachers.employee_id,
      cluster: item.cluster,
      category: item.category,
      description: item.description,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      adminRemarks: item.admin_remarks,
    }));

    res.json({
      success: true,
      feedbacks,
      total: count,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update feedback status (admin action)
router.patch('/feedback/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, adminRemarks } = req.body;

  if (!status || !['pending', 'in_review', 'resolved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminRemarks !== undefined) {
      updateData.admin_remarks = adminRemarks;
    }

    const { data, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
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
    console.error('Update feedback status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const { data: allFeedback, error } = await supabase
      .from('feedback')
      .select('status, category, cluster');

    if (error) {
      throw error;
    }

    const stats = {
      total: allFeedback.length,
      byStatus: {
        pending: allFeedback.filter(f => f.status === 'pending').length,
        inReview: allFeedback.filter(f => f.status === 'in_review').length,
        resolved: allFeedback.filter(f => f.status === 'resolved').length,
        rejected: allFeedback.filter(f => f.status === 'rejected').length,
      },
      byCategory: {
        academic: allFeedback.filter(f => f.category === 'academic').length,
        infrastructure: allFeedback.filter(f => f.category === 'infrastructure').length,
        administrative: allFeedback.filter(f => f.category === 'administrative').length,
        safety: allFeedback.filter(f => f.category === 'safety').length,
        technology: allFeedback.filter(f => f.category === 'technology').length,
        other: allFeedback.filter(f => f.category === 'other').length,
      },
      byClusters: allFeedback.reduce((acc, f) => {
        acc[f.cluster] = (acc[f.cluster] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all teachers (for dashboard)
router.get('/teachers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('id, name, email, cluster, employee_id, created_at')
      .order('name');

    if (error) {
      throw error;
    }

    const teachers = data.map(t => ({
      id: t.id,
      name: t.name,
      email: t.email,
      cluster: t.cluster,
      employeeId: t.employee_id,
      createdAt: t.created_at,
    }));

    res.json({ success: true, teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
