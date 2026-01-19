import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedback, IssueCategory } from '@/contexts/FeedbackContext';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Paperclip } from 'lucide-react';

const categories: { value: IssueCategory; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'safety', label: 'Safety' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' },
];

const clusters = [
  'North District',
  'South District',
  'East District',
  'West District',
  'Central District',
];

export default function ReportIssue() {
  const { teacher } = useAuth();
  const { submitFeedback } = useFeedback();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [category, setCategory] = useState<IssueCategory | ''>('');
  const [cluster, setCluster] = useState(teacher?.cluster || '');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ category?: string; description?: string }>({});

  const validate = () => {
    const newErrors: { category?: string; description?: string } = {};
    
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!description) {
      newErrors.description = 'Description is required';
    } else if (description.length < 20) {
      newErrors.description = 'Please provide at least 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !teacher) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await submitFeedback({
        teacherId: teacher.id,
        cluster,
        category: category as IssueCategory,
        description,
      });
      
      if (success) {
        setIsSuccess(true);
        toast({
          title: "Issue reported successfully!",
          description: "You can track its status in the History tab.",
        });
        
        // Reset form after showing success
        setTimeout(() => {
          setCategory('');
          setDescription('');
          setIsSuccess(false);
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Failed to submit",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <MobileLayout>
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">Issue Reported!</h2>
          <p className="text-center text-muted-foreground">
            Your feedback has been submitted successfully.
          </p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Report an Issue</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Teacher Info (read-only) */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reporting as
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="font-medium text-foreground">{teacher?.name}</p>
              <p className="text-sm text-muted-foreground">{teacher?.employeeId}</p>
            </CardContent>
          </Card>

          {/* Cluster */}
          <div className="space-y-2">
            <Label htmlFor="cluster">Cluster</Label>
            <Select value={cluster} onValueChange={setCluster}>
              <SelectTrigger>
                <SelectValue placeholder="Select cluster" />
              </SelectTrigger>
              <SelectContent>
                {clusters.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Issue Category *</Label>
            <Select 
              value={category} 
              onValueChange={(value) => setCategory(value as IssueCategory)}
            >
              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description *
              <span className="ml-1 text-xs text-muted-foreground">
                ({description.length}/500)
              </span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail. Include location, when it started, and how it affects you or students..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={5}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Attachment placeholder */}
          <div className="space-y-2">
            <Label>Attachment (Coming soon)</Label>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full justify-start gap-2 text-muted-foreground"
              disabled
            >
              <Paperclip className="h-4 w-4" />
              Add photo or document
            </Button>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Issue'
            )}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
}
