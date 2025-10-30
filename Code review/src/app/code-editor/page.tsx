'use client';

import Editor, { Monaco } from '@monaco-editor/react';
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Languages,
  Loader2,
  Save,
  ScanEye,
  SidebarClose,
  SidebarOpen,
} from 'lucide-react';
import * as React from 'react';

import { detectLanguage } from '@/ai/flows/detect-language-flow';
import { getReviewById, saveCode, markReviewAsComplete, markReviewAsInProgress, performSmartAnalysis, getCurrentUser } from '@/lib/actions';
import type { SmartAnalysisResult } from '@/lib/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import type { editor } from 'monaco-editor';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import type { Review, UserProfile } from '@/lib/definitions';
import { useActionState } from 'react';

const languages = [
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'React (JSX)' },
  { value: 'tsx', label: 'React (TSX)' },
];

function CodeEditorCore() {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get('reviewId');

  const [review, setReview] = React.useState<Review | null>(null);
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [code, setCode] = React.useState('');
  const [language, setLanguage] = React.useState('javascript');
  const [analysisResult, setAnalysisResult] = React.useState<SmartAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaveEnabled, setIsSaveEnabled] = React.useState(false);
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = React.useRef<Monaco | null>(null);
  const { toast } = useToast();

  const [saveState, saveAction, isSaving] = useActionState(saveCode, { message: "", success: false });
  const [conflictDetected, setConflictDetected] = React.useState(false);

  React.useEffect(() => {
    if (!reviewId) {
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No review ID provided. Please go back and select a review to edit.',
      });
      return;
    }

    async function fetchReview() {
      setIsLoading(true);
      try {
        const [fetchedReview, fetchedUser] = await Promise.all([
          getReviewById(reviewId!),
          getCurrentUser()
        ]);
        
        console.log('Fetched user:', fetchedUser); // Debug log
        console.log('Fetched review:', fetchedReview); // Debug log
        console.log('Reviewers:', fetchedReview?.reviewers); // Debug log
        
        if (fetchedReview) {
          setReview(fetchedReview);
          setUser(fetchedUser);
          setCode(fetchedReview.currentCode || '');
          setLanguage(fetchedReview.language);

          // Smart Save Logic: Disable save by default if it's an existing review with code.
          // If it's a new review (no code), enable save.
          if (!fetchedReview.currentCode) {
            setIsSaveEnabled(true);
          } else {
            setIsSaveEnabled(false);
          }
          
          if (fetchedReview.status === 'Completed') {
            await markReviewAsInProgress(reviewId!);
            toast({
              title: 'Review Re-opened',
              description: 'This review is now "In Progress" since you started editing it.',
            });
            setReview(prev => prev ? { ...prev, status: 'In Progress' } : null);
          }
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: `Could not find a review with ID: ${reviewId}`,
          });
        }
      } catch (error) {
        console.error('Error fetching review:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load the review. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchReview();
  }, [reviewId, toast]);

  const parsedAnalysis = React.useMemo(() => {
    if (!analysisResult) return [];

    const items: string[] = [];

    if (analysisResult.message) {
      const variant = analysisResult.success ? 'text-emerald-400' : 'text-rose-400';
      items.push(`<p class="font-medium ${variant}">${analysisResult.message}</p>`);
    }

    // Always show metrics if they are available (and not N/A), regardless of success flag
    if (analysisResult.newMetrics?.time !== 'N/A' && analysisResult.newMetrics) {
        const { newMetrics, savedMetrics } = analysisResult;
        
        if (savedMetrics) {
            const metricsHtml = `
                <div class="grid grid-cols-3 gap-x-3 gap-y-2 text-xs mt-3 p-3 bg-[#1a1a2e] rounded-lg border border-[#2d2d44]">
                    <div class="font-semibold text-[#a0a0c0]">Metric</div><div class="font-semibold text-right text-[#a0a0c0]">Current</div><div class="font-semibold text-right text-[#a0a0c0]">Last Saved</div>
                    <div class="text-[#c0c0e0]">Time Complexity</div><div class="text-right font-mono">${newMetrics.time}</div><div class="text-right font-mono">${savedMetrics.time}</div>
                    <div class="text-[#c0c0e0]">Space Complexity</div><div class="text-right font-mono">${newMetrics.space}</div><div class="text-right font-mono">${savedMetrics.space}</div>
                    <div class="text-[#c0c0e0]">LOC</div><div class="text-right font-mono">${newMetrics.loc}</div><div class="text-right font-mono">${savedMetrics.loc}</div>
                </div>`;
            items.push(metricsHtml);
        } else {
            // Case for initial analysis where there's no saved baseline
            const metricsHtml = `<ul class="space-y-1 mt-2"><li class="flex justify-between"><span class="text-[#c0c0e0]">Time Complexity:</span> <span class="font-mono">${newMetrics.time}</span></li><li class="flex justify-between"><span class="text-[#c0c0e0]">Space Complexity:</span> <span class="font-mono">${newMetrics.space}</span></li><li class="flex justify-between"><span class="text-[#c0c0e0]">LOC:</span> <span class="font-mono">${newMetrics.loc}</span></li></ul>`;
            items.push(metricsHtml);
        }
    }
    
    if (analysisResult.analysis) {
        // Parse list items without using the 's' flag
        const listItems = analysisResult.analysis.match(/<li[^>]*>(.*?)<\/li>/g);
        
        if (listItems) {
          // If we found list items, push them into our items array to be rendered.
          // Prepend with <ul> to ensure it's a list, and join them.
          items.push(`<ul class="mt-3 space-y-2">${listItems.join('')}</ul>`);
        } else {
          // If no list items were found, it might be a simple string. Wrap it in a list.
          items.push(`<ul class="mt-3"><li>${analysisResult.analysis}</li></ul>`);
        }
    }
    
    return items;

  }, [analysisResult]);


  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set theme
    monaco.editor.setTheme('vs-dark');
  }

  const handleAnalyzeCode = async () => {
    if (!reviewId) return;

    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if(model) {
        const markers = monacoRef.current.editor.getModelMarkers({ resource: model.uri });
        const hasErrors = markers.some(m => m.severity === monacoRef.current!.MarkerSeverity.Error);
        if (hasErrors) {
          toast({
            variant: 'destructive',
            title: 'Syntax Errors Found',
            description: 'Please fix the errors in your code before analyzing.',
          });
          setAnalysisResult(null);
          setIsSaveEnabled(false);
          return;
        }
      }
    }


    setIsAnalyzing(true);
    setAnalysisResult(null);
    // Always disable save button on new analysis
    setIsSaveEnabled(false); 
    setConflictDetected(false); // Reset conflict detection on new analysis
    try {
      const result = await performSmartAnalysis(reviewId, code, language);
      setAnalysisResult(result);

      // Only enable save if analysis is successful and there are no syntax errors from AI
      if (result.success && result.newMetrics?.time !== 'N/A') {
        setIsSaveEnabled(true);
        // Show a toast to inform the user they can now save
        toast({
          title: 'Ready to Save',
          description: 'Analysis complete. Click the Save button to save your code.',
          variant: 'default',
        });
      } else {
        // Show error message if analysis failed
        toast({
          title: 'Analysis Issues Found',
          description: 'Please address the issues shown in the analysis before saving.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setAnalysisResult({ success: false, message: `Error: Unable to analyze code. ${errorMessage}` });
       toast({
        title: 'Analysis Error',
        description: `An unexpected error occurred: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDetectLanguage = async () => {
    setIsDetecting(true);
    toast({
      title: 'Detecting Language...',
      description: 'The AI is analyzing your code.',
    });

    try {
      const result = await detectLanguage({ code });
      const detectedValue = result.language;
      const detectedLang = languages.find(l => l.value === detectedValue);

      if (detectedLang) {
        setLanguage(detectedValue);
        toast({
          title: 'Language Detected!',
          description: `Editor language changed to ${detectedLang.label}.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Detection Failed',
          description: `Could not detect a supported language. Detected: ${detectedValue}`,
        });
        console.warn(`Detected language "${detectedValue}" is not supported.`);
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to detect language.',
      });
      console.error('Error detecting language:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
    // Any change to the code should require a new analysis
    if (isSaveEnabled && review?.currentCode) {
      setIsSaveEnabled(false);
      setAnalysisResult(null);
    }
  };

  const handleSave = () => {
    if (reviewId) {
      const formData = new FormData();
      formData.append('reviewId', reviewId);
      formData.append('code', code);
      saveAction(formData);
    }
  };
  
  React.useEffect(() => {
    if (saveState.message) {
      toast({
        title: saveState.success ? "Success" : "Error",
        description: saveState.message,
        variant: saveState.success ? "default" : "destructive",
      });
      if (saveState.success) {
        // After a successful save, disable the button again to enforce the workflow
        setIsSaveEnabled(false);
        setAnalysisResult(null);
        setConflictDetected(false);
      } else if (saveState.message.includes("The code was modified by another user")) {
        // If we get a conflict error, disable the save button and set conflict flag
        setIsSaveEnabled(false);
        setConflictDetected(true);
        setAnalysisResult(null);
      }
    }
  }, [saveState, toast]);

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#060010] text-gray-200">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#7278F2] mx-auto mb-4"/>
        <h2 className="text-xl font-semibold text-white">Loading Review...</h2>
        <p className="text-gray-400 mt-2">Preparing your code review environment</p>
      </div>
    </div>
  }

  if (!reviewId || !review) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#060010] text-gray-200">
      <div className="text-center max-w-md p-6 rounded-xl bg-[#0D0716] border border-[#1F1A28]">
        <div className="mx-auto bg-[#7278F2]/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <FileCheck className="h-8 w-8 text-[#7278F2]" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-white">Review not found</h2>
        <p className="text-gray-400 mb-6">Please select a review from the code review dashboard.</p>
        <Button asChild className="bg-[#7278F2] hover:bg-[#7278F2]/90 text-white rounded-lg px-6 py-2 transition-all border border-[#7278F2]">
          <Link href="/code-review">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  }

  const markCompleteAction = markReviewAsInProgress.bind(null, reviewId);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full flex-col bg-[#060010] text-gray-200">
        {/* Top Navigation Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between px-4 bg-[#0D0716] border-b border-[#1F1A28] shadow-lg p-8 mb-2"> 
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hover:bg-[#1a1a2e] rounded-lg text-gray-200">
              <Link href="/code-review">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6 bg-[#1F1A28]" />
            <h1 className="text-lg font-semibold text-white truncate max-w-md">{review.title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDetectLanguage} 
              disabled={isDetecting}
              className="border border-[#1F1A28] bg-primary text-white hover:bg-[#1a1a2e] rounded-sm gap-2 p-1.5"
            >
              {isDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />} 
              <span className="hidden sm:inline">Detect Language</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border border-[#1F1A28] bg-white text-black hover:bg-[#1a1a2e] rounded-sm gap-2">
                  <span className="hidden sm:inline">{languages.find(l => l.value === language)?.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-[#060010] border border-[#1F1A28] text-white rounded-lg mt-1"
              >
                {languages.map(lang => (
                  <DropdownMenuItem
                    key={lang.value}
                    onClick={() => setLanguage(lang.value)}
                    className="text-white py-2 focus:bg-[#1a1a2e] hover:bg-[#1a1a2e]"
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAnalyzeCode} 
              disabled={isAnalyzing}
              className="border border-[#1F1A28] bg-dark text-white hover:bg-[#1a1a2e] rounded-sm gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ScanEye className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Analyze</span>
            </Button>
            
            <Separator orientation="vertical" className="h-6 bg-[#1F1A28]" />

            <form action={handleSave}>
              <Button 
                variant="outline" 
                size="sm" 
                type="submit" 
                disabled={isSaving || !isSaveEnabled || conflictDetected}
                className={`gap-2 rounded-lg border ${
                  isSaveEnabled && !conflictDetected
                    ? 'border-emerald-400/50 bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/30' 
                    : 'border-[#1F1A28] bg-[#060010] text-gray-400 hover:bg-[#1a1a2e]'
                }`}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span className="hidden sm:inline">
                  {conflictDetected ? "Conflict - Re-analyze Required" : "Save"}
                </span>
              </Button>
            </form>
            
            <form action={markReviewAsComplete.bind(null, reviewId!)}>
              <Button 
                variant="default" 
                size="sm" 
                type="submit" 
                className="bg-[#7278F2] hover:bg-[#7278F2]/90 text-white rounded-lg gap-2 px-4 transition-all border border-[#7278F2]"
              >
                <FileCheck className="h-4 w-4" /> 
                <span className="hidden sm:inline">Mark as Complete</span>
              </Button>
            </form>

            <Separator orientation="vertical" className="h-6 bg-[#1F1A28]" />

            {/* User Avatars with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center -space-x-2 ml-2 cursor-pointer">
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="h-8 w-8 border-2 border-[#1F1A28] hover:border-[#7278F2] transition-all">
                        {user?.avatarUrl ? (
                          <AvatarImage 
                            src={user.avatarUrl} 
                            alt={user.name || "User avatar"}
                          />
                        ) : (
                          <AvatarFallback className="bg-[#7278F2] text-white">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#060010] border border-[#1F1A28] text-white rounded-lg">
                      {user?.name || 'You'} (You)
                    </TooltipContent>
                  </Tooltip>
                  {/* Show all contributors including the current user */}
                  {review.reviewers.slice(0, 2).map((reviewer) => (
                    <Tooltip key={reviewer.id}>
                      <TooltipTrigger>
                        <Avatar className="h-8 w-8 border-2 border-[#1F1A28] hover:border-[#7278F2] transition-all">
                          {reviewer.image ? (
                            <AvatarImage 
                              src={reviewer.image} 
                              alt={reviewer.name || "Contributor avatar"}
                            />
                          ) : (
                            <AvatarFallback className="bg-[#1a1a2e] text-white">
                              {reviewer.name ? reviewer.name.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#060010] border border-[#1F1A28] text-white rounded-lg">
                        {reviewer.name}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {/* Show count if there are more than 2 other contributors */}
                  {review.reviewers.length > 2 && (
                    <Avatar className="h-8 w-8 border-2 border-[#1F1A28] bg-[#0D0716] text-white text-xs flex items-center justify-center">
                      +{review.reviewers.length - 2}
                    </Avatar>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-[#060010] border border-[#1F1A28] text-white rounded-lg mt-1 min-w-[200px]"
              >
                <DropdownMenuLabel className="text-gray-300">Viewing this review</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#1F1A28]" />
                <DropdownMenuItem className="py-2 focus:bg-[#1a1a2e]">
                  <Avatar className="h-6 w-6 mr-2">
                    {user?.avatarUrl ? (
                      <AvatarImage 
                        src={user.avatarUrl} 
                        alt={user.name || "User avatar"}
                      />
                    ) : (
                      <AvatarFallback className="bg-[#7278F2] text-white text-xs">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>{user?.name || 'You'} (You)</span>
                </DropdownMenuItem>
                {/* Show all contributors including the current user */}
                {review.reviewers.map((reviewer) => (
                  <DropdownMenuItem key={reviewer.id} className="py-2 focus:bg-[#1a1a2e]">
                    <Avatar className="h-6 w-6 mr-2">
                      {reviewer.image ? (
                        <AvatarImage 
                          src={reviewer.image} 
                          alt={reviewer.name || "Contributor avatar"}
                        />
                      ) : (
                        <AvatarFallback className="bg-[#1a1a2e] text-white text-xs">
                          {reviewer.name ? reviewer.name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span>{reviewer.name}</span>
                  </DropdownMenuItem>
                ))}
                {/* Show message if there are no contributors */}
                {review.reviewers.length === 0 && (
                  <DropdownMenuItem className="py-2 text-gray-400" disabled>
                    No contributors yet
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Code Editor */}
          <main className="flex-1 flex flex-col bg-[#060010]">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{ 
                minimap: { enabled: false }, 
                scrollBeyondLastLine: false,
                fontFamily: 'Fira Code, monospace',
                fontSize: 14,
                lineHeight: 24,
                automaticLayout: true,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                fontLigatures: true,
              }}
            />
          </main>
          
          {/* Sidebar */}
          <aside className="flex flex-col bg-[#0D0716] border-l border-[#1F1A28] w-96">
            <div className="flex h-12 items-center px-3 bg-[#060010] border-b border-[#1F1A28]">
              <span className="font-medium text-sm text-gray-300">
                Diagnostics
              </span>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4">
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-gray-300 hover:bg-[#060010] rounded-lg p-2 transition-all">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-90 text-[#7278F2]" />
                      <Bot className="h-4 w-4 text-[#7278F2]" />
                      <span>AI Code Analysis</span>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="py-3 pl-2 pr-1">
                    {isAnalyzing && (
                      <div className="flex items-center gap-3 text-sm text-gray-400 p-3 bg-[#060010] rounded-lg border border-[#1F1A28]">
                        <Loader2 className="h-5 w-5 animate-spin text-[#7278F2]" />
                        <span>Analyzing your code...</span>
                      </div>
                    )}
                    
                    {parsedAnalysis.length > 0 && !isAnalyzing && (
                      <div className="space-y-4 text-sm text-gray-300">
                        {parsedAnalysis.map((point, index) => (
                          <div 
                            key={index} 
                            className="prose prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_p]:leading-relaxed [&_ul]:space-y-2 bg-[#060010] p-4 rounded-lg border border-[#1F1A28]"
                            dangerouslySetInnerHTML={{ __html: point }}
                          >
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!analysisResult && !isAnalyzing && (
                      <div className="text-sm text-gray-400 p-4 text-center bg-[#060010] rounded-lg border border-[#1F1A28]">
                        <div className="flex flex-col items-center gap-3">
                          <Bot className="h-8 w-8 text-[#7278F2]/50" />
                          <p>Click "Analyze" to run Smart Save analysis on your code.</p>
                          <p className="text-xs text-gray-500 mt-2">AI will check for improvements in complexity and code quality.</p>
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </ScrollArea>
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function CodeEditorPage() {
  return (
    <React.Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#0f0c29] to-[#302b63] text-gray-200"><Loader2 className="h-12 w-12 animate-spin text-[#7278F2]"/></div>}>
      <CodeEditorCore />
    </React.Suspense>
  )
}