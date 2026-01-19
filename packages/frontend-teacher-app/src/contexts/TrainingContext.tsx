import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type TrainingStatus = 'not_started' | 'in_progress' | 'completed';

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  totalLessons: number;
  completedLessons: number;
  status: TrainingStatus;
  dueDate: Date;
  assignedAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  materials: TrainingMaterial[];
}

export interface TrainingMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'document' | 'presentation';
  size: string;
  downloadUrl: string;
}

export interface TrainingFeedback {
  id: string;
  trainingId: string;
  rating: number;
  comment: string;
  submittedAt: Date;
}

interface TrainingContextType {
  trainings: TrainingModule[];
  feedbacks: TrainingFeedback[];
  isLoading: boolean;
  getTrainingById: (id: string) => TrainingModule | undefined;
  updateProgress: (trainingId: string, completedLessons: number) => void;
  submitTrainingFeedback: (trainingId: string, rating: number, comment: string) => Promise<boolean>;
  getFeedbackByTrainingId: (trainingId: string) => TrainingFeedback | undefined;
  notStartedCount: number;
  inProgressCount: number;
  completedCount: number;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

const MOCK_MATERIALS: TrainingMaterial[] = [
  { id: '1', name: 'Course Introduction.pdf', type: 'pdf', size: '2.4 MB', downloadUrl: '#' },
  { id: '2', name: 'Lesson Slides.pptx', type: 'presentation', size: '5.1 MB', downloadUrl: '#' },
  { id: '3', name: 'Supplementary Reading.docx', type: 'document', size: '1.2 MB', downloadUrl: '#' },
];

const MOCK_TRAININGS: TrainingModule[] = [
  {
    id: '1',
    title: 'Digital Classroom Management',
    description: 'Learn effective strategies for managing a digital classroom environment, including student engagement techniques, online tools, and best practices for virtual teaching.',
    category: 'Technology',
    totalLessons: 8,
    completedLessons: 5,
    status: 'in_progress',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    assignedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    materials: MOCK_MATERIALS,
  },
  {
    id: '2',
    title: 'Inclusive Education Practices',
    description: 'Comprehensive training on creating an inclusive learning environment for students with diverse needs and backgrounds.',
    category: 'Pedagogy',
    totalLessons: 12,
    completedLessons: 0,
    status: 'not_started',
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    materials: [
      { id: '4', name: 'Inclusive Education Guide.pdf', type: 'pdf', size: '3.8 MB', downloadUrl: '#' },
      { id: '5', name: 'Case Studies.pdf', type: 'pdf', size: '2.1 MB', downloadUrl: '#' },
    ],
  },
  {
    id: '3',
    title: 'Student Assessment Methods',
    description: 'Modern approaches to student assessment, including formative assessment techniques, rubric development, and data-driven instruction.',
    category: 'Assessment',
    totalLessons: 6,
    completedLessons: 6,
    status: 'completed',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    materials: [
      { id: '6', name: 'Assessment Toolkit.pdf', type: 'pdf', size: '4.2 MB', downloadUrl: '#' },
    ],
  },
  {
    id: '4',
    title: 'Child Safety & Wellbeing',
    description: 'Essential training on child protection policies, identifying signs of distress, and creating a safe learning environment.',
    category: 'Safety',
    totalLessons: 10,
    completedLessons: 3,
    status: 'in_progress',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    materials: MOCK_MATERIALS,
  },
];

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [trainings, setTrainings] = useState<TrainingModule[]>([]);
  const [feedbacks, setFeedbacks] = useState<TrainingFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedTrainings = localStorage.getItem('trainings');
    const storedFeedbacks = localStorage.getItem('trainingFeedbacks');
    
    if (storedTrainings) {
      const parsed = JSON.parse(storedTrainings);
      setTrainings(parsed.map((t: any) => ({
        ...t,
        dueDate: new Date(t.dueDate),
        assignedAt: new Date(t.assignedAt),
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
      })));
    } else {
      setTrainings(MOCK_TRAININGS);
      localStorage.setItem('trainings', JSON.stringify(MOCK_TRAININGS));
    }

    if (storedFeedbacks) {
      const parsed = JSON.parse(storedFeedbacks);
      setFeedbacks(parsed.map((f: any) => ({
        ...f,
        submittedAt: new Date(f.submittedAt),
      })));
    }

    setIsLoading(false);
  }, []);

  const getTrainingById = (id: string) => trainings.find(t => t.id === id);

  const updateProgress = (trainingId: string, completedLessons: number) => {
    const updated = trainings.map(t => {
      if (t.id === trainingId) {
        const newStatus: TrainingStatus = 
          completedLessons === 0 ? 'not_started' :
          completedLessons >= t.totalLessons ? 'completed' : 'in_progress';
        
        return {
          ...t,
          completedLessons: Math.min(completedLessons, t.totalLessons),
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : undefined,
        };
      }
      return t;
    });
    setTrainings(updated);
    localStorage.setItem('trainings', JSON.stringify(updated));
  };

  const submitTrainingFeedback = async (trainingId: string, rating: number, comment: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newFeedback: TrainingFeedback = {
      id: Date.now().toString(),
      trainingId,
      rating,
      comment,
      submittedAt: new Date(),
    };
    
    const updated = [...feedbacks, newFeedback];
    setFeedbacks(updated);
    localStorage.setItem('trainingFeedbacks', JSON.stringify(updated));
    return true;
  };

  const getFeedbackByTrainingId = (trainingId: string) => feedbacks.find(f => f.trainingId === trainingId);

  const notStartedCount = trainings.filter(t => t.status === 'not_started').length;
  const inProgressCount = trainings.filter(t => t.status === 'in_progress').length;
  const completedCount = trainings.filter(t => t.status === 'completed').length;

  return (
    <TrainingContext.Provider value={{
      trainings,
      feedbacks,
      isLoading,
      getTrainingById,
      updateProgress,
      submitTrainingFeedback,
      getFeedbackByTrainingId,
      notStartedCount,
      inProgressCount,
      completedCount,
    }}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
}
