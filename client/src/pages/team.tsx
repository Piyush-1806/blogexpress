import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, TeamActivity } from '@shared/schema';
import { format } from 'date-fns';

export default function Team() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Fetch team activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery<TeamActivity[]>({
    queryKey: ['/api/team-activities'],
  });
  
  // Get user by ID
  const getUserById = (userId: number) => {
    return users?.find(user => user.id === userId);
  };
  
  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Badge variant="secondary">Admin</Badge>;
      case 'editor':
        return <Badge variant="info">Editor</Badge>;
      case 'viewer':
        return <Badge>Viewer</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };
  
  // Loading state
  const isLoading = isLoadingUsers || isLoadingActivities;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading team data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>Invite Team Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a new team member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="colleague@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsInviteDialogOpen(false)}>Send Invitation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-200">
                {users?.map(user => (
                  <div key={user.id} className="flex items-center justify-between py-4 px-6">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getRoleBadge(user.role)}
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-8">
                {activities?.slice(0, 10).map(activity => {
                  const user = getUserById(activity.userId);
                  if (!user) return null;
                  
                  return (
                    <div key={activity.id} className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium text-slate-900">{user.name}</span>
                          <span className="text-slate-600"> {activity.action} </span>
                          <span className="font-medium text-slate-900">Post #{activity.postId}</span>
                          {activity.comment && (
                            <span className="text-slate-600"> with comment: "{activity.comment}"</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(activity.createdAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Admin</h3>
                  <p className="text-sm text-slate-500">
                    Full access to all features including user management, platform connections, analytics, and content approval.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Editor</h3>
                  <p className="text-sm text-slate-500">
                    Can create, edit, and schedule content. Can approve content created by other editors or viewers.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Viewer</h3>
                  <p className="text-sm text-slate-500">
                    Can create and edit content but must submit for approval. Can view analytics but cannot modify settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
