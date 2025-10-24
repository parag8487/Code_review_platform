
"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Input} from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea";
import {
  History,
  CheckCircle,
  ChevronDown,
  Code,
  Edit,
  Eye,
  GitMerge,
  Home,
  List,
  Loader2,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
} from 'lucide-react';
import Link from 'next/link';
import * as React from "react";
import { createReview, getCurrentUser, getReviews, logout, deleteReview } from '@/lib/actions';
import type { Review, UserProfile } from '@/lib/definitions';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import CardNav from '@/components/CardNav';
import { DotPattern } from '@/components/DotPattern';

function CreateReviewDialog({ onReviewCreate, children }: { onReviewCreate: (review: {title: string; description: string; language: string}) => Promise<void>; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [language, setLanguage] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (title && language && description) {
      setIsCreating(true);
      try {
        await onReviewCreate({ title, language, description });
        toast({
          title: "Review Created!",
          description: "Your new code review has been successfully created.",
        });
        setOpen(false);
        setTitle("");
        setLanguage("");
        setDescription("");
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create review. Please try again.",
        });
      } finally {
        setIsCreating(false);
      }
    } else {
       toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all the details for the review.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#0D0716] border border-[#1F1A28] rounded-xl p-0 overflow-hidden shadow-2xl">
        <div className="bg-[#0D0716] border-b border-[#1F1A28] p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-bold text-white">Create New Review</DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Fill in the details below to start a new code review.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300 font-medium">
                Title
              </Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Factorial Implementation" 
                className="bg-[#060010] border border-[#1F1A28] text-white placeholder-gray-500 rounded-lg h-12 px-4 focus:border-[#7278F2] focus:ring-1 focus:ring-[#7278F2] focus:ring-offset-0 transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language" className="text-gray-300 font-medium">
                Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-[#060010] border border-[#1F1A28] text-white rounded-lg h-12 focus:border-[#7278F2] focus:ring-1 focus:ring-[#7278F2] focus:ring-offset-0 transition-colors">
                  <SelectValue placeholder="Select a language" className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-[#060010] border border-[#1F1A28] rounded-lg">
                  <SelectItem value="python" className="text-white py-2 focus:bg-[#1a1a2e]">Python</SelectItem>
                  <SelectItem value="javascript" className="text-white py-2 focus:bg-[#1a1a2e]">JavaScript</SelectItem>
                  <SelectItem value="typescript" className="text-white py-2 focus:bg-[#1a1a2e]">TypeScript</SelectItem>
                  <SelectItem value="cpp" className="text-white py-2 focus:bg-[#1a1a2e]">C++</SelectItem>
                  <SelectItem value="java" className="text-white py-2 focus:bg-[#1a1a2e]">Java</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300 font-medium">
                Description
              </Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="A brief description of your code..." 
                className="bg-[#060010] border border-[#1F1A28] text-white placeholder-gray-500 rounded-lg min-h-[120px] p-4 focus:border-[#7278F2] focus:ring-1 focus:ring-[#7278F2] focus:ring-offset-0 transition-colors resize-none" 
              />
            </div>
          </div>
        </div>
        <div className="bg-[#0D0716] border-t border-[#1F1A28] p-6 flex justify-end gap-3">
          <Button 
            variant="outline"
            onClick={() => setOpen(false)}
            className="border border-[#1F1A28] bg-[#060010] text-white hover:bg-[#1a1a2e] rounded-lg h-10 px-6 font-medium transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isCreating}
            className="bg-[#7278F2] text-white hover:bg-[#7278F2]/90 rounded-lg h-10 px-6 font-medium transition-colors"
          >
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteReviewDialog({ reviewId, onReviewDeleted }: { reviewId: string, onReviewDeleted: () => void }) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteReview(reviewId);
            toast({
                title: "Review Deleted",
                description: "The code review has been permanently removed.",
            });
            onReviewDeleted();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete the review. Please try again.",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the code review and all its associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function CodeReviewPage() {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalReviews, setTotalReviews] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");
  const reviewsPerPage = 5;

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Update status filter
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const fetchDashboardData = React.useCallback(async (page: number = currentPage) => {
    setIsLoading(true);
    try {
      const [fetchedReviewsData, fetchedUser] = await Promise.all([
        getReviews(page, reviewsPerPage, debouncedSearchQuery, statusFilter),
        getCurrentUser(),
      ]);
      setReviews(fetchedReviewsData.reviews || []); // Ensure we always set an array
      setTotalReviews(fetchedReviewsData.totalCount || 0);
      setUser(fetchedUser);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setReviews([]); // Set empty array on error
      setTotalReviews(0);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, reviewsPerPage, debouncedSearchQuery, statusFilter]);

  React.useEffect(() => {
    fetchDashboardData(currentPage);
  }, [fetchDashboardData, currentPage]);

  // Fetch data when search query or status filter changes
  React.useEffect(() => {
    setCurrentPage(1); // Reset to first page
    fetchDashboardData(1);
  }, [debouncedSearchQuery, statusFilter, fetchDashboardData]);

  const handleCreateReview = async (newReviewData: {title: string; description: string; language: string}) => {
    try {
      await createReview(newReviewData);
      // Reset search and filter when creating a new review
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setStatusFilter("all");
      setCurrentPage(1);
      await fetchDashboardData(1); // Refetch reviews to show the new one
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setStatusFilter("all");
    setCurrentPage(1);
    fetchDashboardData(1);
  };

  return (
    <main
      className="relative min-h-screen bg-background"
      style={
        {
          // custom per-page tokens
          ["--background"]: "#060010",
          ["--dot-color"]: "#2D2540",
        } as any
      }
    >
      {/* Decorative background */}
      <DotPattern glow={false} style={{ color: "var(--dot-color)" }} />

      {/* Foreground content */}
      <div className="relative z-10">
        <div className="sticky top-0 z-50">
          <CardNav
            logoDark="/logo_in_dark_mode.png"
            logoLight="/logo_in_light_mode.png"
            isDarkMode={true}
            logoAlt="CodeReview Pro Logo"
            items={[
              {
                label: "Home",
                bgColor: "#0D0716",
                textColor: "#fff",
                links: [
                  { label: "Home", href: "/welcome", ariaLabel: "Go to Home page" },
                  { label: "Reviews", href: "/code-review", ariaLabel: "View All Reviews" }
                ]
              },
              {
                label: "Profile",
                bgColor: "#170D27",
                textColor: "#fff",
                links: [
                  { label: "My Profile", href: "/profile", ariaLabel: "View Profile" },
                  { label: "Settings", href: "/profile", ariaLabel: "Account Settings" }
                ]
              },
              {
                label: "Contact",
                bgColor: "#271E37",
                textColor: "#fff",
                links: [
                  { label: "Email", href: "mailto:paragmohare049@gmail.com", ariaLabel: "Email us" },
                  { label: "Github", href: "https://github.com/parag8487/Code_review_platform", ariaLabel: "Github" },
                  { label: "Feedback", href: "/contact", ariaLabel: "Feedback" }
                ]
              }
            ]}
            baseColor="#060010"
            menuColor="#000"
            buttonBgColor="#fff"
            buttonTextColor="#000"
            userProfileButtonBgColor="#7278F2"
            borderColor="#1F1A28"
            ease="power3.out"
            userProfile={{
              name: user?.name || 'User',
              initials: user?.name ? user.name.charAt(0).toUpperCase() : 'U'
            }}
          />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6" style={{ paddingTop: '120px' }}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div className="grid gap-1">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">
                  Welcome back, {user?.name || 'User'}!
                </h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your code reviews.
                </p>
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <CreateReviewDialog onReviewCreate={handleCreateReview}>
                  <Button className="bg-white text-black hover:bg-gray-200 rounded-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    New Code Review
                  </Button>
                </CreateReviewDialog>
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-[#0D0716] border border-[#1F1A28] rounded-xl hover:bg-[#1a1a2e] transition-colors duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reviews
                </CardTitle>
                <List className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(reviews || []).length}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#0D0716] border border-[#1F1A28] rounded-xl hover:bg-[#1a1a2e] transition-colors duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(reviews || []).filter(r => r.status === 'In Progress').length}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#0D0716] border border-[#1F1A28] rounded-xl hover:bg-[#1a1a2e] transition-colors duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(reviews || []).filter(r => r.status === 'Completed').length}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#0D0716] border border-[#1F1A28] rounded-xl hover:bg-[#1a1a2e] transition-colors duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Feedback
                </CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>
          <Card className="flex flex-col flex-1 bg-[#0D0716] border border-[#1F1A28] rounded-xl">
            <CardHeader className="flex flex-col gap-4 pb-4">
              <CardTitle className="text-xl font-bold">Recent Code Reviews</CardTitle>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search reviews..."
                    className="bg-background-dark text-foreground placeholder:text-muted-foreground border border-[#1F1A28] pl-10 rounded-lg w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-[180px] bg-background-dark text-foreground border border-[#1F1A28] rounded-lg">
                      <SelectValue placeholder="All Status" className="text-foreground" />
                    </SelectTrigger>
                    <SelectContent className="bg-background-dark text-foreground border border-[#1F1A28] rounded-lg">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="bg-background-dark text-foreground border border-[#1F1A28] hover:bg-[#1a1a2e] rounded-lg whitespace-nowrap" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            {isLoading ? (
              <CardContent className="flex-1 flex flex-col items-center justify-center text-center bg-[#060010] border border-[#1F1A28] rounded-xl min-h-[300px]">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground"/>
              </CardContent>
            ) : (reviews || []).length === 0 ? (
              <CardContent className="flex-1 flex flex-col items-center justify-center text-center bg-[#060010] border border-[#1F1A28] rounded-xl min-h-[300px]">
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <GitMerge className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-semibold">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    Get started by creating your first code review.
                  </p>
                  <CreateReviewDialog onReviewCreate={handleCreateReview}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Create Review
                    </Button>
                  </CreateReviewDialog>
                </div>
              </CardContent>
            ) : (
              <CardContent className="flex-1 flex flex-col gap-4 p-4">
                {(reviews || []).map((review) => (
                  <div key={review.id} className="review-item bg-[#060010] border border-[#1F1A28] rounded-lg p-5 pl-8 pr-8 hover:bg-[#0a001a] transition-all duration-200">
                    <div className="review-header flex justify-between items-start mb-3">
                      <div className="review-title flex items-center gap-3 flex-1 min-w-0">
                        <Link href={`/code-review/${review.id}`} className="font-semibold text-lg text-foreground hover:underline truncate">
                          {review.title}
                        </Link>
                        <span className={`review-status text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                          review.status === 'Completed' 
                            ? 'bg-green-900/30 text-green-400' 
                            : review.status === 'In Progress' 
                              ? 'bg-yellow-900/30 text-yellow-400' 
                              : 'bg-blue-900/30 text-blue-400'
                        }`}>
                          {review.status}
                        </span>
                      </div>
                      <div className="review-meta flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="review-author flex items-center gap-1">
                          <Avatar className="w-7 h-7 rounded-full">
                            <AvatarImage src={review.authorImage || ''} />
                            <AvatarFallback className="text-xs">
                              {review.author ? review.author.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{review.author || 'Unknown'}</span>
                        </span>
                        <span className="review-date">
                          {formatDistanceToNow(new Date(review.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="review-body mb-4">
                      <p className="review-description text-muted-foreground text-sm mb-3 line-clamp-2">
                        {review.description}
                      </p>
                      <div className="review-stats flex flex-wrap justify-between gap-9 pt-4 pb-4">
                        <span className="stat-badge inline-flex items-center gap-1 bg-[#181926] text-foreground text-xs font-medium px-3 py-1 rounded-full">
                          <Code className="w-3 h-3" />
                          {review.language}
                        </span>
                        <span className="stat-badge inline-flex items-center gap-1 bg-[#181926] text-foreground text-xs font-medium px-3 py-1 rounded-full">
                          <MessageCircle className="w-3 h-3" />
                          {review.commentCount || (review.comments || []).length} Comments
                        </span>
                        <span className="stat-badge inline-flex items-center gap-1 bg-[#181926] text-foreground text-xs font-medium px-3 py-1 rounded-full">
                          <History className="w-3 h-3" />
                          {review.historyCount || (review.codeHistory || []).length} Changes
                        </span>
                      </div>
                    </div>
                    
                    <div className="review-footer flex justify-between items-center pt-3 border-t border-[#1F1A28]">
                      <div className="review-participants flex items-center gap-2 text-sm text-muted-foreground">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="avatar-group flex cursor-pointer">
                              {review.reviewers.slice(0, 3).map((reviewer, i) => (
                                <Avatar key={i} className="w-6 h-6 rounded-full border-2 border-background -ml-2 first:ml-0">
                                  <AvatarImage src={reviewer.image || ''} />
                                  <AvatarFallback className="text-xs">
                                    {reviewer.name ? reviewer.name.charAt(0).toUpperCase() : 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {review.reviewers.length > 3 && (
                                <span className="avatar-more w-6 h-6 rounded-full bg-background-dark text-foreground text-xs flex items-center justify-center -ml-2 border-2 border-background">
                                  +{review.reviewers.length - 3}
                                </span>
                              )}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-[#060010] border border-[#1F1A28] rounded-lg min-w-[200px]">
                            <DropdownMenuLabel className="text-foreground">Contributors</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#1F1A28]" />
                            {review.reviewers.length > 0 ? (
                              review.reviewers.map((reviewer, i) => (
                                <DropdownMenuItem key={i} className="text-foreground py-2 focus:bg-[#1a1a2e]">
                                  <Avatar className="w-6 h-6 rounded-full mr-2">
                                    <AvatarImage src={reviewer.image || ''} />
                                    <AvatarFallback className="text-xs">
                                      {reviewer.name ? reviewer.name.charAt(0).toUpperCase() : 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{reviewer.name}</span>
                                </DropdownMenuItem>
                              ))
                            ) : (
                              <DropdownMenuItem className="text-foreground py-2" disabled>
                                No contributors yet
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <span>Contributors</span>
                      </div>
                      
                      <div className="review-actions flex gap-2">
                        <Button variant="outline" size="sm" className="btn btn-sm btn-outline h-8 px-3 text-xs rounded-md border border-[#1F1A28] bg-background-dark hover:bg-[#1a1a2e] text-white" asChild>
                          <Link href={`/code-review/${review.id}`}>
                            <Eye className="w-3 h-3 text-white" />
                            <span className="hidden sm:inline">View</span>
                          </Link>
                        </Button>
                        <Button size="sm" className="btn btn-sm btn-primary h-8 px-3 text-xs rounded-md" asChild>
                          <Link href={`/code-editor?reviewId=${review.id}`}>
                            <Edit className="w-3 h-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </Link>
                        </Button>
                        {review.status === 'Completed' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white text-black hover:bg-gray-100 rounded-xl">
                                <MoreHorizontal className="h-4 w-4 text-black" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white text-black border-0 rounded-xl">
                              <DeleteReviewDialog reviewId={review.id} onReviewDeleted={fetchDashboardData} />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </CardContent>
            )}
          </Card>
          {(reviews || []).length > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                      }
                    }}
                  />
                </PaginationItem>
                
                {/* Generate page numbers */}
                {Array.from({ length: Math.min(5, Math.ceil(totalReviews / reviewsPerPage)) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {Math.ceil(totalReviews / reviewsPerPage) > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(Math.ceil(totalReviews / reviewsPerPage));
                        }}
                      >
                        {Math.ceil(totalReviews / reviewsPerPage)}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < Math.ceil(totalReviews / reviewsPerPage)) {
                        setCurrentPage(currentPage + 1);
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
      {/* Footer */}
      <footer className={`py-6 px-6 md:px-20 mt-8 mt-auto'border-t border-gray-400'}`}>
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6">
              <Link href="#" className={'text-gray-500 hover:text-gray-900 transition-colors'}>Terms</Link>
              <Link href="#" className={'text-gray-500 hover:text-gray-900 transition-colors'}>Privacy</Link>
              <Link href="/contact" className={'text-gray-500 hover:text-gray-900 transition-colors'}>Contact</Link>
            </div>
            <p className={'text-gray-500 text-sm mt-4 md:mt-0'}>
              © 2025 Code Review. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}




















































































































































