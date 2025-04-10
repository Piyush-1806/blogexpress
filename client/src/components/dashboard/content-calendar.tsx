import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Post, User, Platform } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface ContentCalendarProps {
  posts: Post[];
  users: User[];
}

export function ContentCalendar({ posts, users }: ContentCalendarProps) {
  // Get current date information for the calendar display
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Fetch platforms for rendering post icons
  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ['/api/platforms'],
  });

  // Generate calendar days for the current week
  const generateCalendarDays = () => {
    const days = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        date,
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isToday: date.toDateString() === today.toDateString(),
      });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  // Find posts for a specific day
  const getPostsForDay = (date: Date) => {
    return posts.filter(post => {
      if (!post.scheduledFor) return false;
      const postDate = new Date(post.scheduledFor);
      return postDate.toDateString() === date.toDateString();
    });
  };
  
  // Helper to get user by ID
  const getUserById = (userId: number) => {
    return users.find(user => user.id === userId);
  };
  
  // Helper to get platform by ID
  const getPlatformById = (platformId: number) => {
    return platforms?.find(platform => platform.id === platformId);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 mb-6">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Content Calendar</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">Today</Button>
            <div className="flex border border-slate-200 rounded">
              <Button variant="ghost" size="sm" className="px-2 py-1">
                <i className="ri-arrow-left-s-line"></i>
              </Button>
              <Button variant="ghost" size="sm" className="px-2 py-1">
                <i className="ri-arrow-right-s-line"></i>
              </Button>
            </div>
            <Select defaultValue="week">
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Calendar Component */}
      <div className="p-4 overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-max">
          {/* Calendar Header */}
          <div className="text-center font-medium text-sm text-slate-500 p-2">Sun</div>
          <div className="text-center font-medium text-sm text-slate-500 p-2">Mon</div>
          <div className="text-center font-medium text-sm text-slate-500 p-2">Tue</div>
          <div className="text-center font-medium text-sm text-slate-500 p-2">Wed</div>
          <div className="text-center font-medium text-sm text-slate-500 p-2">Thu</div>
          <div className="text-center font-medium text-sm text-slate-500 p-2">Fri</div>
          <div className="text-center font-medium text-sm text-slate-500 p-2">Sat</div>
          
          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            const dayPosts = getPostsForDay(day.date);
            
            return (
              <div 
                key={index}
                className={`border border-slate-200 rounded min-h-[120px] p-2 calendar-day relative ${
                  day.isToday ? 'bg-blue-50' : ''
                }`}
              >
                <div className={`text-xs font-medium ${day.isToday ? 'text-blue-500' : 'text-slate-400'}`}>
                  {day.day}
                </div>
                <div className="mt-1 space-y-1">
                  {dayPosts.map(post => {
                    // Get the first platform for coloring
                    const platformId = (post.platforms as number[])[0];
                    const platform = getPlatformById(platformId);
                    
                    // Determine the color based on the platform
                    let bgColor = 'bg-blue-100';
                    let textColor = 'text-blue-800';
                    let borderColor = 'border-blue-500';
                    
                    if (platform) {
                      // Create color classes based on platform color
                      // This is a simplified version; in a real app you'd want to parse the hex color 
                      // and create appropriate tailwind classes or inline styles
                      if (platform.name === 'Twitter') {
                        bgColor = 'bg-blue-100';
                        textColor = 'text-blue-800';
                        borderColor = 'border-blue-500';
                      } else if (platform.name === 'Instagram') {
                        bgColor = 'bg-pink-100';
                        textColor = 'text-pink-800';
                        borderColor = 'border-pink-500';
                      } else if (platform.name === 'Facebook') {
                        bgColor = 'bg-orange-100';
                        textColor = 'text-orange-800';
                        borderColor = 'border-orange-500';
                      } else if (platform.name === 'LinkedIn') {
                        bgColor = 'bg-blue-100';
                        textColor = 'text-blue-800';
                        borderColor = 'border-blue-500';
                      } else {
                        bgColor = 'bg-green-100';
                        textColor = 'text-green-800';
                        borderColor = 'border-green-500';
                      }
                    }
                    
                    return (
                      <div 
                        key={post.id}
                        className={`draggable-post text-xs px-2 py-1 rounded ${bgColor} ${textColor} border-l-2 ${borderColor}`}
                      >
                        <div className="flex items-center">
                          {platform && <i className={`${platform.icon} mr-1`}></i>}
                          <span className="truncate">
                            {post.content.substring(0, 20)}
                            {post.content.length > 20 ? '...' : ''}
                          </span>
                        </div>
                        <div className="text-xs font-mono mt-1 text-slate-500">
                          {post.scheduledFor && format(new Date(post.scheduledFor), 'h:mm a')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
