
'use client';

import * as React from 'react';
import { addComment, getCurrentUser, getReviewById } from '@/lib/actions';
import type { Comment, CommentWithAuthor, ReviewWithAuthor, UserProfile } from '@/lib/definitions';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  History,
  Code2,
  Copy,
  Download,
  GitMerge,
  Loader2,
  Code,
  Send,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Editor from '@monaco-editor/react';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

function CommentForm({ reviewId, user, onCommentAdded, onCommentPosted }: { reviewId: string; user: UserProfile | null; onCommentAdded: (newComment: Comment) => void; onCommentPosted: () => void; }) {
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    setIsSubmitting(true);

    // Create a proper Comment object that matches the schema
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      authorId: user.id || '',
      reviewId: reviewId,
      text: comment,
      timestamp: new Date().toISOString(),
    };

    try {
      onCommentAdded(optimisticComment);
      setComment('');
      onCommentPosted();
      
      await addComment(reviewId, comment);
      
      // The parent will handle the state update via refetch,
      // but we could also update the optimistic one with the real one if needed.
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
      });
      // Here you might want to remove the optimistic comment from the list
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-start space-x-4 p-4 bg-[#060010] border-t border-[#1F1A28] rounded-b-xl">
      <Avatar className="h-10 w-10 rounded-full">
        <AvatarImage src={user?.avatarUrl} />
        <AvatarFallback className="rounded-full bg-background-dark">{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full resize-none bg-background-dark border border-[#1F1A28] rounded-lg text-foreground placeholder:text-muted-foreground focus:border-[#7278F2] transition-colors"
          rows={3}
        />
        <div className="mt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCommentPosted} className="h-8 rounded-lg text-xs px-3 border border-[#1F1A28] bg-background-dark hover:bg-[#1a1a2e]">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!comment.trim() || isSubmitting} className="h-8 rounded-lg text-xs px-3 bg-[#7278F2] hover:bg-[#7278F2]/90 text-white">
              {isSubmitting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Send className="mr-2 h-3 w-3" />}
              Post
            </Button>
        </div>
      </div>
    </form>
  );
}


export default function ReviewDetailsPage() {
  const { id } = useParams();
  const [review, setReview] = React.useState<ReviewWithAuthor | null>(null);
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCommenting, setIsCommenting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (typeof id !== 'string') return;
    async function fetchReview() {
      setIsLoading(true);
      const [fetchedReview, fetchedUser] = await Promise.all([
        getReviewById(id as string),
        getCurrentUser()
      ]);
      setReview(fetchedReview);
      setUser(fetchedUser);
      setIsLoading(false);
    }
    fetchReview();
  }, [id]);

  const handleCopyCode = () => {
    if (review?.currentCode) {
      navigator.clipboard.writeText(review.currentCode);
      toast({ title: 'Success', description: 'Code copied to clipboard!' });
    }
  };

  const handleDownloadCode = () => {
    if (review?.currentCode) {
      const blob = new Blob([review.currentCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `review-${review.id}-${review.language}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Success', description: 'Code download started.' });
    }
  };
  
  const handleCommentAdded = (newComment: Comment) => {
    setReview(prev => {
        if (!prev) return null;
        return {
            ...prev,
            comments: [...(prev.comments || []), newComment]
        };
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-6">
        <div className="text-center bg-card-dark border border-[#1F1A28] rounded-xl p-8 max-w-md">
          <GitMerge className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Review Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The code review you are looking for does not exist or has been moved.
          </p>
          <Button asChild className="mt-6 h-10 rounded-lg">
            <Link href="/code-review">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Reviews
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-[#1F1A28] bg-background/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="h-8 w-8 rounded-lg border border-[#1F1A28] bg-background-dark hover:bg-[#1a1a2e]">
            <Link href="/code-review">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to reviews</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold font-headline truncate max-w-md">
            {review.title}
          </h1>
          <Badge variant={review.status === 'Completed' ? 'default' : 'secondary'} className={`rounded-full text-xs px-2 py-0.5 ${
            review.status === 'Completed' 
              ? 'bg-green-900/30 text-green-400 border-green-400/30' 
              : review.status === 'In Progress' 
                ? 'bg-yellow-900/30 text-yellow-400 border-yellow-400/30' 
                : 'bg-blue-900/30 text-blue-400 border-blue-400/30'
          }`}>
            {review.status}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 rounded-full text-xs px-2 py-0.5 border border-[#1F1A28] bg-background-dark">
            <Code className="h-3 w-3" />
            <span>{review.language}</span>
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* User profile section with avatar using ShadCN UI components */}
         
          <Button variant="outline" className="h-8 rounded-lg text-sm px-3 border border-[#1F1A28] bg-background-dark hover:bg-[#1a1a2e]">Refresh</Button>
          <Button asChild className="h-8 rounded-lg text-sm px-3 bg-primary hover:bg-primary/90">
            <Link href={`/code-editor?reviewId=${review.id}`}>Edit Code</Link>
          </Button>
        </div>
      </header>


      {/* Main content section with review details using ShadCN UI components */}
          
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <Card className="mb-6 bg-card-dark border border-[#1F1A28] rounded-xl">
            <CardContent className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-full">
                  <AvatarImage src={review.authorImage} />
                  <AvatarFallback className="rounded-full bg-[#7278F2] text-white">{review.author?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{review.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(review.timestamp), 'PPP p')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{(review.comments || []).length} Comments</span>
                </div>
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span>{(review.codeHistory || []).length} Changes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{review.description}</p>
          </div>

          <Tabs defaultValue="current-code" className="w-full">
            <TabsList className="bg-card-dark border border-[#1F1A28] rounded-lg p-1 mb-4">
              <TabsTrigger value="current-code" className="rounded-md data-[state=active]:bg-[#060010] data-[state=active]:text-foreground">
                <Code2 className="mr-2 h-4 w-4" /> Current Code
              </TabsTrigger>
              <TabsTrigger value="change-history" className="rounded-md data-[state=active]:bg-[#060010] data-[state=active]:text-foreground">
                <History className="mr-2 h-4 w-4" /> Change History
              </TabsTrigger>
              <TabsTrigger value="comments" className="rounded-md data-[state=active]:bg-[#060010] data-[state=active]:text-foreground">
                <MessageSquare className="mr-2 h-4 w-4" /> Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current-code" className="mt-0">
              <Card className="bg-card-dark border border-[#1F1A28] rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-[#1F1A28] p-4">
                  <CardTitle className="text-base font-medium">Current Implementation</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyCode} disabled={!review.currentCode} className="h-8 rounded-lg text-xs px-3 border border-[#1F1A28] bg-primary hover:bg-[#1a1a2e]">
                      <Copy className="mr-2 h-3 w-3" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadCode} disabled={!review.currentCode} className="h-8 rounded-lg text-xs px-3 border border-[#1F1A28] bg-primary hover:bg-[#1a1a2e]">
                      <Download className="mr-2 h-3 w-3" /> Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {review.currentCode ? (
                    <div className="rounded-b-lg bg-[#060010]">
                       <Editor
                          height="500px"
                          language={review.language}
                          value={review.currentCode}
                          theme="vs-dark"
                          options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                        />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-b-lg border-t border-[#1F1A28] bg-[#060010] p-12 text-center">
                       <Code2 className="h-10 w-10 text-muted-foreground/50 mb-4"/>
                      <h3 className="text-lg font-semibold">No Code Yet</h3>
                      <p className="text-muted-foreground">The author hasn't added any code to this review.</p>
                       <Button asChild className="mt-4 h-10 rounded-lg bg-primary hover:bg-primary/90">
                        <Link href={`/code-editor?reviewId=${review.id}`}>Add Code</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="change-history" className="mt-0">
              <Card className="bg-card-dark border border-[#1F1A28] rounded-xl">
                <CardHeader className="border-b border-[#1F1A28] p-4">
                  <CardTitle className="text-base font-medium">Change History</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {(review.codeHistory || []).length > 0 ? (
                     [...(review.codeHistory || [])]
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 5)
                      .map((change, index) => (
                      <Card key={index} className="bg-[#060010] border border-[#1F1A28] rounded-lg mb-4 last:mb-0">
                        <CardHeader className="flex flex-row justify-between items-center p-3">
                           <div className="flex items-center gap-3">
                             <Avatar className="h-8 w-8 rounded-full ">
                                <AvatarImage src={(change as any).authorImage || review.authorImage || ''} />
                                <AvatarFallback>{(change as any).author ? (change as any).author.charAt(0).toUpperCase() : (change.authorId ? change.authorId.toString().charAt(0).toUpperCase() : 'A')}</AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="text-sm font-medium">{(change as any).author || `${change.authorId} pushed a change`}</p>
                               <p className="text-xs text-muted-foreground">{format(new Date(change.timestamp), 'PPP p')}</p>
                             </div>
                           </div>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                          <div className="rounded-md bg-background/50 overflow-hidden">
                            <Editor
                              height="200px"
                              language={review.language}
                              value={change.code}
                              theme="vs-dark"
                              options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                     ))
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 bg-[#060010] p-12 text-center">
                       <History className="h-10 w-10 text-muted-foreground/50 mb-4"/>
                       <h3 className="text-lg font-semibold">No Changes Recorded</h3>
                       <p className="text-muted-foreground">This review has no previous versions.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="mt-0">
               <Card className="bg-card-dark border border-[#1F1A28] rounded-xl">
                <CardHeader className="border-b border-[#1F1A28] p-4">
                  <div className="flex items-center justify-between">
                     <CardTitle className="text-base font-medium">Comments</CardTitle>
                     {!isCommenting && (
                        <Button variant="outline" size="sm" onClick={() => setIsCommenting(true)} className="h-8 rounded-lg text-xs px-3 border border-[#1F1A28] bg-background-dark hover:bg-[#1a1a2e]">
                            <PlusCircle className="mr-2 h-3 w-3" />
                            Add Comment
                        </Button>
                     )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] w-full">
                    {(review.comments || []).length > 0 ? (
                      <div className="space-y-4 p-4">
                        {[...(review.comments || [])]
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((comment, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-[#060010] border border-[#1F1A28] hover:border-[#7278F2]/50 transition-colors duration-200">
                            <Avatar className="h-10 w-10 rounded-full">
                              <AvatarImage src={(comment as CommentWithAuthor).authorImage || ''} />
                              <AvatarFallback className="rounded-full bg-[#7278F2] text-white">
                                {(comment as CommentWithAuthor).author?.charAt(0).toUpperCase() || 
                                 (comment.authorId ? comment.authorId.toString().charAt(0).toUpperCase() : 'A')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-sm">
                                  {(comment as CommentWithAuthor).author || comment.authorId?.toString() || 'Anonymous'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                </p>
                              </div>
                              <p className="text-foreground text-sm leading-relaxed">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                       <div className="flex h-full flex-col items-center justify-center rounded-md text-center py-16 bg-[#060010]">
                           <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4"/>
                           <h3 className="text-xl font-semibold mb-2">No Comments Yet</h3>
                           <p className="text-muted-foreground mb-4">Be the first to leave a comment.</p>
                           <Button variant="outline" size="sm" onClick={() => setIsCommenting(true)} className="h-8 rounded-lg text-xs px-3 border border-[#1F1A28] bg-background-dark hover:bg-[#1a1a2e]">
                            <PlusCircle className="mr-2 h-3 w-3" />
                            Add Comment
                          </Button>
                        </div>
                    )}
                  </ScrollArea>
                  <div className="border-t border-[#1F1A28]">
                    {isCommenting && (
                        <CommentForm 
                            reviewId={review.id} 
                            user={user} 
                            onCommentAdded={handleCommentAdded}
                            onCommentPosted={() => setIsCommenting(false)}
                        />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

    