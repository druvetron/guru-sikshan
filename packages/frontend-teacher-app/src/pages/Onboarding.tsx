import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Send, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const slides = [
  {
    icon: MessageSquare,
    title: 'Report Issues Easily',
    description: 'Submit feedback about any school-related issues directly from your phone. Academic, infrastructure, safety – we\'ve got you covered.',
    color: 'bg-primary',
  },
  {
    icon: Send,
    title: 'Track Your Submissions',
    description: 'Stay informed about the status of your reported issues. Get updates when your feedback is being reviewed or resolved.',
    color: 'bg-blue-500',
  },
  {
    icon: Clock,
    title: 'Real-time Updates',
    description: 'Receive notifications when there are updates on your submitted feedback. No more wondering about the status.',
    color: 'bg-amber-500',
  },
  {
    icon: CheckCircle,
    title: 'See Results',
    description: 'View resolution details and admin remarks. Your voice matters and leads to real improvements in the school.',
    color: 'bg-emerald-500',
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate('/dashboard');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="flex min-h-screen flex-col bg-background px-4 py-8">
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          onClick={handleSkip}
          className="text-muted-foreground"
        >
          Skip
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className={cn(
          "mb-8 flex h-24 w-24 items-center justify-center rounded-3xl transition-colors duration-300",
          slide.color
        )}>
          <Icon className="h-12 w-12 text-white" />
        </div>

        <Card className="w-full max-w-sm border-0 bg-transparent shadow-none">
          <CardContent className="text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground">
              {slide.title}
            </h2>
            <p className="text-muted-foreground">
              {slide.description}
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentSlide 
                  ? "w-8 bg-primary" 
                  : "w-2 bg-muted hover:bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Button 
          onClick={handleNext} 
          className="w-full" 
          size="lg"
        >
          {currentSlide < slides.length - 1 ? (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            'Get Started'
          )}
        </Button>
      </div>
    </div>
  );
}
