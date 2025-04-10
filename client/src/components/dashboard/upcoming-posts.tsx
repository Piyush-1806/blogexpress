import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Post, User, Platform } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Edit, Trash2, MoreVertical } from 'lucide-react';

interface UpcomingPostsProps {
  posts: Post[];
  users: User[];
}

export function UpcomingPosts({ posts, users }: UpcomingPostsProps) {
  const { toast } = useToast();
  
  // Fetch platforms
  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ['/api/platforms'],
  });
  
  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('DELETE', `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/status/scheduled'] });
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
  
  // Sort posts by scheduled date (most recent first)
  const sortedPosts = [...posts].sort((a, b) => {
    if (!a.scheduledFor) return 1;
    if (!b.scheduledFor) return -1;
    return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
  }).slice(0, 3); // Limit to 3 posts
  
  // Helper function to get user by ID
  const getUserById = (userId: number) => {
    return users.find(user => user.id === userId);
  };
  
  // Helper function to get platform by ID
  const getPlatformById = (platformId: number) => {
    return platforms?.find(platform => platform.id === platformId);
  };
  
  // Helper function to handle deletion
  const handleDelete = (postId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };
  
  return (
    <Card>
      <CardHeader className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">Upcoming Posts</CardTitle>
          <Button variant="link" size="sm" className="text-primary hover:text-indigo-700 font-medium">View All</Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-slate-200">
          {sortedPosts.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No upcoming posts scheduled
            </div>
          ) : (
            sortedPosts.map(post => {
              // Get the first platform for the icon
              const platformId = (post.platforms as number[])[0];
              const platform = getPlatformById(platformId);
              
              // Get creator and approver
              const creator = getUserById(post.createdBy);
              const approver = post.approvedBy ? getUserById(post.approvedBy) : null;
              
              return (
                <div key={post.id} className="p-4 social-card hover:bg-slate-50">
                  <div className="flex items-start">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: platform ? `${platform.color}20` : '#4f46e520',
                      }}
                    >
                      {platform && <i className={platform.icon} style={{ color: platform.color }}></i>}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-slate-800">
                            {post.content.substring(0, 30)}
                            {post.content.length > 30 ? '...' : ''}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            <span className="font-mono">
                              {post.scheduledFor ? format(new Date(post.scheduledFor), 'MMM d, yyyy • h:mm a') : 'No schedule'}
                            </span>
                            {platform && (
                              <>
                                <span className="mx-1">•</span>
                                <span style={{ color: platform.color }}>{platform.name}</span>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
                      <p className="text-sm text-slate-600 mt-2">{post.content}</p>
                      
                      {/* Media preview would go here in a real app */}
                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-2">
                          <div className="text-xs font-medium text-slate-500 mb-2">Image Preview</div>
                          <div className="rounded-md bg-slate-200 h-32 flex items-center justify-center">
                            <i className="ri-image-2-line text-3xl text-slate-400"></i>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center mt-3">
                        {post.status === 'approved' ? (
                          <Badge variant="success">Approved</Badge>
                        ) : post.status === 'needs_approval' ? (
                          <Badge variant="warning">Awaiting Approval</Badge>
                        ) : (
                          <Badge variant="info">Scheduled</Badge>
                        )}
                        
                        {post.status === 'approved' && approver && (
                          <span className="text-xs text-slate-500 ml-3">
                            Approved by <span className="font-medium text-slate-700">{approver.name}</span>
                          </span>
                        )}
                        
                        {post.status === 'needs_approval' && (
                          <span className="text-xs text-slate-500 ml-3">
                            Sent to <span className="font-medium text-slate-700">Team Leads</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
