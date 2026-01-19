import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useFeedback } from '@/contexts/FeedbackContext';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { CategoryBadge } from '@/components/ui/category-badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Calendar, Clock, MessageSquare, Sparkles, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function FeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const { getFeedbackById } = useFeedback();
  const navigate = useNavigate();
  const [aiResponse, setAiResponse] = useState<{
    suggestion: string;
    inferredGaps: string[];
    confidenceScore: number;
  } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const feedback = id ? getFeedbackById(id) : undefined;

  // Fetch AI response when component mounts
  useEffect(() => {
    if (id) {
      fetchAIResponse(id);
    }
  }, [id]);

  const fetchAIResponse = async (feedbackId: string) => {
    setLoadingAI(true);
    try {
      const response = await fetch(`${API_URL}/api/teacher/feedback/${feedbackId}/ai-response`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.aiResponse) {
          setAiResponse(data.aiResponse);
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI response:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  if (!feedback) {
    return (
      <MobileLayout>
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
          <h2 className="mb-2 text-xl font-bold text-foreground">Issue not found</h2>
          <p className="mb-4 text-muted-foreground">This feedback may have been deleted.</p>
          <Button onClick={() => navigate('/history')}>Back to History</Button>
        </div>
      </MobileLayout>
    );
  }

  const gapNames = {
    classroom_management: 'Classroom Management',
    content_knowledge: 'Content Knowledge',
    pedagogy: 'Teaching Methods',
    technology_usage: 'Technology Integration',
    student_engagement: 'Student Engagement',
  };

  return (
    <MobileLayout>
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Issue Details</h1>
        </div>

        {/* Status & Category */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <CategoryBadge category={feedback.category} />
          <StatusBadge status={feedback.status} />
        </div>

        {/* Description */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Description
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-foreground leading-relaxed">
              {feedback.description}
            </p>
          </CardContent>
        </Card>

        {/* AI Response Section */}
        {(aiResponse || loadingAI) && (
          <Card className="mb-4 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-blue-700 dark:text-blue-300">
                <Sparkles className="h-5 w-5" />
                AI Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {loadingAI ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  Analyzing your feedback...
                </div>
              ) : aiResponse ? (
                <>
                  {/* Identified Focus Areas */}
                  {aiResponse.inferredGaps && aiResponse.inferredGaps.length > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-white/50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
                      <div className="mb-2 flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          Identified Focus Areas
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiResponse.inferredGaps.map((gap: string) => (
                          <span
                            key={gap}
                            className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                          >
                            {gapNames[gap as keyof typeof gapNames] || gap.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Suggestion */}
                  <div className="rounded-lg border border-blue-200 bg-white/70 p-3 dark:border-blue-700 dark:bg-blue-900/30">
                    <p className="text-sm leading-relaxed text-foreground">
                      {aiResponse.suggestion}
                    </p>
                  </div>

                  {/* Info Footer */}
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                    <Sparkles className="h-3 w-3" />
                    <span>AI-powered personalized guidance based on your feedback</span>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Details */}
        <Card className="mb-4">
          <CardContent className="divide-y divide-border p-0">
            <div className="flex items-center gap-3 p-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Cluster</p>
                <p className="font-medium text-foreground">{feedback.cluster}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="font-medium text-foreground">
                  {format(feedback.createdAt, 'MMMM d, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  at {format(feedback.createdAt, 'h:mm a')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="font-medium text-foreground">
                  {format(feedback.updatedAt, 'MMMM d, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  at {format(feedback.updatedAt, 'h:mm a')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Remarks */}
        {feedback.adminRemarks && (
          <Card className="mb-4 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-primary">
                <MessageSquare className="h-4 w-4" />
                Admin Remarks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-foreground leading-relaxed">
                {feedback.adminRemarks}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Status Timeline */}
        <div className="mt-6">
          <h3 className="mb-4 font-semibold text-foreground">Status Timeline</h3>
          <div className="space-y-4">
            <TimelineItem
              title="Issue Submitted"
              date={format(feedback.createdAt, 'MMM d, yyyy h:mm a')}
              isCompleted
            />
            {(feedback.status === 'in_review' || feedback.status === 'resolved') && (
              <TimelineItem
                title="Under Review"
                date={format(feedback.updatedAt, 'MMM d, yyyy h:mm a')}
                isCompleted
              />
            )}
            {feedback.status === 'resolved' && (
              <TimelineItem
                title="Resolved"
                date={format(feedback.updatedAt, 'MMM d, yyyy h:mm a')}
                isCompleted
                isLast
              />
            )}
            {feedback.status === 'pending' && (
              <TimelineItem
                title="Awaiting Review"
                date="Pending"
                isCompleted={false}
                isLast
              />
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

interface TimelineItemProps {
  title: string;
  date: string;
  isCompleted: boolean;
  isLast?: boolean;
}

function TimelineItem({ title, date, isCompleted, isLast = false }: TimelineItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full ${isCompleted ? 'bg-primary' : 'border-2 border-muted-foreground bg-background'}`} />
        {!isLast && (
          <div className={`h-full w-0.5 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
        )}
      </div>
      <div className="pb-4">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}
