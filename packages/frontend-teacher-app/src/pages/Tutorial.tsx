import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  MessageSquare, 
  Settings,
  CheckCircle,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: 'Welcome to TeacherVoice',
    description: 'Your platform for reporting school issues and tracking their resolution.',
    icon: Home,
    details: [
      'Report issues directly from your mobile device',
      'Track the status of your submitted reports',
      'Get updates when issues are resolved',
      'Access training materials assigned to you',
    ],
  },
  {
    id: 2,
    title: 'Reporting Issues',
    description: 'Learn how to submit and track school-related issues.',
    icon: FileText,
    details: [
      'Tap "Report an Issue" from the dashboard',
      'Select the appropriate category (Academic, Infrastructure, etc.)',
      'Provide a detailed description of the issue',
      'Submit and track your report in the History section',
    ],
  },
  {
    id: 3,
    title: 'Training Modules',
    description: 'Access and complete your assigned training materials.',
    icon: GraduationCap,
    details: [
      'View all assigned trainings in the Training tab',
      'Track your progress through each module',
      'Download training materials for offline access',
      'Provide feedback after completing a training',
    ],
  },
  {
    id: 4,
    title: 'Your History',
    description: 'Review all your submitted feedback and their current status.',
    icon: BookOpen,
    details: [
      'Filter reports by status (Pending, In Review, Resolved)',
      'View detailed information about each submission',
      'See admin remarks and responses',
      'Track the timeline of your reports',
    ],
  },
  {
    id: 5,
    title: 'Profile & Settings',
    description: 'Customize your experience and manage your profile.',
    icon: Settings,
    details: [
      'Update your personal information',
      'Toggle dark mode for comfortable viewing',
      'Manage notification preferences',
      'Access help and support resources',
    ],
  },
  {
    id: 6,
    title: 'Providing Feedback',
    description: 'Share your thoughts on completed trainings.',
    icon: MessageSquare,
    details: [
      'Complete a training module to unlock feedback',
      'Rate the training on a 5-star scale',
      'Add optional comments to help improve content',
      'Your feedback helps us create better trainings',
    ],
  },
];

export default function Tutorial() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    
    if (isLastStep) {
      navigate('/dashboard');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const StepIcon = step.icon;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip Tutorial
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} of {tutorialSteps.length}
          </span>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>
        <div className="px-4 pb-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Step Navigation Dots */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                index === currentStep 
                  ? "w-6 bg-primary" 
                  : completedSteps.includes(index)
                    ? "bg-primary/50"
                    : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <StepIcon className="h-10 w-10 text-primary" />
          </div>
          
          <h2 className="mb-3 text-2xl font-bold text-foreground">{step.title}</h2>
          <p className="mb-6 text-muted-foreground">{step.description}</p>
        </div>

        {/* Details Card */}
        <Card>
          <CardContent className="py-4">
            <ul className="space-y-3">
              {step.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur-sm">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext} className="flex-1">
            {isLastStep ? (
              <>
                Get Started
                <CheckCircle className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
