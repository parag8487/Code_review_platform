'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { LoginSchema, SignupSchema, ReviewSchema, CodeSaveSchema, UserProfileSchema, UserProfile, Review, CommentSchema } from './definitions';
import { revalidatePath } from 'next/cache';
import { analyzeCode } from '@/ai/flows/analyze-code-flow';
import { calculateLOC } from '@/lib/loc';
import { isNewCodeAcceptable, type Metrics } from './comparison';
import { detectLanguage } from '@/ai/flows/detect-language-flow';
import { pool } from './db';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { createSession, verifySession, clearSession, clearAllCookies } from './session';

// --- Database Functions ---

async function dbQuery(text: string, params: any[] = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err: any) {
    console.error('Database query error:', err);
    // Return a mock result structure to prevent app crashes
    return { rows: [], rowCount: 0 };
  }
}

// --- User Functions ---

export async function getUserByEmail(email: string) {
  const result = await dbQuery('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function createUser(userData: any) {
  const { name, email, password, fullName } = userData;
  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await dbQuery(
    'INSERT INTO users (name, email, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, hashedPassword, fullName || name]
  );
  return result.rows[0] || null;
}

export async function updateUserProfile(userId: string, updates: any) {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  
  // No need to convert userId to integer since we're using UUIDs
  
  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  values.push(userId); // Use UUID directly
  
  const result = await dbQuery(
    `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

// --- Review Functions ---

export async function createReviewInDB(reviewData: any) {
  const { title, description, language, authorId } = reviewData;
  
  // No need to convert authorId to integer since we're using UUIDs
  
  const result = await dbQuery(
    'INSERT INTO reviews (title, description, language, author_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [title, description, language, authorId, 'In Progress'] // Use UUID directly
  );
  return result.rows[0] || null;
}

export async function getReviewsFromDB(page: number = 1, limit: number = 5, searchQuery: string = "", statusFilter: string = "") {
  const offset = (page - 1) * limit;
  
  // First, get the basic review info with counts
  let query = `
    SELECT
      r.id, r.title, r.status, r.language, r.description, r.created_at,
      COALESCE(u.name, 'Deleted User') as author_name,
      u.avatar_url as author_image,
      (SELECT COUNT(*) FROM comments WHERE review_id = r.id) as comment_count,
      (SELECT COUNT(*) FROM review_history WHERE review_id = r.id) as history_count
    FROM reviews r
    LEFT JOIN users u ON r.author_id = u.id
  `;
  
  const params: any[] = [];
  let paramIndex = 1;
  
  // Add WHERE conditions for search and status filter
  const conditions = [];
  
  if (searchQuery) {
    conditions.push(`(r.title ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`);
    params.push(`%${searchQuery}%`);
    paramIndex++;
  }
  
  if (statusFilter && statusFilter !== "all") {
    conditions.push(`r.status = $${paramIndex}`);
    params.push(statusFilter);
    paramIndex++;
  }
  
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  
  query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  
  const result = await dbQuery(query, params);
  return result.rows;
}

export async function getReviewsCountFromDB(searchQuery: string = "", statusFilter: string = "") {
  let query = `
    SELECT COUNT(*) as count
    FROM reviews r
  `;
  
  const params: any[] = [];
  let paramIndex = 1;
  
  // Add JOIN and WHERE conditions for search and status filter
  const conditions = [];
  
  if (searchQuery) {
    conditions.push(`(r.title ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`);
    params.push(`%${searchQuery}%`);
    paramIndex++;
  }
  
  if (statusFilter && statusFilter !== "all") {
    conditions.push(`r.status = $${paramIndex}`);
    params.push(statusFilter);
    paramIndex++;
  }
  
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  
  const result = await dbQuery(query, params);
  return parseInt(result.rows[0].count) || 0;
}

export async function getReviewByIdFromDB(id: string) {
  // No need to convert ID to integer since we're using UUIDs
  // const idInt = parseInt(id);
  // if (isNaN(idInt)) {
  //   throw new Error('Invalid review ID format');
  // }
  
  const result = await dbQuery(`
    SELECT 
      r.*,
      COALESCE(u.name, 'Deleted User') as author_name,
      u.avatar_url as author_image
    FROM reviews r
    LEFT JOIN users u ON r.author_id = u.id
    WHERE r.id = $1
  `, [id]); // Use UUID directly
  return result.rows[0] || null;
}

export async function getCommentsForReview(reviewId: string) {
  // No need to convert ID to integer since we're using UUIDs
  
  const result = await dbQuery(`
    SELECT 
      c.*,
      COALESCE(u.name, 'Deleted User') as author_name,
      u.avatar_url as author_image
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.review_id = $1
    ORDER BY c.created_at ASC
  `, [reviewId]); // Use UUID directly
  return result.rows;
}

export async function getReviewHistory(reviewId: string) {
  // No need to convert ID to integer since we're using UUIDs
  
  const result = await dbQuery(`
    SELECT 
      rh.*,
      COALESCE(u.name, 'Deleted User') as author_name
    FROM review_history rh
    LEFT JOIN users u ON rh.author_id = u.id
    WHERE rh.review_id = $1
    ORDER BY rh.created_at ASC
  `, [reviewId]); // Use UUID directly
  return result.rows;
}

export async function updateReviewCode(reviewId: string, code: string, authorId: string, currentVersion: number) {
  // No need to convert IDs to integers since we're using UUIDs
  
  if (isNaN(currentVersion)) {
    throw new Error('Invalid version format');
  }
  
  // Debug logging
  console.log('Updating review code:', {
    reviewId,
    codeLength: code.length,
    authorId,
    currentVersion
  });
  
  // Check if this is an initial save (no existing code)
  const reviewCheck = await dbQuery(
    'SELECT current_code FROM reviews WHERE id = $1',
    [reviewId]
  );
  
  const isInitialSave = reviewCheck.rows.length > 0 && reviewCheck.rows[0].current_code === null;
  
  // Debug logging
  console.log('Is initial save:', isInitialSave);
  
  if (!isInitialSave) {
    // Only save to history if there's existing code to save
    await dbQuery(
      'INSERT INTO review_history (review_id, code, author_id) SELECT id, current_code, $1 FROM reviews WHERE id = $2 AND current_code IS NOT NULL',
      [authorId, reviewId] // Use UUIDs directly
    );
  }
  
  if (isInitialSave) {
    // This is an initial save, bypass version checking completely
    const result = await dbQuery(
      'UPDATE reviews SET current_code = $1, updated_at = CURRENT_TIMESTAMP, version = version + 1 WHERE id = $2 RETURNING *',
      [code, reviewId]
    );
    console.log('Initial save result:', result.rows[0] || null);
    return result.rows[0] || null;
  } else {
    // This is an update to existing code, use version checking
    const result = await dbQuery(
      'UPDATE reviews SET current_code = $1, updated_at = CURRENT_TIMESTAMP, version = version + 1 WHERE id = $2 AND version = $3 RETURNING *',
      [code, reviewId, currentVersion]
    );
    console.log('Update save result:', result.rows[0] || null);
    return result.rows[0] || null;
  }
}

export async function updateReviewMetrics(reviewId: string, metrics: any, currentVersion: number) {
  const { timeComplexity, spaceComplexity, loc } = metrics;
  
  // No need to convert ID to integer since we're using UUIDs
  
  if (isNaN(currentVersion)) {
    throw new Error('Invalid version format');
  }
  
  // Debug logging
  console.log('Updating review metrics:', {
    reviewId,
    timeComplexity,
    spaceComplexity,
    loc,
    currentVersion
  });
  
  // Always update metrics without version checking since this function is called 
  // immediately after updateReviewCode which already handles version checking
  const result = await dbQuery(
    'UPDATE reviews SET baseline_time_complexity = $1, baseline_space_complexity = $2, baseline_loc = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
    [timeComplexity, spaceComplexity, loc, reviewId]
  );
  
  console.log('Update metrics result:', result.rows[0] || null);
  return result.rows[0] || null;
}

export async function markReviewAsCompleteInDB(reviewId: string) {
  // No need to convert ID to integer since we're using UUIDs
  
  const result = await dbQuery(
    'UPDATE reviews SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    ['Completed', reviewId] // Use UUID directly
  );
  return result.rows[0] || null;
}

export async function markReviewAsInProgressInDB(reviewId: string) {
  // No need to convert ID to integer since we're using UUIDs
  
  const result = await dbQuery(
    'UPDATE reviews SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    ['In Progress', reviewId] // Use UUID directly
  );
  return result.rows[0] || null;
}

export async function addCommentToReview(reviewId: string, commentData: any) {
  const { authorId, text } = commentData;
  
  // No need to convert IDs to integers since we're using UUIDs
  
  const result = await dbQuery(
    'INSERT INTO comments (review_id, author_id, text) VALUES ($1, $2, $3) RETURNING *',
    [reviewId, authorId, text] // Use UUIDs directly
  );
  return result.rows[0] || null;
}

export async function deleteReviewFromDB(reviewId: string) {
  // No need to convert ID to integer since we're using UUIDs
  
  const result = await dbQuery('DELETE FROM reviews WHERE id = $1 RETURNING id', [reviewId]); // Use UUID directly
  return result.rows[0] || null;
}

export async function getReviewContributors(reviewId: string) {
  // No need to convert ID to integer since we're using UUIDs
  
  // Get unique contributors from review_history, including the review author
  const result = await dbQuery(`
    SELECT DISTINCT
      u.id,
      u.name,
      u.avatar_url
    FROM review_history rh
    JOIN users u ON rh.author_id = u.id
    JOIN reviews r ON rh.review_id = r.id
    WHERE rh.review_id = $1
  `, [reviewId]); // Use UUID directly
  
  return result.rows.map(row => ({
    id: row.id.toString(),
    name: row.name,
    image: row.avatar_url
  }));
}

// --- Mock Database Initialization (fallback) ---

// Use a global object to persist data across hot reloads in development
const globalForDb = globalThis as unknown as {
  users: (z.infer<typeof SignupSchema> & UserProfile)[];
  reviews: z.infer<typeof ReviewSchema>[];
  comments: z.infer<typeof CommentSchema>[];
  codeHistory: {
    id: string; // Keep as string for consistency
    reviewId: string; // Keep as string for consistency
    code: string;
    authorId: string; // Keep as string for consistency
    timestamp: string;
  }[];
  reviewIdCounter: number;
  commentIdCounter: number;
  historyIdCounter: number;
};

if (!globalForDb.users) {
  globalForDb.users = [
    {
      id: "1", // Using string for consistency but integer-like value
      name: "demo_user",
      email: "demo@example.com",
      password: "password123", // In a real app, this would be hashed
      fullName: "Demo User",
      phone: "123-456-7890",
      bio: "This is a bio. It can be a short or long description about the user.",
      avatarUrl: "https://github.com/shadcn.png"
    }
  ];
}

if (!globalForDb.reviews) {
  globalForDb.reviews = [];
}

if (!globalForDb.comments) {
  globalForDb.comments = [];
}

if (!globalForDb.codeHistory) {
  globalForDb.codeHistory = [];
}

if (!globalForDb.reviewIdCounter) {
  globalForDb.reviewIdCounter = 1;
}

if (!globalForDb.commentIdCounter) {
  globalForDb.commentIdCounter = 1;
}

if (!globalForDb.historyIdCounter) {
  globalForDb.historyIdCounter = 1;
}

let users = globalForDb.users;
let reviews = globalForDb.reviews;
let comments = globalForDb.comments;
let codeHistory = globalForDb.codeHistory;
let reviewIdCounter = globalForDb.reviewIdCounter;
let commentIdCounter = globalForDb.commentIdCounter;
let historyIdCounter = globalForDb.historyIdCounter;

export type FormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

export async function signup(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = SignupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid data.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  // Try database first
  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        message: 'A user with this email already exists.',
        success: false,
      };
    }
    
    const newUser = await createUser({ name, email, password, fullName: name });
    if (newUser) {
      // Log the signup action
      await dbQuery(
        'INSERT INTO audit_log (user_id, action) VALUES ($1, $2)',
        [newUser.id, 'user_signup']
      );
      
      redirect('/login?message=Registration successful! Please log in.');
    }
  } catch (err) {
    console.warn('Database signup failed, falling back to mock database');
  }

  // Fallback to mock database
  if (users.find((user) => user.email === email)) {
    return {
      message: 'A user with this email already exists.',
      success: false,
    };
  }
  
  const newUser: z.infer<typeof SignupSchema> & UserProfile = {
    ...validatedFields.data,
    id: `${users.length + 1}`, // Use integer-based string ID for mock database
    fullName: name,
    phone: undefined,
    bio: undefined,
    avatarUrl: undefined
  };
  
  users.push(newUser);
  
  redirect('/login?message=Registration successful! Please log in.');
}

export async function login(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid email or password format.',
      success: false,
    };
  }

  const { email, password } = validatedFields.data;

  // Try database first
  try {
    const user = await getUserByEmail(email);
    if (user) {
      // Check if password_hash exists and is not empty
      if (!user.password_hash || user.password_hash === '') {
        console.error('User found but password_hash is missing or empty:', user);
        return {
          message: 'Account has been deleted or deactivated.',
          success: false,
        };
      }
      
      // Compare the provided password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (isPasswordValid) {
        // Create session for the authenticated user - use UUID directly
        await createSession(user.id.toString()); // Use UUID for session storage
        
        // Log the login action
        await dbQuery(
          'INSERT INTO audit_log (user_id, action) VALUES ($1, $2)',
          [user.id, 'user_login'] // Use UUID for database
        );
        
        // Successful login - redirect to welcome page
        redirect('/welcome');
      } else {
        return {
          message: 'Invalid email or password.',
          success: false,
        };
      }
    } else {
      // User not found in database
      console.log('User not found in database for email:', email);
    }
  } catch (err: any) {
    // Only log as warning if it's not a redirect error
    if (err.digest && err.digest.includes('NEXT_REDIRECT')) {
      // This is a redirect, re-throw it
      throw err;
    } else {
      console.error('Database login error:', err);
      console.warn('Database login failed, falling back to mock database');
    }
  }

  // Fallback to mock database
  const user = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!user) {
    return {
      message: 'Invalid email or password.',
      success: false,
    };
  }

  // Create session for the authenticated user
  if (user.id) {
    await createSession(user.id.toString()); // Ensure ID is string for session
  }
  
  redirect('/welcome');
}

export async function logout() {
  // Clear all cookies to ensure complete session termination
  await clearAllCookies();
  redirect('/login');
}

// Updated getCurrentUser to use session
export async function getCurrentUser(): Promise<UserProfile | null> {
  // Get user from session
  const { isAuth, userId } = await verifySession();
  
  console.log('Session verification result:', { isAuth, userId });
  
  if (!isAuth || !userId) {
    console.log('User not authenticated or no userId in session');
    return null;
  }

  // Try database first
  try {
    // No need to convert userId to integer since we're using UUIDs
    
    // If we have a userId from session, get that specific user
    const result = await dbQuery('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    
    if (user) {
      console.log('User fetched from database:', user);
      return {
        id: user.id.toString(), // Return as string for consistency
        name: user.name,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        bio: user.bio,
        avatarUrl: user.avatar_url
      };
    } else {
      console.log('User not found in database for userId:', userId);
    }
  } catch (err) {
    console.warn('Database get current user failed, falling back to mock database:', err);
  }

  // Fallback to mock database
  const user = users.find(u => u.id === userId);
  if (user) {
    console.log('User fetched from mock database:', user);
    return JSON.parse(JSON.stringify(user));
  }
  
  console.log('User not found in mock database for userId:', userId);
  return null;
}

export async function updateUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
    const data = Object.fromEntries(formData.entries());

    // Handle avatar upload
    const avatarFile = formData.get('avatar') as File | null;
    let avatarUrl = data.avatarUrl as string | undefined;
    
    if (avatarFile && avatarFile.size > 0) {
      // In a real application, you would upload the file to a storage service here
      // For this implementation, we'll generate a data URL for preview purposes
      // In production, you would use a service like AWS S3, Cloudinary, etc.
      
      // For demonstration purposes, we'll create a simple avatar URL based on timestamp
      // In a real implementation, you would do something like:
      // const uploadedUrl = await uploadToStorage(avatarFile);
      // avatarUrl = uploadedUrl;
      
      // Generate a simple avatar URL based on current timestamp
      const timestamp = Date.now();
      avatarUrl = `/avatars/avatar-${timestamp}.png`; // This would be the actual uploaded URL
    }

    // Remove avatar from data as it's a File object and not needed in validation
    const { avatar, ...dataWithoutAvatar } = data;
    const validatedFields = UserProfileSchema.partial().safeParse(dataWithoutAvatar);

    if (!validatedFields.success) {
        return {
            message: 'Invalid data provided.',
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    // Get current user to get their ID
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return { message: 'User not authenticated.', success: false };
    }
    
    // Try database first
    try {
      // No need to convert userId to integer since we're using UUIDs
      
      const updateData: any = {};
      if (validatedFields.data.fullName !== undefined) updateData.full_name = validatedFields.data.fullName;
      if (validatedFields.data.bio !== undefined) updateData.bio = validatedFields.data.bio;
      if (validatedFields.data.phone !== undefined) updateData.phone = validatedFields.data.phone;
      if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl; // Add avatar URL if provided
      
      const updatedUser = await updateUserProfile(currentUser.id, updateData);
      
      if (updatedUser) {
        revalidatePath('/profile');
        revalidatePath('/code-review');
        return { message: 'Profile updated successfully!', success: true };
      }
    } catch (err) {
      console.warn('Database update user failed, falling back to mock database:', err);
    }

    // Fallback to mock database
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
        return { message: 'User not found.', success: false };
    }

    // Update only the fields that were provided
    if (validatedFields.data.fullName !== undefined) users[userIndex].fullName = validatedFields.data.fullName;
    if (validatedFields.data.bio !== undefined) users[userIndex].bio = validatedFields.data.bio;
    if (validatedFields.data.phone !== undefined) users[userIndex].phone = validatedFields.data.phone;
    if (avatarUrl !== undefined) users[userIndex].avatarUrl = avatarUrl; // Update avatar URL if provided
    
    revalidatePath('/profile');
    revalidatePath('/code-review');

    return { message: 'Profile updated successfully!', success: true };
}

// --- Code Review Actions ---

export async function createReview(data: { title: string; description: string; language: string; }) {
  // Get current user
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.id) {
    throw new Error("User not authenticated");
  }
  
  // Try database first
  try {
    // No need to convert authorId to integer since we're using UUIDs
    
    const newReview = await createReviewInDB({
      ...data,
      authorId: currentUser.id // Use UUID directly
    });
    
    if (newReview) {
      // Log the create review action
      await dbQuery(
        'INSERT INTO audit_log (user_id, action, details) VALUES ($1, $2, $3)',
        [currentUser.id, 'create_review', JSON.stringify({ reviewId: newReview.id })] // Use UUIDs directly
      );
      
      revalidatePath('/code-review');
      return {
        id: newReview.id.toString(), // Convert to string for consistency
        ...data,
        status: 'In Progress',
        authorId: newReview.author_id.toString(), // Convert to string
        author: newReview.author_name,
        authorImage: newReview.author_image,
        comments: [],
        issues: 0,
        reviewers: [
          { id: 'rev-1', name: 'R1', image: 'https://github.com/shadcn.png' },
          { id: 'rev-2', name: 'R2' },
        ],
        timestamp: newReview.created_at,
        currentCode: "",
        codeHistory: [],
        baselineTimeComplexity: undefined,
        baselineSpaceComplexity: undefined,
        baselineLoc: undefined,
      };
    }
  } catch (err) {
    console.warn('Database create review failed, falling back to mock database:', err);
  }

  // Fallback to mock database
  const authorId = currentUser.id;
  
  const newReview: z.infer<typeof ReviewSchema> = {
    id: `review-${reviewIdCounter++}`, // Generate string ID for mock database
    ...data,
    status: 'In Progress',
    authorId: authorId,
    issues: 0,
    reviewers: [
      { id: 'rev-1', name: 'R1', image: 'https://github.com/shadcn.png' },
      { id: 'rev-2', name: 'R2' },
    ],
    timestamp: new Date().toISOString(),
    currentCode: "",
    baselineTimeComplexity: undefined,
    baselineSpaceComplexity: undefined,
    baselineLoc: undefined,
    version: 1, // Add version field with default value
  };
  
  reviews.unshift(newReview);
  globalForDb.reviewIdCounter = reviewIdCounter;
  
  revalidatePath('/code-review');
  return newReview;
}

export async function getReviews(page: number = 1, limit: number = 5, searchQuery: string = "", statusFilter: string = "") {
  // Try database first
  try {
    const dbReviews = await getReviewsFromDB(page, limit, searchQuery, statusFilter);
    const totalCount = await getReviewsCountFromDB(searchQuery, statusFilter);
    
    // Fetch contributors for each review
    const reviewsWithContributors = await Promise.all(
      dbReviews.map(async (review) => {
        const contributors = await getReviewContributors(review.id.toString());
        return {
          ...review,
          contributors
        };
      })
    );
    
    return {
      reviews: reviewsWithContributors.map(review => ({
        id: review.id,
        title: review.title,
        description: review.description,
        language: review.language,
        status: review.status,
        authorId: review.author_id,
        author: review.author_name,
        authorImage: review.author_image,
        issues: 0,
        reviewers: review.contributors || [], // Only show actual contributors, no fallback
        timestamp: review.created_at,
        currentCode: review.current_code || "",
        codeHistory: [],
        baselineTimeComplexity: review.baseline_time_complexity,
        baselineSpaceComplexity: review.baseline_space_complexity,
        baselineLoc: review.baseline_loc ? parseInt(review.baseline_loc) : undefined,
        comments: [], // Initialize as empty array
        commentCount: review.comment_count || 0, // Add comment count
        historyCount: review.history_count || 0, // Add history count
        version: review.version || 1, // Add version field with default value
      })),
      totalCount
    };
  } catch (err) {
    console.warn('Database get reviews failed, falling back to mock database:', err);
  }

  // Fallback to mock database - simulate JOIN queries
  try {
    // Filter reviews based on search query and status filter
    let filteredReviews = [...reviews];
    
    if (searchQuery) {
      filteredReviews = filteredReviews.filter(review => 
        review.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        review.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter && statusFilter !== "all") {
      const statusMap: Record<string, string> = {
        "in-progress": "In Progress",
        "completed": "Completed",
        "pending": "Pending Feedback"
      };
      
      const mappedStatus = statusMap[statusFilter] || statusFilter;
      filteredReviews = filteredReviews.filter(review => review.status === mappedStatus);
    }
    
    // For pagination, we need to slice the filtered reviews array
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);
    
    const reviewsWithDetails = paginatedReviews.map(review => {
      // Simulate JOIN with users table to get author details
      const author = users.find(u => u.id === review.authorId);
      
      // Simulate COUNT queries for comments and history
      const commentCount = comments.filter(c => c.reviewId === review.id).length;
      const historyCount = codeHistory.filter(h => h.reviewId === review.id).length;
      
      // Get actual comments and history for this review
      const reviewComments = comments.filter(c => c.reviewId === review.id);
      const reviewHistory = codeHistory.filter(h => h.reviewId === review.id);
      
      // Extract unique users who made changes to the code, including the author
      const uniqueAuthors = [...new Set(reviewHistory.map(h => h.authorId))]
        .map(authorId => {
          const user = users.find(u => u.id === authorId);
          return user ? { id: user.id, name: user.name, image: user.avatarUrl } : null;
        })
        .filter(Boolean) as { id: string; name: string; image?: string }[];
      
      return {
        ...review,
        author: author?.name || 'Unknown',
        authorImage: author?.avatarUrl || '',
        comments: reviewComments,
        codeHistory: reviewHistory,
        commentCount, // Add comment count
        historyCount, // Add history count
        reviewers: uniqueAuthors || [], // Only show actual contributors, no fallback
        version: review.version || 1, // Add version field with default value
      };
    });
    
    return {
      reviews: JSON.parse(JSON.stringify(reviewsWithDetails)),
      totalCount: filteredReviews.length
    };
  } catch (err) {
    console.error('Error processing mock reviews:', err);
    return {
      reviews: [], // Return empty array as fallback
      totalCount: 0
    };
  }
}

export async function getReviewById(id: string) {
  // Try database first
  try {
    const review = await getReviewByIdFromDB(id);
    if (review) {
      // Get comments for this review
      const dbComments = await getCommentsForReview(id);
      // Get history for this review
      const history = await getReviewHistory(id);
      // Get contributors for this review
      const contributors = await getReviewContributors(id);
      
      return {
        id: review.id,
        title: review.title,
        description: review.description,
        language: review.language,
        status: review.status,
        authorId: review.author_id,
        author: review.author_name,
        authorImage: review.author_image,
        issues: 0,
        reviewers: contributors, // Only show actual contributors, no fallback
        timestamp: review.created_at,
        currentCode: review.current_code || "",
        comments: dbComments.map(comment => ({
          id: comment.id,
          authorId: comment.author_id,
          reviewId: comment.review_id,
          text: comment.text,
          timestamp: comment.created_at,
          author: comment.author_name,  // Added author name
          authorImage: comment.author_image  // Added author image
        })),
        codeHistory: history.map(entry => ({
          id: entry.id,
          code: entry.code,
          timestamp: entry.created_at,
          authorId: entry.author_id,
          reviewId: entry.review_id,
          author: entry.author_name
        })),
        baselineTimeComplexity: review.baseline_time_complexity,
        baselineSpaceComplexity: review.baseline_space_complexity,
        baselineLoc: review.baseline_loc ? parseInt(review.baseline_loc) : undefined,
        version: review.version || 1, // Add version field with default value
      };
    }
  } catch (err) {
    console.warn('Database get review by id failed, falling back to mock database');
  }

  // Fallback to mock database - simulate JOIN queries
  const review = reviews.find(r => r.id === id);
  if (!review) {
    return null;
  }
  
  // Simulate JOIN with users table to get author details
  const author = users.find(u => u.id === review.authorId);
  
  // Simulate JOIN with comments table to get comments with author details
  const reviewComments = comments
    .filter(c => c.reviewId === review.id)
    .map(comment => {
      const commentAuthor = users.find(u => u.id === comment.authorId);
      return {
        ...comment,
        author: commentAuthor?.name || 'Unknown',
        authorImage: commentAuthor?.avatarUrl || ''
      };
    });
  
  // Simulate JOIN with code history table
  const reviewHistory = codeHistory
    .filter(h => h.reviewId === review.id)
    .map(history => {
      const historyAuthor = users.find(u => u.id === history.authorId);
      return {
        ...history,
        author: historyAuthor?.name || 'Unknown'
      };
    });
  
  // Extract unique users who made changes to the code, including the author
  const uniqueAuthors = [...new Set(reviewHistory.map(h => h.authorId))]
    .map(authorId => {
      const user = users.find(u => u.id === authorId);
      return user ? { id: user.id, name: user.name, image: user.avatarUrl } : null;
    })
    .filter(Boolean) as { id: string; name: string; image?: string }[];
  
  return {
    ...review,
    author: author?.name || 'Unknown',
    authorImage: author?.avatarUrl || '',
    comments: reviewComments,
    codeHistory: reviewHistory,
    reviewers: uniqueAuthors, // Only show actual contributors, no fallback
    version: review.version || 1, // Add version field with default value
  };
}

export async function saveCode(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = CodeSaveSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { message: 'Invalid data provided.', success: false };
  }
  
  const { reviewId, code } = validatedFields.data;
  
  // Get current user
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.id) {
    return { message: 'User not authenticated.', success: false };
  }
  
  const authorId = currentUser.id;
  
  // Try database first
  try {
    // No need to convert IDs to integers since we're using UUIDs
    
    // Get the current review to validate against the latest version
    const currentReview = await getReviewById(reviewId);
    if (!currentReview) {
      return { message: 'Review not found.', success: false };
    }
    
    // Debug logging
    console.log('Current review data for save:', {
      id: currentReview.id,
      hasCurrentCode: !!currentReview.currentCode,
      currentCodeLength: currentReview.currentCode ? currentReview.currentCode.length : 0,
      hasBaselineMetrics: !!(currentReview.baselineTimeComplexity && currentReview.baselineSpaceComplexity && currentReview.baselineLoc !== null),
      baselineTimeComplexity: currentReview.baselineTimeComplexity,
      baselineSpaceComplexity: currentReview.baselineSpaceComplexity,
      baselineLoc: currentReview.baselineLoc,
      version: currentReview.version
    });
    
    // Perform analysis on the new code
    const loc = calculateLOC(code);
    const detectedLangResult = await detectLanguage({ code });
    const analysisResult = await analyzeCode({
      code,
      editorLanguage: currentReview.language,
      detectedLanguage: detectedLangResult.language,
      loc,
    });
    
    // Validate that the new code is an improvement over the current database version
    // Only validate if we have saved code (not initial save)
    const hasSavedCode = currentReview.currentCode && currentReview.currentCode.trim() !== "";
    
    if (hasSavedCode && 
        currentReview.baselineTimeComplexity && 
        currentReview.baselineSpaceComplexity && 
        currentReview.baselineLoc !== null && 
        currentReview.baselineLoc !== undefined) {
      
      const savedMetrics: Metrics = {
        time: currentReview.baselineTimeComplexity,
        space: currentReview.baselineSpaceComplexity,
        loc: currentReview.baselineLoc,
      };
      
      const newMetrics: Metrics = {
        time: analysisResult.timeComplexity,
        space: analysisResult.spaceComplexity,
        loc: loc,
      };
      
      // Use the existing isNewCodeAcceptable function which implements the correct priority
      // Time Complexity > Space Complexity > Lines of Code
      const comparison = await isNewCodeAcceptable(newMetrics, savedMetrics);
      
      // Debug logging
      console.log('Save validation comparison:', {
        savedMetrics,
        newMetrics,
        comparisonResult: comparison.result,
        comparisonReason: comparison.reason
      });
      
      if (!comparison.result) {
        return { 
          message: `Save rejected: ${comparison.reason}. Please re-analyze your code against the latest version.`, 
          success: false 
        };
      }
    }
    
    // If validation passes, proceed with the update using version checking
    const updatedReview = await updateReviewCode(reviewId, code, authorId, currentReview.version || 1);
    if (updatedReview) {
      // Update metrics 
      await updateReviewMetrics(reviewId, {
        timeComplexity: analysisResult.timeComplexity,
        spaceComplexity: analysisResult.spaceComplexity,
        loc
      }, currentReview.version || 1);
      
      // Log the save action
      await dbQuery(
        'INSERT INTO audit_log (user_id, action, details) VALUES ($1, $2, $3)',
        [authorId, 'save_code', JSON.stringify({ reviewId: reviewId })] // Use UUIDs directly
      );

      revalidatePath(`/code-review/${reviewId}`);
      revalidatePath('/code-review');
      return { message: 'Code saved successfully!', success: true };
    } else {
      // Check if this is an initial save to provide a better error message
      const reviewCheck = await dbQuery(
        'SELECT current_code FROM reviews WHERE id = $1',
        [reviewId]
      );
      
      if (reviewCheck.rows.length > 0 && reviewCheck.rows[0].current_code === null) {
        // This is an initial save but it failed, which shouldn't happen
        return { 
          message: 'Save failed: Unable to save initial code. Please try again.', 
          success: false 
        };
      } else {
        // This happens when version check fails (concurrent edit)
        return { 
          message: 'Save failed: The code was modified by another user. Please re-analyze your code against the latest version.', 
          success: false 
        };
      }
    }
  } catch (err) {
    console.warn('Database save code failed, falling back to mock database:', err);
  }

  // Fallback to mock database - simulate transaction
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);

  if (reviewIndex === -1) {
    return { message: 'Review not found.', success: false };
  }
  
  const review = reviews[reviewIndex];

  // Simulate transaction: first insert into history, then update review
  // Archive: Save the old code to history
  if (review.currentCode) {
    const historyEntry = {
      id: `history-${historyIdCounter++}`, // Generate string ID for mock database
      reviewId: review.id,
      code: review.currentCode,
      authorId: authorId,
      timestamp: new Date().toISOString()
    };
    
    codeHistory.push(historyEntry);
    globalForDb.historyIdCounter = historyIdCounter;
  }
  
  // Update: Update the review with new code and metrics
  const loc = calculateLOC(code);
  const detectedLangResult = await detectLanguage({ code });
  const analysisResult = await analyzeCode({
    code,
    editorLanguage: review.language,
    detectedLanguage: detectedLangResult.language,
    loc,
  });

  review.currentCode = code;
  review.timestamp = new Date().toISOString();

  // Set the new baseline metrics
  review.baselineTimeComplexity = analysisResult.timeComplexity;
  review.baselineSpaceComplexity = analysisResult.spaceComplexity;
  review.baselineLoc = loc;

  revalidatePath(`/code-review/${reviewId}`);
  revalidatePath('/code-review');
  
  return { message: 'Code saved successfully!', success: true };
}

export async function markReviewAsComplete(reviewId: string) {
  // Get current user
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.id) {
    throw new Error("User not authenticated");
  }
  
  const authorId = currentUser.id;
  
  // Try database first
  try {
    // No need to convert IDs to integers since we're using UUIDs
    
    const updatedReview = await markReviewAsCompleteInDB(reviewId);
    if (updatedReview) {
      // Log the action
      await dbQuery(
        'INSERT INTO audit_log (user_id, action, details) VALUES ($1, $2, $3)',
        [authorId, 'complete_review', JSON.stringify({ reviewId: reviewId })] // Use UUIDs directly
      );
      
      revalidatePath('/code-review');
      revalidatePath(`/code-review/${reviewId}`);
      redirect('/code-review');
    }
  } catch (err) {
    console.warn('Database mark review as complete failed, falling back to mock database:', err);
  }

  // Fallback to mock database
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  if (reviewIndex !== -1) {
    reviews[reviewIndex].status = 'Completed';
    reviews[reviewIndex].timestamp = new Date().toISOString();
  }
  revalidatePath('/code-review');
  revalidatePath(`/code-review/${reviewId}`);
  redirect('/code-review');
}

export async function markReviewAsInProgress(reviewId: string) {
  // Get current user
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.id) {
    throw new Error("User not authenticated");
  }
  
  const authorId = currentUser.id;
  
  // Try database first
  try {
    // No need to convert ID to integer since we're using UUIDs
    
    const updatedReview = await markReviewAsInProgressInDB(reviewId);
    if (updatedReview) {
      revalidatePath('/code-review');
      revalidatePath(`/code-review/${reviewId}`);
      return;
    }
  } catch (err) {
    console.warn('Database mark review as in progress failed, falling back to mock database:', err);
  }

  // Fallback to mock database
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  if (reviewIndex !== -1) {
    reviews[reviewIndex].status = 'In Progress';
    reviews[reviewIndex].timestamp = new Date().toISOString();
    revalidatePath('/code-review');
    revalidatePath(`/code-review/${reviewId}`);
  }
}

export type SmartAnalysisResult = {
  success: boolean;
  message: string;
  analysis?: string;
  newMetrics?: Metrics;
  savedMetrics?: Metrics;
};

export async function performSmartAnalysis(
  reviewId: string,
  code: string,
  editorLanguage: string
): Promise<SmartAnalysisResult> {
  // Always use database first approach
  let review;
  try {
    review = await getReviewById(reviewId);
    if (!review) {
      return { success: false, message: 'Review not found.' };
    }
  } catch (err) {
    console.warn('Database get review by id failed:', err);
    return { success: false, message: 'Failed to fetch review data.' };
  }

  // Debug logging
  console.log('Review data for analysis:', {
    id: review.id,
    hasCurrentCode: !!review.currentCode,
    currentCodeLength: review.currentCode ? review.currentCode.length : 0,
    hasBaselineMetrics: !!(review.baselineTimeComplexity && review.baselineSpaceComplexity && review.baselineLoc !== null),
    baselineTimeComplexity: review.baselineTimeComplexity,
    baselineSpaceComplexity: review.baselineSpaceComplexity,
    baselineLoc: review.baselineLoc
  });

  // Check if there's saved code (this is the correct way to determine if it's an initial analysis)
  const hasSavedCode = review.currentCode && review.currentCode.trim() !== "";

  const loc = calculateLOC(code);
  const detectedLangResult = await detectLanguage({ code });
  const analysisResult = await analyzeCode({
    code,
    editorLanguage,
    detectedLanguage: detectedLangResult.language,
    loc,
  });

  // Debug logging
  console.log('Analysis result:', {
    timeComplexity: analysisResult.timeComplexity,
    spaceComplexity: analysisResult.spaceComplexity,
    loc: loc
  });

  // Check if analysis found issues (N/A metrics indicate problems)
  if (analysisResult.timeComplexity === 'N/A' || analysisResult.spaceComplexity === 'N/A') {
    return {
      success: false,
      message: 'Analysis found issues with your code. Please fix them before saving.',
      analysis: analysisResult.analysis,
      newMetrics: { time: analysisResult.timeComplexity, space: analysisResult.spaceComplexity, loc },
    };
  }

  // If there's no saved code, this is the first analysis
  if (!hasSavedCode) {
    // If analysis is clean, allow initial save
    return {
      success: true,
      message: 'Initial baseline analysis complete. You can now save this version.',
      analysis: analysisResult.analysis,
      newMetrics: { time: analysisResult.timeComplexity, space: analysisResult.spaceComplexity, loc },
    };
  }

  // Existing saved code - perform comparison with baseline metrics
  // Check if baseline metrics exist
  const hasBaselineMetrics = review.baselineTimeComplexity && 
                            review.baselineSpaceComplexity && 
                            review.baselineLoc !== null && 
                            review.baselineLoc !== undefined;

  if (!hasBaselineMetrics) {
    // This shouldn't happen if there's saved code, but just in case
    return {
      success: true,
      message: 'Analysis complete. You can now save this version.',
      analysis: analysisResult.analysis,
      newMetrics: { time: analysisResult.timeComplexity, space: analysisResult.spaceComplexity, loc },
    };
  }

  // Perform comparison with existing baseline
  const savedMetrics: Metrics = {
    time: review.baselineTimeComplexity,
    space: review.baselineSpaceComplexity,
    loc: review.baselineLoc || 0,
  };

  const newMetrics: Metrics = {
    time: analysisResult.timeComplexity,
    space: analysisResult.spaceComplexity,
    loc: loc,
  };

  const comparison = await isNewCodeAcceptable(newMetrics, savedMetrics);

  // Debug logging
  console.log('Comparison result:', {
    savedMetrics,
    newMetrics,
    comparisonResult: comparison.result,
    comparisonReason: comparison.reason
  });

  if (comparison.result) {
    return {
      success: true,
      message: 'Analysis successful. Your changes meet the quality standard and can be saved.',
      analysis: analysisResult.analysis,
      newMetrics,
      savedMetrics,
    };
  } else {
    return {
      success: false,
      message: `Your code is not an improvement. ${comparison.reason}. Save is disabled.`,
      analysis: analysisResult.analysis,
      newMetrics,
      savedMetrics,
    };
  }
}

export async function addComment(reviewId: string, text: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.id) {
    throw new Error("User not authenticated");
  }

  const authorId = currentUser.id;

  // Try database first
  try {
    // No need to convert IDs to integers since we're using UUIDs
    
    const newComment = await addCommentToReview(reviewId, {
      authorId,
      text
    });
    
    if (newComment) {
      revalidatePath(`/code-review/${reviewId}`);
      revalidatePath('/code-review');
      return {
        id: newComment.id.toString(), // Convert to string for consistency
        authorId: newComment.author_id.toString(), // Convert to string
        reviewId: newComment.review_id.toString(), // Convert to string
        author: newComment.author_name,
        authorImage: newComment.author_image,
        text: newComment.text,
        timestamp: newComment.created_at
      };
    }
  } catch (err) {
    console.warn('Database add comment failed, falling back to mock database:', err);
  }

  // Fallback to mock database
  const review = reviews.find(r => r.id === reviewId);
  if (!review) {
    throw new Error("Review not found");
  }

  const newComment: z.infer<typeof CommentSchema> = {
    id: `comment-${commentIdCounter++}`, // Generate string ID for mock database
    reviewId: reviewId,
    authorId: authorId,
    text,
    timestamp: new Date().toISOString(),
  };

  comments.push(newComment);
  globalForDb.commentIdCounter = commentIdCounter;
  
  revalidatePath(`/code-review/${reviewId}`);
  revalidatePath('/code-review');

  return newComment;
}

export async function deleteReview(reviewId: string) {
  // Get current user
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.id) {
    throw new Error("User not authenticated");
  }
  
  const authorId = currentUser.id;
  
  // Try database first
  try {
    // No need to convert IDs to integers since we're using UUIDs
    
    const deletedReview = await deleteReviewFromDB(reviewId);
    if (deletedReview) {
      // Log the action
      await dbQuery(
        'INSERT INTO audit_log (user_id, action, details) VALUES ($1, $2, $3)',
        [authorId, 'delete_review', JSON.stringify({ reviewId: reviewId })] // Use UUIDs directly
      );
      
      revalidatePath('/code-review');
      return;
    }
  } catch (err) {
    console.warn('Database delete review failed, falling back to mock database:', err);
  }

  // Fallback to mock database - simulate ON DELETE CASCADE
  // Remove the review
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  if (reviewIndex !== -1) {
    reviews.splice(reviewIndex, 1);
  }
  
  // Remove associated comments (simulating CASCADE delete)
  globalForDb.comments = comments.filter(c => c.reviewId !== reviewId);
  comments = globalForDb.comments;
  
  // Remove associated code history (simulating CASCADE delete)
  globalForDb.codeHistory = codeHistory.filter(h => h.reviewId !== reviewId);
  codeHistory = globalForDb.codeHistory;
  
  revalidatePath('/code-review');
}
