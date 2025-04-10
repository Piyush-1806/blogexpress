import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Post, Platform, User } from '@shared/schema';

// This hook provides common functionality for social media management
export function useSocialMedia() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('week');

  // Fetch all posts
  const { 
    data: posts,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
    error: errorPosts
  } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });

  // Fetch all platforms
  const {
    data: platforms,
    isLoading: isLoadingPlatforms,
    isError: isErrorPlatforms,
    error: errorPlatforms
  } = useQuery<Platform[]>({
    queryKey: ['/api/platforms'],
  });

  // Fetch all users
  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: errorUsers
  } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch dashboard stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    error: errorStats
  } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Calculate date range based on selected date and view type
  const getDateRange = () => {
    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);
    
    if (viewType === 'day') {
      // Just the selected date
    } else if (viewType === 'week') {
      // Adjust to start of week (Sunday)
      startDate.setDate(selectedDate.getDate() - selectedDate.getDay());
      // End of week (Saturday)
      endDate.setDate(startDate.getDate() + 6);
    } else if (viewType === 'month') {
      // Start of month
      startDate.setDate(1);
      // End of month
      endDate.setMonth(selectedDate.getMonth() + 1);
      endDate.setDate(0);
    }
    
    return { startDate, endDate };
  };

  // Filter posts by date range
  const getPostsInDateRange = () => {
    if (!posts) return [];
    
    const { startDate, endDate } = getDateRange();
    
    return posts.filter(post => {
      if (!post.scheduledFor) return false;
      const postDate = new Date(post.scheduledFor);
      return postDate >= startDate && postDate <= endDate;
    });
  };

  // Get posts by status
  const getPostsByStatus = (status: string) => {
    if (!posts) return [];
    return posts.filter(post => post.status === status);
  };

  // Helper to get user by ID
  const getUserById = (userId: number) => {
    return users?.find(user => user.id === userId);
  };

  // Helper to get platform by ID
  const getPlatformById = (platformId: number) => {
    return platforms?.find(platform => platform.id === platformId);
  };

  // Loading and error states
  const isLoading = isLoadingPosts || isLoadingPlatforms || isLoadingUsers || isLoadingStats;
  const isError = isErrorPosts || isErrorPlatforms || isErrorUsers || isErrorStats;
  const error = errorPosts || errorPlatforms || errorUsers || errorStats;

  return {
    // Data
    posts,
    platforms,
    users,
    stats,
    
    // Date and view controls
    selectedDate,
    setSelectedDate,
    viewType,
    setViewType,
    getDateRange,
    
    // Helpers
    getPostsInDateRange,
    getPostsByStatus,
    getUserById,
    getPlatformById,
    
    // Status
    isLoading,
    isError,
    error
  };
}
