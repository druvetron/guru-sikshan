import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTraining } from '@/contexts/TrainingContext';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Clock, 
  Download, 
  FileText, 
  Video, 
  Presentation,
  Star,
  CheckCircle,
  PlayCircle,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TrainingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTrainingById, updateProgress, submitTrainingFeedback, getFeedbackByTrainingId } = useTraining();
  
  const training = getTrainingById(id || '');
  const existingFeedback = getFeedbackByTrainingId(id || '');
  
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!training) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex h-screen flex-col items-center justify-center p-4">
          <BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">Training not found</h2>
          <Button onClick={() => navigate('/training')}>Back to Training</Button>
        </div>
      </MobileLayout>
    );
  }

  const progress = Math.round((training.completedLessons / training.totalLessons) * 100);
  const daysRemaining = Math.ceil((training.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const handleMarkLesson = (increment: boolean) => {
    const newCount = increment 
      ? Math.min(training.completedLessons + 1, training.totalLessons)
      : Math.max(training.completedLessons - 1, 0);
    updateProgress(training.id, newCount);
    
    if (newCount === training.totalLessons) {
      toast({
        title: "Training Completed! 🎉",
        description: "Congratulations! Please provide your feedback.",
      });
    }
  };

  const handleDownload = (material: { name: string }) => {
    toast({
      title: "Download Started",
      description: `Downloading ${material.name}...`,
    });
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTrainingFeedback(training.id, rating, comment);
      setFeedbackOpen(false);
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'video':
        return Video;
      case 'presentation':
        return Presentation;
      default:
        return FileText;
    }
  };

  return (
    <MobileLayout showNav={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/training')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-foreground line-clamp-1">Training Details</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Training Info */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {training.category}
                </span>
                <TrainingStatusBadge status={training.status} />
              </div>
              
              <h2 className="mb-2 text-xl font-bold text-foreground">{training.title}</h2>
              <p className="mb-4 text-sm text-muted-foreground">{training.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Assigned: {training.assignedAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {training.status === 'completed' ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Completed</span>
                  ) : daysRemaining < 0 ? (
                    <span className="text-destructive">Overdue</span>
                  ) : (
                    <span>{daysRemaining} days left</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <PlayCircle className="h-4 w-4" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {training.completedLessons} of {training.totalLessons} lessons completed
                  </span>
                  <span className="text-sm font-bold text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              {training.status !== 'completed' && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMarkLesson(false)}
                    disabled={training.completedLessons === 0}
                    className="flex-1"
                  >
                    Undo Lesson
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleMarkLesson(true)}
                    disabled={training.completedLessons === training.totalLessons}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Lesson
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Materials */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Download className="h-4 w-4" />
                Training Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-0">
              {training.materials.map((material, index) => {
                const Icon = getMaterialIcon(material.type);
                return (
                  <div key={material.id}>
                    {index > 0 && <Separator />}
                    <button
                      onClick={() => handleDownload(material)}
                      className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{material.name}</p>
                        <p className="text-xs text-muted-foreground">{material.size}</p>
                      </div>
                      <Download className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Feedback Section */}
          {training.status === 'completed' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                {existingFeedback ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={cn(
                            "h-5 w-5",
                            star <= existingFeedback.rating 
                              ? "fill-amber-400 text-amber-400" 
                              : "text-muted"
                          )}
                        />
                      ))}
                    </div>
                    {existingFeedback.comment && (
                      <p className="text-sm text-muted-foreground">{existingFeedback.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Submitted on {existingFeedback.submittedAt.toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Star className="mr-2 h-4 w-4" />
                        Provide Feedback
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rate this Training</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star 
                                  className={cn(
                                    "h-8 w-8",
                                    star <= rating 
                                      ? "fill-amber-400 text-amber-400" 
                                      : "text-muted hover:text-amber-200"
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="comment">Comments (Optional)</Label>
                          <Textarea
                            id="comment"
                            placeholder="Share your thoughts about this training..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                          />
                        </div>

                        <Button 
                          onClick={handleSubmitFeedback} 
                          disabled={isSubmitting}
                          className="w-full"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

function TrainingStatusBadge({ status }: { status: string }) {
  const config = {
    not_started: { color: 'bg-muted text-muted-foreground', label: 'Not Started' },
    in_progress: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'In Progress' },
    completed: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Completed' },
  }[status] || { color: 'bg-muted text-muted-foreground', label: status };

  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", config.color)}>
      {config.label}
    </span>
  );
}
