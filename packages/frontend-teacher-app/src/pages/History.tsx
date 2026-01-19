import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedback, IssueStatus } from '@/contexts/FeedbackContext';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { CategoryBadge } from '@/components/ui/category-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Filter, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const statusFilters: { value: IssueStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function History() {
  const { feedbacks, isLoading } = useFeedback();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');

  const filteredFeedbacks = feedbacks.filter(
    (f) => statusFilter === 'all' || f.status === statusFilter
  );

  return (
    <MobileLayout>
      <div className="px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Feedback</h1>
          <span className="text-sm text-muted-foreground">
            {filteredFeedbacks.length} issue{filteredFeedbacks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filter */}
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as IssueStatus | 'all')}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="mt-2 h-3 w-full rounded bg-muted" />
                  <div className="mt-1 h-3 w-2/3 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredFeedbacks.length > 0 ? (
          <div className="space-y-3">
            {filteredFeedbacks.map((feedback) => (
              <Card 
                key={feedback.id}
                className="cursor-pointer transition-all hover:bg-muted/50 hover:shadow-md"
                onClick={() => navigate(`/feedback/${feedback.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <CategoryBadge category={feedback.category} />
                        <StatusBadge status={feedback.status} />
                      </div>
                      
                      <p className="line-clamp-2 text-sm text-foreground">
                        {feedback.description}
                      </p>
                      
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{feedback.cluster}</span>
                        <span>•</span>
                        <span>{format(feedback.createdAt, 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-8">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">
                {statusFilter === 'all' ? 'No feedback yet' : 'No matching feedback'}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {statusFilter === 'all' 
                  ? 'Start by reporting your first issue'
                  : 'Try changing the filter to see more results'}
              </p>
              {statusFilter === 'all' && (
                <Button onClick={() => navigate('/report')}>
                  Report an Issue
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}
