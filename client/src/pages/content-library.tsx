import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Post, User, Platform } from '@shared/schema';
import { MoreVertical, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { CreatePostModal } from '@/components/create-post-modal';
import { format } from 'date-fns';

export default function ContentLibrary() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState("all");
  const { toast } = useToast();

  // Fetch all posts
  const { data: posts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });

  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch all platforms
  const { data: platforms, isLoading: isLoadingPlatforms } = useQuery<Platform[]>({
    queryKey: ['/api/platforms'],
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('DELETE', `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approve post mutation
  const approvePostMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: number, userId: number }) => {
      return apiRequest('PUT', `/api/posts/${postId}`, {
        status: "approved",
        approvedBy: userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Post approved",
        description: "The post has been successfully approved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter posts by tab
  const filteredPosts = posts?.filter(post => {
    if (tabValue === "all") return true;
    return post.status === tabValue;
  }) || [];

  // Helper function to get user by ID
  const getUserById = (userId: number) => {
    return users?.find(user => user.id === userId);
  };

  // Helper function to get platform by ID
  const getPlatformById = (platformId: number) => {
    return platforms?.find(platform => platform.id === platformId);
  };

  // Get badge for post status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'scheduled':
        return <Badge variant="info">Scheduled</Badge>;
      case 'published':
        return <Badge variant="success">Published</Badge>;
      case 'needs_approval':
        return <Badge variant="warning">Awaiting Approval</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Handle delete post
  const handleDelete = (postId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };

  // Handle approve post
  const handleApprove = (postId: number) => {
    if (users && users.length > 0) {
      approvePostMutation.mutate({ postId, userId: users[0].id });
    }
  };

  // Loading state
  const isLoading = isLoadingPosts || isLoadingUsers || isLoadingPlatforms;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading content library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Content Library</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create New Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="needs_approval">Approval</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No posts found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredPosts.map((post) => {
                const creator = getUserById(post.createdBy);
                const platformIcons = (post.platforms as number[]).map(platformId => {
                  const platform = getPlatformById(platformId);
                  return platform ? (
                    <i 
                      key={platform.id} 
                      className={`${platform.icon} mr-1 text-lg`}
                      style={{ color: platform.color }}
                    ></i>
                  ) : null;
                });

                return (
                  <div key={post.id} className="py-4 hover:bg-slate-50 transition-colors rounded-md px-3">
                    <div className="flex items-start">
                      {creator && (
                        <Avatar className="mr-3 h-10 w-10">
                          <AvatarImage src={creator.avatar} alt={creator.name} />
                          <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {post.content.substring(0, 50)}
                              {post.content.length > 50 ? '...' : ''}
                            </p>
                            <div className="mt-1 flex items-center text-xs text-slate-500">
                              <span className="font-mono">
                                {post.scheduledFor ? format(new Date(post.scheduledFor), 'MMM d, yyyy • h:mm a') : 'No schedule'}
                              </span>
                              <span className="mx-1">•</span>
                              <div className="flex items-center">
                                {platformIcons}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(post.status)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {post.status === 'needs_approval' && (
                                  <DropdownMenuItem onClick={() => handleApprove(post.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    <span>Approve</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(post.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-slate-700">{post.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {users && users.length > 0 && (
        <CreatePostModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          user={users[0]}
        />
      )}
    </div>
  );
}
