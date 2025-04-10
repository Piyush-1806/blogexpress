import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  posts, type Post, type InsertPost,
  comments, type Comment, type InsertComment
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, asc, desc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPosts(): Promise<Post[]>;
  getPostsByStatus(status: string): Promise<Post[]>;
  getPostsByAuthor(userId: number): Promise<Post[]>;
  getPostsByCategory(categoryId: number): Promise<Post[]>;
  getRecentPosts(limit: number): Promise<Post[]>;
  getPostsByTag(tag: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Comment operations
  getComment(id: number): Promise<Comment | undefined>;
  getComments(): Promise<Comment[]>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
  getCommentsByAuthor(authorId: number): Promise<Comment[]>;
  getCommentReplies(parentId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [createdCategory] = await db.insert(categories).values(category).returning();
    return createdCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    return result.length > 0;
  }

  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }

  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async getPostsByStatus(status: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.status, status))
      .orderBy(desc(posts.createdAt));
  }

  async getPostsByAuthor(authorId: number): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, authorId))
      .orderBy(desc(posts.createdAt));
  }

  async getPostsByCategory(categoryId: number): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.categoryId, categoryId))
      .orderBy(desc(posts.createdAt));
  }

  async getRecentPosts(limit: number): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.status, 'published'))
      .orderBy(desc(posts.publishedAt))
      .limit(limit);
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(sql`${posts.tags} @> ${JSON.stringify([tag])}`)
      .orderBy(desc(posts.createdAt));
  }

  async createPost(post: InsertPost): Promise<Post> {
    // Set updatedAt to the current time
    const postWithUpdatedAt = {
      ...post,
      updatedAt: new Date()
    };
    // Make sure tags are properly handled as an array
    if (postWithUpdatedAt.tags && !Array.isArray(postWithUpdatedAt.tags)) {
      postWithUpdatedAt.tags = Array.from(postWithUpdatedAt.tags as any);
    }
    const [createdPost] = await db.insert(posts).values(postWithUpdatedAt).returning();
    return createdPost;
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined> {
    // Always update the updatedAt field
    const postWithUpdatedAt = {
      ...post,
      updatedAt: new Date()
    };
    
    // Make sure tags are properly handled as an array
    if (postWithUpdatedAt.tags && !Array.isArray(postWithUpdatedAt.tags)) {
      postWithUpdatedAt.tags = Array.from(postWithUpdatedAt.tags as any);
    }
    
    const [updatedPost] = await db
      .update(posts)
      .set(postWithUpdatedAt)
      .where(eq(posts.id, id))
      .returning();
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning({ id: posts.id });
    return result.length > 0;
  }

  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async getComments(): Promise<Comment[]> {
    return await db.select().from(comments).orderBy(desc(comments.createdAt));
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));
  }

  async getCommentsByAuthor(authorId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.authorId, authorId))
      .orderBy(desc(comments.createdAt));
  }

  async getCommentReplies(parentId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.parentId, parentId))
      .orderBy(asc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [createdComment] = await db.insert(comments).values(comment).returning();
    return createdComment;
  }

  async updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment | undefined> {
    const [updatedComment] = await db
      .update(comments)
      .set(comment)
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({ id: comments.id });
    return result.length > 0;
  }
}

// Initialize database storage
export const storage = new DatabaseStorage();
