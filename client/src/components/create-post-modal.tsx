import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ContentEditor } from '@/components/content-editor';
import { PostPreview } from '@/components/post-preview';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { User, Platform } from '@shared/schema';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  initialScheduleDate?: Date;
  initialScheduleTime?: string;
}

export function CreatePostModal({
  isOpen,
  onClose,
  user,
  initialScheduleDate,
  initialScheduleTime
}: CreatePostModalProps) {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialScheduleDate);
  const [selectedTime, setSelectedTime] = useState(initialScheduleTime || '12:00');
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [approvalWorkflow, setApprovalWorkflow] = useState('none');
  const [selectedPreviewPlatform, setSelectedPreviewPlatform] = useState<number | null>(null);

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setContent('');
      setSelectedDate(initialScheduleDate);
      setSelectedTime(initialScheduleTime || '12:00');
      setSelectedPlatforms([]);
      setApprovalWorkflow('none');
    }
  }, [isOpen, initialScheduleDate, initialScheduleTime]);

  // Fetch platforms
  const { data: platforms, isLoading: isLoadingPlatforms } = useQuery<Platform[]>({
    queryKey: ['/api/platforms'],
  });

  // Fetch users for approval workflow
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Set first platform as preview platform when platforms are loaded
  useEffect(() => {
    if (platforms && platforms.length > 0 && selectedPreviewPlatform === null) {
      setSelectedPreviewPlatform(platforms[0].id);
    }
  }, [platforms, selectedPreviewPlatform]);

  // Handle platform selection in preview
  const handlePreviewPlatformChange = (platformId: string) => {
    setSelectedPreviewPlatform(parseInt(platformId));
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (status: string) => {
      // Determine the status based on approval workflow
      let postStatus = status;
      if (status === 'scheduled' && approvalWorkflow !== 'none') {
        postStatus = 'needs_approval';
      }

      // Combine date and time for scheduling
      let scheduledFor: Date | undefined = undefined;
      if (selectedDate) {
        scheduledFor = new Date(selectedDate);
        if (selectedTime) {
          const [hours, minutes] = selectedTime.split(':').map(Number);
          scheduledFor.setHours(hours, minutes);
        }
      }

      return apiRequest('POST', '/api/posts', {
        content,
        scheduledFor: scheduledFor ? scheduledFor.toISOString() : null,
        status: postStatus,
        createdBy: user.id,
        platforms: selectedPlatforms,
        approvedBy: approvalWorkflow === 'none' ? user.id : null,
        mediaUrls: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Success",
        description: "Your post has been successfully created",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle save as draft
  const handleSaveAsDraft = () => {
    createPostMutation.mutate('draft');
  };

  // Handle schedule post
  const handleSchedulePost = () => {
    if (!content) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date for scheduling",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate('scheduled');
  };

  // Loading states
  const isLoading = isLoadingPlatforms || isLoadingUsers || createPostMutation.isPending;

  // Find the selected platform for preview
  const selectedPlatform = platforms?.find(p => p.id === selectedPreviewPlatform);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">Create New Post</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {/* Content Editor */}
          <ContentEditor
            initialContent={content}
            initialScheduleDate={selectedDate}
            initialScheduleTime={selectedTime}
            initialSelectedPlatforms={selectedPlatforms}
            platforms={platforms || []}
            onContentChange={setContent}
            onScheduleChange={(date, time) => {
              setSelectedDate(date);
              setSelectedTime(time);
            }}
            onPlatformsChange={setSelectedPlatforms}
          />

          {/* Platform Preview */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Preview</label>
            <div className="flex space-x-4 mb-2">
              <Select 
                value={selectedPreviewPlatform?.toString()} 
                onValueChange={handlePreviewPlatformChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms?.map(platform => (
                    <SelectItem key={platform.id} value={platform.id.toString()}>
                      <div className="flex items-center">
                        <i 
                          className={`${platform.icon} mr-2`} 
                          style={{ color: platform.color }}
                        ></i>
                        {platform.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPlatform && (
              <PostPreview
                content={content}
                platform={selectedPlatform}
                user={user}
              />
            )}
          </div>

          {/* Approval Workflow */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Approval Workflow</label>
            <Select value={approvalWorkflow} onValueChange={setApprovalWorkflow}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select approval workflow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No approval needed (publish directly)</SelectItem>
                <SelectItem value="any">Require approval from any team member</SelectItem>
                {users?.filter(u => u.id !== user.id).map(u => (
                  <SelectItem key={u.id} value={`user_${u.id}`}>
                    Require approval from {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-3 px-6 pb-6">
          <Button 
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={isLoading}
          >
            Save as Draft
          </Button>
          <Button 
            onClick={handleSchedulePost}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              'Schedule Post'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
