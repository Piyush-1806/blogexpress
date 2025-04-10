import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TeamActivity as TeamActivityType, User, Post } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface TeamActivityProps {
  activities: TeamActivityType[];
  users: User[];
}

export function TeamActivity({ activities, users }: TeamActivityProps) {
  // Fetch posts for context
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });
  
  // Sort activities by most recent first
  const sortedActivities = [...activities].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 3); // Limit to 3 activities
  
  // Helper function to get user by ID
  const getUserById = (userId: number) => {
    return users.find(user => user.id === userId);
  };
  
  // Helper function to get post by ID
  const getPostById = (postId: number) => {
    return posts?.find(post => post.id === postId);
  };
  
  // Helper to format the activity action
  const formatAction = (action: string) => {
    switch (action) {
      case 'created':
        return 'created';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'commented':
        return 'commented on';
      default:
        return action;
    }
  };
  
  // Helper to format the activity time
  const formatActivityTime = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Card className="bg-white rounded-lg shadow border border-slate-200">
      <CardHeader className="p-4 border-b border-slate-200">
        <CardTitle className="text-lg font-semibold text-slate-800">Team Activity</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          {sortedActivities.length === 0 ? (
            <div className="text-center text-slate-500 py-4">
              No team activity to display
            </div>
          ) : (
            sortedActivities.map(activity => {
              const user = getUserById(activity.userId);
              const post = getPostById(activity.postId);
              
              if (!user) return null;
              
              return (
                <div key={activity.id} className="flex items-start">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-slate-800">{user.name}</span>
                      <span className="text-slate-600"> {formatAction(activity.action)} </span>
                      <span className="font-medium text-slate-800">
                        {post ? (
                          post.content.substring(0, 15) + (post.content.length > 15 ? '...' : '')
                        ) : (
                          `Post #${activity.postId}`
                        )}
                      </span>
                      {activity.comment && (
                        <>
                          <span className="text-slate-600">: </span>
                          <span className="text-slate-600 italic">"{activity.comment}"</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatActivityTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <Button variant="secondary" className="w-full">
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
