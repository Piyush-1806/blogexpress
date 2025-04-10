import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { Post, User, Comment, Category, InsertComment } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

interface BlogPostProps {
  slug: string;
}

export default function BlogPost({ slug }: BlogPostProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);

  // Fetch the post by slug
  const { data: post, isLoading: postLoading, error: postError } = useQuery<Post>({
    queryKey: ['/api/posts/slug', slug],
    queryFn: () => apiRequest(`/api/posts/slug/${slug}`),
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!post,
  });

  // Fetch the author
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: !!post,
  });

  // Fetch comments for this post
  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ['/api/comments/post', post?.id],
    queryFn: () => apiRequest(`/api/comments/post/${post?.id}`),
    enabled: !!post?.id,
  });

  // Get current user (for commenting)
  const currentUser = users && users.length > 0 ? users[0] : null;

  // Get the author of this post
  const author = post?.authorId ? users?.find(u => u.id === post.authorId) : null;

  // Get category name
  const category = post?.categoryId ? categories?.find(c => c.id === post.categoryId) : null;

  // Comment form schema
  const commentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
  });

  // Comment form
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{ content: string }>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  // Add comment mutation
  const addComment = useMutation({
    mutationFn: async (data: { content: string, postId: number, authorId: number, parentId?: number }) => {
      return apiRequest('/api/comments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments/post', post?.id] });
      reset();
      setShowReplyForm(null);
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle comment submission
  const onSubmitComment = (data: { content: string }, parentId?: number) => {
    if (!post?.id || !currentUser?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to comment.",
        variant: "destructive",
      });
      return;
    }

    const commentData = {
      content: data.content,
      postId: post.id,
      authorId: currentUser.id,
      ...(parentId && { parentId }),
    };

    addComment.mutate(commentData);
  };

  // Format date
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return format(new Date(date), 'MMMM dd, yyyy');
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Render top-level comments and their replies
  const renderComments = () => {
    if (!comments || comments.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        </div>
      );
    }

    // Get top-level comments
    const topLevelComments = comments.filter(comment => !comment.parentId);
    
    return (
      <div className="space-y-6">
        {topLevelComments.map(comment => {
          const commentAuthor = users?.find(u => u.id === comment.authorId);
          const replies = comments.filter(c => c.parentId === comment.id);
          
          return (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={commentAuthor?.avatar || ""} />
                  <AvatarFallback>{getInitials(commentAuthor?.name || "Anonymous")}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-medium">{commentAuthor?.name || "Anonymous"}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                  
                  {currentUser && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowReplyForm(prev => prev === comment.id ? null : comment.id)}
                      >
                        {showReplyForm === comment.id ? "Cancel" : "Reply"}
                      </Button>
                    </div>
                  )}
                  
                  {showReplyForm === comment.id && (
                    <div className="mt-3">
                      <form onSubmit={handleSubmit(data => onSubmitComment(data, comment.id))}>
                        <Textarea 
                          className="min-h-[80px]"
                          placeholder="Write your reply..."
                          {...register("content")}
                        />
                        {errors.content && (
                          <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
                        )}
                        <div className="flex justify-end mt-2">
                          <Button type="submit" size="sm" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Reply"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="mt-4 pl-6 border-l border-gray-200 space-y-4">
                      {replies.map(reply => {
                        const replyAuthor = users?.find(u => u.id === reply.authorId);
                        return (
                          <div key={reply.id} className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={replyAuthor?.avatar || ""} />
                              <AvatarFallback>{getInitials(replyAuthor?.name || "Anonymous")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center mb-1">
                                <span className="font-medium">{replyAuthor?.name || "Anonymous"}</span>
                                <span className="text-gray-500 text-sm ml-2">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-700">{reply.content}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Show error if post not found
  if (postError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
        <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or may have been removed.</p>
        <Button onClick={() => setLocation("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {postLoading ? (
        // Skeleton loading
        <div>
          <Skeleton className="h-10 w-3/4 mb-3" />
          <div className="flex items-center gap-2 mb-8">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ) : post ? (
        <>
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-3">
              {category && (
                <Link href={`/categories/${category.slug}`}>
                  <Badge variant="outline" className="cursor-pointer">
                    {category.name}
                  </Badge>
                </Link>
              )}
              {post.tags && post.tags.length > 0 && post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex items-center space-x-3 mb-8">
              {author && (
                <>
                  <Avatar>
                    <AvatarImage src={author.avatar || ""} />
                    <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/author/${author.id}`}>
                      <a className="font-medium text-gray-900 hover:text-indigo-600">
                        {author.name}
                      </a>
                    </Link>
                    <div className="text-sm text-gray-500">
                      {formatDate(post.publishedAt)}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {post.featuredImage && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-auto"
                />
              </div>
            )}
            
            {/* Post content - simple version, could be enhanced with markdown parsing */}
            <div className="prose prose-indigo max-w-none mb-10">
              {post.content.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
          
          {/* Comments section */}
          <div className="mt-12">
            <Separator className="mb-8" />
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>
            
            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <>
                {renderComments()}
                
                {/* Comment form */}
                {currentUser ? (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Leave a comment</h3>
                    <form onSubmit={handleSubmit(onSubmitComment)}>
                      <Textarea 
                        className="min-h-[120px]"
                        placeholder="Share your thoughts..."
                        {...register("content")}
                      />
                      {errors.content && (
                        <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
                      )}
                      <div className="flex justify-end mt-3">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Submitting..." : "Post Comment"}
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600 mb-3">You need to sign in to leave a comment.</p>
                    <Link href="/login">
                      <Button>Sign In</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}