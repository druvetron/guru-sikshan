import { cn } from '@/lib/utils';
import { IssueStatus } from '@/contexts/FeedbackContext';

const statusConfig: Record<IssueStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  in_review: {
    label: 'In Review',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive',
  },
};

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
