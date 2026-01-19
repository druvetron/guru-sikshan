import { cn } from '@/lib/utils';
import { IssueCategory } from '@/contexts/FeedbackContext';
import { 
  GraduationCap, 
  Building2, 
  FileText, 
  ShieldAlert, 
  Wifi,
  HelpCircle 
} from 'lucide-react';

const categoryConfig: Record<IssueCategory, { label: string; icon: typeof GraduationCap; className: string }> = {
  academic: {
    label: 'Academic',
    icon: GraduationCap,
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  infrastructure: {
    label: 'Infrastructure',
    icon: Building2,
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  administrative: {
    label: 'Administrative',
    icon: FileText,
    className: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
  },
  safety: {
    label: 'Safety',
    icon: ShieldAlert,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  technology: {
    label: 'Technology',
    icon: Wifi,
    className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  },
  other: {
    label: 'Other',
    icon: HelpCircle,
    className: 'bg-muted text-muted-foreground',
  },
};

interface CategoryBadgeProps {
  category: IssueCategory;
  showIcon?: boolean;
  className?: string;
}

export function CategoryBadge({ category, showIcon = true, className }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
      config.className,
      className
    )}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
