import { useNavigate } from 'react-router-dom';
import { useTraining } from '@/contexts/TrainingContext';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, CheckCircle, PlayCircle, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Training() {
  const { trainings, notStartedCount, inProgressCount, completedCount, isLoading } = useTraining();
  const navigate = useNavigate();

  const stats = [
    { 
      label: 'Not Started', 
      count: notStartedCount, 
      icon: Clock, 
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    { 
      label: 'In Progress', 
      count: inProgressCount, 
      icon: PlayCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    { 
      label: 'Completed', 
      count: completedCount, 
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
  ];

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const getDaysRemaining = (dueDate: Date) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">My Training</h1>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="p-3 text-center">
                <div className={cn("mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.count}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Training List with Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="not_started">New</TabsTrigger>
            <TabsTrigger value="in_progress">Active</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
          </TabsList>

          {['all', 'not_started', 'in_progress', 'completed'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {trainings
                .filter(t => tab === 'all' || t.status === tab)
                .map((training) => {
                  const progress = getProgressPercentage(training.completedLessons, training.totalLessons);
                  const daysRemaining = getDaysRemaining(training.dueDate);
                  
                  return (
                    <Card 
                      key={training.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => navigate(`/training/${training.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                {training.category}
                              </span>
                              <TrainingStatusBadge status={training.status} />
                            </div>
                            
                            <h3 className="mb-1 font-semibold text-foreground line-clamp-1">
                              {training.title}
                            </h3>
                            
                            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                              {training.description}
                            </p>

                            {/* Progress Bar */}
                            <div className="mb-2">
                              <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {training.completedLessons} of {training.totalLessons} lessons
                                </span>
                                <span className="font-medium text-foreground">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>

                            {/* Due Date */}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {training.status === 'completed' ? (
                                <span>Completed {training.completedAt?.toLocaleDateString()}</span>
                              ) : daysRemaining < 0 ? (
                                <span className="text-destructive">Overdue by {Math.abs(daysRemaining)} days</span>
                              ) : daysRemaining === 0 ? (
                                <span className="text-amber-600 dark:text-amber-400">Due today</span>
                              ) : (
                                <span>{daysRemaining} days remaining</span>
                              )}
                            </div>
                          </div>
                          
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-6" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

              {trainings.filter(t => tab === 'all' || t.status === tab).length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No trainings found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
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
