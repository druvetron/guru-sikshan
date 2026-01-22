import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // ✅ Added useSearchParams
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, Languages, FileText, CheckCircle, Play, 
  Download, BookOpen, FileDigit 
} from 'lucide-react';

// 🌍 DEMO CONTENT (Simulating your Supabase content)
const MODULE_CONTENT = {
  en: {
    title: "Classroom Management Basics",
    full: "To manage a noisy classroom effectively, start by establishing clear ground rules. Do not shout over the students; instead, use a specific signal (like raising your hand) to ask for silence. Consistency is key—enforce the rules every single time. Arrange desks in a way that minimizes distraction and allows you to move freely among the students.",
    summary: "• Set clear rules immediately.\n• Use non-verbal signals for silence.\n• Be consistent with enforcement.\n• Arrange desks to reduce distractions.",
    pdfName: "Classroom_Guide_v1.pdf"
  },
  hi: {
    title: "कक्षा प्रबंधन की मूल बातें",
    full: "शोरगुल वाली कक्षा को प्रभावी ढंग से प्रबंधित करने के लिए, स्पष्ट नियम बनाकर शुरुआत करें। छात्रों पर चिल्लाएं नहीं; इसके बजाय, शांति की मांग करने के लिए एक विशिष्ट संकेत (जैसे अपना हाथ उठाना) का उपयोग करें। निरंतरता महत्वपूर्ण है—हर बार नियमों का पालन करें। डेस्क को इस तरह से व्यवस्थित करें जिससे ध्यान भटकना कम हो।",
    summary: "• तुरंत स्पष्ट नियम निर्धारित करें।\n• शांति के लिए गैर-मौखिक संकेतों का उपयोग करें।\n• नियमों का पालन सख्ती से करें।\n• ध्यान भटकने से बचाने के लिए डेस्क व्यवस्थित करें।",
    pdfName: "Kaksha_Prabandhan_Guide.pdf"
  },
  bn: {
    title: "শ্রেণীকক্ষ ব্যবস্থাপনার মূল বিষয়",
    full: "একটি কোলাহলপূর্ণ শ্রেণীকক্ষ কার্যকরভাবে পরিচালনা করতে, স্পষ্ট নিয়ম তৈরির মাধ্যমে শুরু করুন। শিক্ষার্থীদের ওপর চিৎকার করবেন না; তার পরিবর্তে, নীরবতার জন্য একটি নির্দিষ্ট সংকেত (যেমন হাত তোলা) ব্যবহার করুন। ধারাবাহিকতা চাবিকাঠি—প্রতিবার নিয়মগুলি প্রয়োগ করুন। ডেস্কগুলো এমনভাবে সাজান যাতে মনোযোগ কম বিচ্ছিন্ন হয়।",
    summary: "• অবিলম্বে স্পষ্ট নিয়ম নির্ধারণ করুন।\n• নীরবতার জন্য অমৌখিক সংকেত ব্যবহার করুন।\n• নিয়ম প্রয়োগে ধারাবাহিক হন।\n• বিভ্রান্তি কমাতে ডেস্ক সাজান।",
    pdfName: "Classroom_Guide_Bengali.pdf"
  }
};

export default function TrainingPlayer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // ✅ Get Query Params
  const feedbackId = searchParams.get('feedbackId'); // ✅ Extract ID

  const [language, setLanguage] = useState<'en' | 'hi' | 'bn'>('en');
  const [isSummarized, setIsSummarized] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Get current text based on selection
  const currentContent = MODULE_CONTENT[language];
  const displayText = isSummarized ? currentContent.summary : currentContent.full;

  return (
    <MobileLayout>
      <div className="flex flex-col h-[calc(100vh-60px)] bg-background">
        
        {/* Top Bar: Navigation & Controls */}
        <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-black/20 sticky top-0 z-10">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-2">
            {/* Summarize Toggle */}
            <Button 
              variant={isSummarized ? "default" : "outline"} 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => setIsSummarized(!isSummarized)}
            >
              <FileDigit className="h-3 w-3 mr-1" />
              {isSummarized ? "Full Text" : "Summarize"}
            </Button>

            {/* Language Switcher */}
            <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
              <SelectTrigger className="h-8 w-[100px] text-xs">
                <Languages className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="bn">Bengali</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 🎬 1. VIDEO SECTION */}
        <div className="w-full aspect-video bg-black flex items-center justify-center relative group cursor-pointer">
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
          <Play className="h-12 w-12 text-white opacity-80 group-hover:scale-110 transition-transform" fill="currentColor" />
          <span className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
            Video: 10:00
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Title */}
          <h1 className="text-xl font-bold text-foreground">
            {currentContent.title}
          </h1>

          {/* 📄 2. TEXT CONTENT (Summary/Full) */}
          <Card className="border-none shadow-sm bg-muted/30">
            <CardContent className="p-4">
              <p className="text-base leading-relaxed whitespace-pre-line text-foreground/90">
                {displayText}
              </p>
            </CardContent>
          </Card>

          {/* 📚 3. RESOURCES SECTION (PDF) */}
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Learning Materials
            </h3>
            
            <Card className="border border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/10">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-white flex items-center justify-center shadow-sm text-red-500">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{currentContent.pdfName}</p>
                    <p className="text-xs text-muted-foreground">PDF Guide • 2.4 MB</p>
                  </div>
                </div>
                
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                  <Download className="h-4 w-4 text-blue-600" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="p-4 border-t bg-white dark:bg-black/20">
          <Button 
            className={`w-full h-12 text-lg transition-all ${isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-primary'}`}
            onClick={() => {
              setIsCompleted(true);
              // 🚀 1. Mark complete, then 2. Redirect to Rating Page
              setTimeout(() => {
                navigate(feedbackId ? `/training/feedback/${feedbackId}` : '/dashboard');
              }, 500);
            }}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Training Completed
              </>
            ) : (
              "Mark as Complete"
            )}
          </Button>
        </div>

      </div>
    </MobileLayout>
  );
}