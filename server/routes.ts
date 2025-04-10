import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCategorySchema, 
  insertPostSchema, 
  insertCommentSchema 
} from "@shared/schema";
import { z } from "zod";
import { WebSocketServer } from "ws";

// Extension for date validations
const dateSchema = z.preprocess((arg) => {
  if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
  return arg;
}, z.date());

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Temporarily disable WebSocket for testing
  const broadcast = (type: string, data: any) => {
    console.log(`Would broadcast: ${type} with data:`, data);
  };

  // ================ User endpoints ================
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error: (error as Error).message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error: (error as Error).message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data", errors: result.error.format() });
      }
      
      const existingByUsername = await storage.getUserByUsername(result.data.username);
      if (existingByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingByEmail = await storage.getUserByEmail(result.data.email);
      if (existingByEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const user = await storage.createUser(result.data);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user", error: (error as Error).message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const result = insertUserSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data", errors: result.error.format() });
      }
      
      // Check for username uniqueness if being updated
      if (result.data.username && result.data.username !== user.username) {
        const existingByUsername = await storage.getUserByUsername(result.data.username);
        if (existingByUsername) {
          return res.status(400).json({ message: "Username already taken" });
        }
      }
      
      // Check for email uniqueness if being updated
      if (result.data.email && result.data.email !== user.email) {
        const existingByEmail = await storage.getUserByEmail(result.data.email);
        if (existingByEmail) {
          return res.status(400).json({ message: "Email already registered" });
        }
      }
      
      const updatedUser = await storage.updateUser(id, result.data);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user", error: (error as Error).message });
    }
  });

  // ================ Category endpoints ================
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories", error: (error as Error).message });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category", error: (error as Error).message });
    }
  });

  app.get("/api/categories/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const category = await storage.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category", error: (error as Error).message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const result = insertCategorySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid category data", errors: result.error.format() });
      }
      
      // Check for slug uniqueness
      const existingBySlug = await storage.getCategoryBySlug(result.data.slug);
      if (existingBySlug) {
        return res.status(400).json({ message: "Category slug already exists" });
      }
      
      const category = await storage.createCategory(result.data);
      broadcast("category_created", category);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category", error: (error as Error).message });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const result = insertCategorySchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid category data", errors: result.error.format() });
      }
      
      // Check for slug uniqueness if being updated
      if (result.data.slug && result.data.slug !== category.slug) {
        const existingBySlug = await storage.getCategoryBySlug(result.data.slug);
        if (existingBySlug) {
          return res.status(400).json({ message: "Category slug already exists" });
        }
      }
      
      const updatedCategory = await storage.updateCategory(id, result.data);
      broadcast("category_updated", updatedCategory);
      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category", error: (error as Error).message });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Check if there are posts in this category
      const postsInCategory = await storage.getPostsByCategory(id);
      if (postsInCategory.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete category with existing posts",
          count: postsInCategory.length
        });
      }
      
      const deleted = await storage.deleteCategory(id);
      
      if (deleted) {
        broadcast("category_deleted", { id });
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to delete category" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category", error: (error as Error).message });
    }
  });

  // ================ Post endpoints ================
  app.get("/api/posts", async (_req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts", error: (error as Error).message });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post", error: (error as Error).message });
    }
  });

  app.get("/api/posts/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const post = await storage.getPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post", error: (error as Error).message });
    }
  });

  app.get("/api/posts/status/:status", async (req, res) => {
    try {
      const status = req.params.status;
      const posts = await storage.getPostsByStatus(status);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts by status", error: (error as Error).message });
    }
  });

  app.get("/api/posts/author/:authorId", async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      const posts = await storage.getPostsByAuthor(authorId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts by author", error: (error as Error).message });
    }
  });

  app.get("/api/posts/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const posts = await storage.getPostsByCategory(categoryId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts by category", error: (error as Error).message });
    }
  });

  app.get("/api/posts/tag/:tag", async (req, res) => {
    try {
      const tag = req.params.tag;
      const posts = await storage.getPostsByTag(tag);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts by tag", error: (error as Error).message });
    }
  });

  app.get("/api/posts/recent/:limit", async (req, res) => {
    try {
      const limit = parseInt(req.params.limit) || 5;
      const posts = await storage.getRecentPosts(limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent posts", error: (error as Error).message });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const result = insertPostSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid post data", errors: result.error.format() });
      }
      
      // Check for slug uniqueness
      const existingBySlug = await storage.getPostBySlug(result.data.slug);
      if (existingBySlug) {
        return res.status(400).json({ message: "Post slug already exists" });
      }
      
      // Verify category exists
      const category = await storage.getCategory(result.data.categoryId);
      if (!category) {
        return res.status(400).json({ message: "Invalid category" });
      }
      
      // Verify author exists
      const author = await storage.getUser(result.data.authorId);
      if (!author) {
        return res.status(400).json({ message: "Invalid author" });
      }
      
      // If status is published, set publishedAt
      let postData = result.data;
      if (postData.status === 'published' && !postData.publishedAt) {
        postData = { ...postData, publishedAt: new Date() };
      }
      
      const post = await storage.createPost(postData);
      broadcast("post_created", post);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post", error: (error as Error).message });
    }
  });

  app.put("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const result = insertPostSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid post data", errors: result.error.format() });
      }
      
      // Check for slug uniqueness if being updated
      if (result.data.slug && result.data.slug !== post.slug) {
        const existingBySlug = await storage.getPostBySlug(result.data.slug);
        if (existingBySlug) {
          return res.status(400).json({ message: "Post slug already exists" });
        }
      }
      
      // If status is changed to published, set publishedAt if it doesn't exist
      let postData = result.data;
      if (postData.status === 'published' && post.status !== 'published' && !post.publishedAt) {
        postData = { ...postData, publishedAt: new Date() };
      }
      
      const updatedPost = await storage.updatePost(id, postData);
      broadcast("post_updated", updatedPost);
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post", error: (error as Error).message });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check for comments on this post
      const comments = await storage.getCommentsByPost(id);
      // Delete all comments first
      if (comments.length > 0) {
        for (const comment of comments) {
          await storage.deleteComment(comment.id);
        }
      }
      
      const deleted = await storage.deletePost(id);
      
      if (deleted) {
        broadcast("post_deleted", { id });
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to delete post" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post", error: (error as Error).message });
    }
  });

  // ================ Comment endpoints ================
  app.get("/api/comments", async (_req, res) => {
    try {
      const comments = await storage.getComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments", error: (error as Error).message });
    }
  });

  app.get("/api/comments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comment = await storage.getComment(id);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comment", error: (error as Error).message });
    }
  });

  app.get("/api/comments/post/:postId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPost(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments by post", error: (error as Error).message });
    }
  });

  app.get("/api/comments/author/:authorId", async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      const comments = await storage.getCommentsByAuthor(authorId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments by author", error: (error as Error).message });
    }
  });

  app.get("/api/comments/replies/:parentId", async (req, res) => {
    try {
      const parentId = parseInt(req.params.parentId);
      const comments = await storage.getCommentReplies(parentId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comment replies", error: (error as Error).message });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const result = insertCommentSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid comment data", errors: result.error.format() });
      }
      
      // Verify post exists
      const post = await storage.getPost(result.data.postId);
      if (!post) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Verify author exists
      const author = await storage.getUser(result.data.authorId);
      if (!author) {
        return res.status(400).json({ message: "Invalid author ID" });
      }
      
      // Verify parent exists if specified
      if (result.data.parentId) {
        const parent = await storage.getComment(result.data.parentId);
        if (!parent) {
          return res.status(400).json({ message: "Invalid parent comment ID" });
        }
      }
      
      const comment = await storage.createComment(result.data);
      broadcast("comment_created", comment);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create comment", error: (error as Error).message });
    }
  });

  app.put("/api/comments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comment = await storage.getComment(id);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      const result = insertCommentSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid comment data", errors: result.error.format() });
      }
      
      const updatedComment = await storage.updateComment(id, result.data);
      broadcast("comment_updated", updatedComment);
      res.json(updatedComment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update comment", error: (error as Error).message });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comment = await storage.getComment(id);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Delete all replies first
      const replies = await storage.getCommentReplies(id);
      for (const reply of replies) {
        await storage.deleteComment(reply.id);
      }
      
      const deleted = await storage.deleteComment(id);
      
      if (deleted) {
        broadcast("comment_deleted", { id });
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to delete comment" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment", error: (error as Error).message });
    }
  });

  // Dashboard stats for blog
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const publishedPosts = (await storage.getPostsByStatus("published")).length;
      const draftPosts = (await storage.getPostsByStatus("draft")).length;
      const totalComments = (await storage.getComments()).length;
      const totalCategories = (await storage.getCategories()).length;
      const totalUsers = (await storage.getUsers()).length;
      
      res.json({
        posts: {
          published: publishedPosts,
          drafts: draftPosts,
          total: publishedPosts + draftPosts
        },
        comments: totalComments,
        categories: totalCategories,
        users: totalUsers
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats", error: (error as Error).message });
    }
  });

  return httpServer;
}
