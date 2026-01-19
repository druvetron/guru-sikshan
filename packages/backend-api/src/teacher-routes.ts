import { Router } from 'express';
import { supabase } from './supabaseClient.js';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../../..', '.env'),
});

const router = Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001'
// ==================== AUTH ENDPOINTS ====================

router.get('/test-ai-config', (req, res) => {
  res.json({
    AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'NOT SET',
    isConfigured: !!process.env.AI_SERVICE_URL,
    nodeVersion: process.version,
  });
});

router.get('/test-env', (req, res) => {
  res.json({
    env_keys: Object.keys(process.env).filter(k => k.includes('AI') || k.includes('SUPABASE')),
    AI_SERVICE_URL: process.env.AI_SERVICE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL?.substring(0, 30) + '...',
  });
});

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

// Submit feedback with AI response
router.post('/feedback', async (req, res) => {
  const { teacherId, cluster, category, description } = req.body;

  console.log('📝 Feedback submission received:', { teacherId, cluster, category });

  if (!teacherId || !cluster || !category || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Save feedback to database
    console.log('💾 Saving feedback to Supabase...');
    const { data: feedbackData, error: feedbackError } = await supabase
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

    if (feedbackError) {
      console.error('❌ Supabase insert error:', feedbackError);
      return res.status(500).json({ error: 'Failed to save feedback' });
    }

    console.log('✅ Feedback saved with ID:', feedbackData.id);

    // 2. Call AI service for immediate analysis
    let aiResponse = null;
    try {
      const aiServiceUrl = `${AI_SERVICE_URL}/api/analyze-feedback/${teacherId}`;
      console.log('🤖 Calling AI service at:', aiServiceUrl);
      console.log('🤖 AI_SERVICE_URL env var:', AI_SERVICE_URL);
      
      const aiResult = await fetch(aiServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('🤖 AI service response status:', aiResult.status);

      if (aiResult.ok) {
        const aiData = await aiResult.json();
        console.log('✅ AI analysis data:', JSON.stringify(aiData, null, 2));

        // Generate AI suggestion text based on gaps
        const aiSuggestion = generateAISuggestion(aiData, description);
        console.log('💬 Generated AI suggestion:', aiSuggestion);

        // 3. Save AI response to database
        console.log('💾 Saving AI response to database...');
        const { data: aiResponseData, error: aiSaveError } = await supabase
          .from('ai_responses')
          .insert([{
            feedback_id: feedbackData.id,
            teacher_id: teacherId,
            ai_suggestion: aiSuggestion,
            inferred_gaps: (aiData as any).inferred_gaps || [],
            confidence_score: 0.85,
          }])
          .select()
          .single();

        if (aiSaveError) {
          console.error('❌ AI response save error:', aiSaveError);
        } else {
          console.log('✅ AI response saved:', aiResponseData?.id);
        }

        aiResponse = {
          suggestion: aiSuggestion,
          inferredGaps: (aiData as any).inferred_gaps || [],
          priority: (aiData as any).priority || 'medium',
        };
      } else {
        const errorText = await aiResult.text();
        console.warn('⚠️ AI service returned error:', aiResult.status, errorText);
      }
    } catch (aiError) {
      console.error('❌ AI service error (non-blocking):', aiError);
      console.error('Error details:', aiError.message);
      // Don't fail the request if AI service is down
    }

    console.log('📤 Sending response with aiResponse:', aiResponse);

    res.status(201).json({
      success: true,
      feedback: {
        id: feedbackData.id,
        teacherId: feedbackData.teacher_id,
        cluster: feedbackData.cluster,
        category: feedbackData.category,
        description: feedbackData.description,
        status: feedbackData.status,
        createdAt: feedbackData.created_at,
        updatedAt: feedbackData.updated_at,
        adminRemarks: feedbackData.admin_remarks,
      },
      aiResponse, // Include AI response if available
    });
  } catch (error) {
    console.error('❌ Submit feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate user-friendly AI suggestions
function generateAISuggestion(aiData: any, issueDescription: string): string {
  const gaps = aiData.inferred_gaps || [];
  const priority = aiData.priority || 'medium';

  if (gaps.length === 0) {
    return `Thank you for reporting this issue: "${issueDescription}". We're analyzing it and will provide personalized support soon.`;
  }

  const gapNames = {
    classroom_management: 'Classroom Management',
    content_knowledge: 'Content Knowledge',
    pedagogy: 'Teaching Methods',
    technology_usage: 'Technology Integration',
    student_engagement: 'Student Engagement',
  };

  const readableGaps = gaps.map(g => gapNames[g] || g).join(', ');

  const suggestions = {
    high: `We've identified this relates to: ${readableGaps}. This is a priority area. Our team will connect you with targeted training resources within 24 hours. In the meantime, try breaking down the issue into smaller, manageable steps.`,
    medium: `Based on your feedback, we see opportunities to strengthen your ${readableGaps} skills. We'll send you personalized training materials soon. Consider discussing this with peer teachers who've faced similar challenges.`,
    low: `Thank you for sharing. We've noted this connects to ${readableGaps}. We'll include relevant resources in your upcoming professional development plan.`,
  };

  return suggestions[priority] || suggestions.medium;
}

// Get AI response for a feedback
router.get('/feedback/:id/ai-response', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('ai_responses')
      .select('*')
      .eq('feedback_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'AI response not found' });
    }

    res.json({
      success: true,
      aiResponse: {
        suggestion: data.ai_suggestion,
        inferredGaps: data.inferred_gaps,
        confidenceScore: data.confidence_score,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    console.error('Get AI response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
