import { z } from 'zod';

export const UserProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export const SignupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export const CodeSaveSchema = z.object({
  reviewId: z.string(),
  code: z.string(),
});

const ReviewerSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  image: z.string().optional(),
});

const CodeHistorySchema = z.object({
  id: z.string().optional(),
  code: z.string(),
  timestamp: z.string(),
  authorId: z.string(),
  reviewId: z.string(),
});

export const CommentSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  reviewId: z.string(),
  text: z.string(),
  timestamp: z.string(),
  // Removed author and authorImage as they should be joined from users table
});

// Extended type for display purposes that includes joined user data
export type CommentWithAuthor = z.infer<typeof CommentSchema> & {
  author?: string;
  authorImage?: string;
};

export const ReviewSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  language: z.string(),
  status: z.enum(['Completed', 'In Progress']),
  authorId: z.string(), // Changed from author to authorId
  author: z.string().optional(), // Added for display purposes
  authorImage: z.string().optional(), // Added for display purposes
  issues: z.number(),
  reviewers: z.array(ReviewerSchema),
  timestamp: z.string(),
  currentCode: z.string(),
  comments: z.array(CommentSchema).optional(), // Added for display purposes
  codeHistory: z.array(CodeHistorySchema).optional(), // Added for display purposes
  // Fields for Smart Save
  baselineTimeComplexity: z.string().optional(),
  baselineSpaceComplexity: z.string().optional(),
  baselineLoc: z.number().optional(),
  // Added count fields
  commentCount: z.number().optional(),
  historyCount: z.number().optional(),
  // Version field for concurrency control
  version: z.number().optional(),
});

// Extended type for display purposes that includes joined user data for comments
export type ReviewWithAuthor = z.infer<typeof ReviewSchema> & {
  comments?: CommentWithAuthor[];
};

export type Review = z.infer<typeof ReviewSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Comment = z.infer<typeof CommentSchema>;