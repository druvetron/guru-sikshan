import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedback } from '@/contexts/FeedbackContext';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Clock, Eye, CheckCircle, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { teacher } = useAuth();
  const { pendingCount, inReviewCount, resolvedCount, feedbacks } = useFeedback();
  const navigate = useNavigate();

  const recentFeedbacks = feedbacks.slice(0, 3);

  const stats = [
    { 
      label: 'Pending', 
      count: pendingCount, 
      icon: Clock, 
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    { 
      label: 'In Review', 
      count: inReviewCount, 
      icon: Eye,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    { 
      label: 'Resolved', 
      count: resolvedCount, 
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
  ];

  return (
    <MobileLayout>
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold text-foreground">{teacher?.name}</h1>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{teacher?.cluster}</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={() => navigate('/report')} 
          className="mb-6 w-full gap-2" 
          size="lg"
        >
          <PlusCircle className="h-5 w-5" />
          Report an Issue
        </Button>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="p-3 text-center">
                <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.count}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        {recentFeedbacks.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Recent Activity</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/history')}
                className="text-primary"
              >
                View all
              </Button>
            </div>

            <div className="space-y-3">
              {recentFeedbacks.map((feedback) => (
                <Card 
                  key={feedback.id} 
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => navigate(`/feedback/${feedback.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-sm font-medium capitalize text-foreground">
                          {feedback.category.replace('_', ' ')} Issue
                        </p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {feedback.description}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {feedback.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <StatusIndicator status={feedback.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {feedbacks.length === 0 && (
          <Card className="mt-8">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <PlusCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">No issues reported yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Start by reporting your first issue
              </p>
              <Button onClick={() => navigate('/report')}>
                Report an Issue
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const config = {
    pending: { color: 'bg-amber-500', label: 'Pending' },
    in_review: { color: 'bg-blue-500', label: 'In Review' },
    resolved: { color: 'bg-emerald-500', label: 'Resolved' },
    rejected: { color: 'bg-destructive', label: 'Rejected' },
  }[status] || { color: 'bg-muted', label: status };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2 w-2 rounded-full ${config.color}`} />
      <span className="text-xs text-muted-foreground">{config.label}</span>
    </div>
  );
}
