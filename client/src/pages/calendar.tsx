import React, { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Post, Platform, User } from '@shared/schema';
import { CreatePostModal } from '@/components/create-post-modal';

// Set up the big calendar localizer
const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<string>("month");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch all posts
  const { data: posts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });

  // Fetch all platforms
  const { data: platforms, isLoading: isLoadingPlatforms } = useQuery<Platform[]>({
    queryKey: ['/api/platforms'],
  });

  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Handle date selection in the calendar
  const handleDateSelect = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setIsCreateModalOpen(true);
  };

  // Format posts for the calendar
  const events = (posts || [])
    .filter(post => post.scheduledFor) // Only include posts that have a schedule
    .map(post => {
      // Find platforms for the post
      const postPlatforms = (post.platforms as number[])
        .map(platformId => platforms?.find(p => p.id === platformId))
        .filter(Boolean) as Platform[];
      
      // Get the first platform for color
      const firstPlatform = postPlatforms[0];
      const color = firstPlatform ? firstPlatform.color : '#4f46e5';
      
      return {
        id: post.id,
        title: post.content.substring(0, 30) + (post.content.length > 30 ? '...' : ''),
        start: new Date(post.scheduledFor!),
        end: new Date(new Date(post.scheduledFor!).getTime() + 60 * 60 * 1000), // Add 1 hour
        color,
        post,
      };
    });

  // Handle view type change
  const handleViewChange = (value: string) => {
    setViewType(value);
  };

  // Handle today button click
  const handleTodayClick = () => {
    setSelectedDate(new Date());
  };

  // Custom event renderer for the calendar
  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '4px',
        color: '#fff',
        border: 'none',
        display: 'block',
      }
    };
  };

  // Loading state
  const isLoading = isLoadingPosts || isLoadingPlatforms || isLoadingUsers;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>Content Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleTodayClick}
            >
              Today
            </Button>
            <Select value={viewType} onValueChange={handleViewChange}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[calc(100vh-250px)]">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={viewType as any}
            onView={(view) => setViewType(view)}
            date={selectedDate}
            onNavigate={date => setSelectedDate(date)}
            style={{ height: '100%' }}
            selectable
            onSelectSlot={handleDateSelect}
            eventPropGetter={eventStyleGetter}
            popup
            views={['month', 'week', 'day', 'agenda']}
          />
        </div>

        {users && users.length > 0 && (
          <CreatePostModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            user={users[0]}
            initialScheduleDate={selectedDate}
          />
        )}
      </CardContent>
    </Card>
  );
}
