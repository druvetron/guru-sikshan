import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type IssueCategory = 'academic' | 'infrastructure' | 'administrative' | 'safety' | 'technology' | 'other';
export type IssueStatus = 'pending' | 'in_review' | 'resolved' | 'rejected';

export interface Feedback {
  id: string;
  teacherId: string;
  cluster: string;
  category: IssueCategory;
  description: string;
  status: IssueStatus;
  createdAt: Date;
  updatedAt: Date;
  adminRemarks?: string;
  aiResponse?: {  
    suggestion: string;
    inferredGaps: string[];
    priority: string;
  };
}

interface FeedbackContextType {
  feedbacks: Feedback[];
  isLoading: boolean;
  submitFeedback: (data: Omit<Feedback, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<{
    success: boolean;
    aiResponse?: {
      suggestion: string;
      inferredGaps: string[];
      priority: string;
    };
  }>;
  getFeedbackById: (id: string) => Feedback | undefined;
  refreshFeedbacks: () => Promise<void>;
  pendingCount: number;
  inReviewCount: number;
  resolvedCount: number;
  error: string | null;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const { teacher, isAuthenticated } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch feedbacks when teacher logs in
  useEffect(() => {
    if (isAuthenticated && teacher?.id) {
      refreshFeedbacks();
    } else {
      setFeedbacks([]);
    }
  }, [isAuthenticated, teacher?.id]);

  const refreshFeedbacks = async () => {
    if (!teacher?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/teacher/feedback/teacher/${teacher.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch feedbacks');
      }

      if (data.success && data.feedbacks) {
        const parsedFeedbacks = data.feedbacks.map((f: any) => ({
          id: f.id,
          teacherId: f.teacherId,
          cluster: f.cluster,
          category: f.category as IssueCategory,
          description: f.description,
          status: f.status as IssueStatus,
          createdAt: new Date(f.createdAt),
          updatedAt: new Date(f.updatedAt),
          adminRemarks: f.adminRemarks,
        }));
        
        setFeedbacks(parsedFeedbacks);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feedbacks');
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async (data: Omit<Feedback, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<{success: boolean; aiResponse?: any}> => {
    if (!teacher?.id) {
      setError('You must be logged in to submit feedback');
      return { success: false };
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`${API_URL}/api/teacher/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: data.teacherId,
          cluster: data.cluster,
          category: data.category,
          description: data.description,
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit feedback');
      }
  
      if (result.success && result.feedback) {
        const newFeedback: Feedback = {
          id: result.feedback.id,
          teacherId: result.feedback.teacherId,
          cluster: result.feedback.cluster,
          category: result.feedback.category as IssueCategory,
          description: result.feedback.description,
          status: result.feedback.status as IssueStatus,
          createdAt: new Date(result.feedback.createdAt),
          updatedAt: new Date(result.feedback.updatedAt),
          adminRemarks: result.feedback.adminRemarks,
          aiResponse: result.aiResponse, // Include AI response
        };
  
        setFeedbacks(prev => [newFeedback, ...prev]);
        setIsLoading(false);
        return { success: true, aiResponse: result.aiResponse };
      }
  
      throw new Error('Invalid response from server');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
      setIsLoading(false);
      return { success: false };
    }
  };

  const getFeedbackById = (id: string) => feedbacks.find(f => f.id === id);

  const pendingCount = feedbacks.filter(f => f.status === 'pending').length;
  const inReviewCount = feedbacks.filter(f => f.status === 'in_review').length;
  const resolvedCount = feedbacks.filter(f => f.status === 'resolved').length;

  return (
    <FeedbackContext.Provider value={{
      feedbacks,
      isLoading,
      submitFeedback,
      getFeedbackById,
      refreshFeedbacks,
      pendingCount,
      inReviewCount,
      resolvedCount,
      error,
    }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
