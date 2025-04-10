import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ContentCalendar } from '@/components/dashboard/content-calendar';
import { UpcomingPosts } from '@/components/dashboard/upcoming-posts';
import { QuickAnalytics } from '@/components/dashboard/quick-analytics';
import { TeamActivity } from '@/components/dashboard/team-activity';
import { Post, TeamActivity as TeamActivityType, User } from '@shared/schema';

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Fetch scheduled posts
  const { data: scheduledPosts, isLoading: isLoadingScheduledPosts } = useQuery<Post[]>({
    queryKey: ['/api/posts/status/scheduled'],
  });

  // Fetch posts needing approval
  const { data: approvalPosts, isLoading: isLoadingApprovalPosts } = useQuery<Post[]>({
    queryKey: ['/api/posts/status/needs_approval'],
  });

  // Fetch team activities
  const { data: teamActivities, isLoading: isLoadingTeamActivities } = useQuery<TeamActivityType[]>({
    queryKey: ['/api/team-activities'],
  });

  // Get today's date and calculate date range
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)
  
  // Fetch posts for the current week
  const { data: weekPosts, isLoading: isLoadingWeekPosts } = useQuery<Post[]>({
    queryKey: ['/api/posts/date-range', { startDate: startOfWeek, endDate: endOfWeek }],
  });

  // Combine all loading states
  const isLoading = isLoadingStats || isLoadingUsers || isLoadingScheduledPosts || 
                   isLoadingApprovalPosts || isLoadingTeamActivities || isLoadingWeekPosts;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Scheduled Posts"
          value={stats?.scheduled || 0}
          icon="ri-calendar-check-fill"
          iconColor="bg-blue-100 text-primary"
          change={12}
          period="vs. last week"
        />
        <StatsCard 
          title="Drafts"
          value={stats?.drafts || 0}
          icon="ri-bookmark-line"
          iconColor="bg-orange-100 text-secondary"
          change={4}
          period="vs. last week"
        />
        <StatsCard 
          title="Published"
          value={stats?.published || 0}
          icon="ri-check-double-line"
          iconColor="bg-green-100 text-green-600"
          change={8}
          period="vs. last week"
        />
        <StatsCard 
          title="Needs Approval"
          value={stats?.needsApproval || 0}
          icon="ri-alarm-warning-line"
          iconColor="bg-red-100 text-red-600"
          change={-2}
          period="vs. yesterday"
          negative
        />
      </div>

      {/* Content Calendar */}
      <ContentCalendar posts={weekPosts || []} users={users || []} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Upcoming Posts */}
        <div className="lg:col-span-2">
          <UpcomingPosts 
            posts={scheduledPosts || []} 
            users={users || []} 
          />
        </div>

        {/* Analytics & Team Activity */}
        <div className="space-y-6">
          <QuickAnalytics />
          <TeamActivity activities={teamActivities || []} users={users || []} />
        </div>
      </div>
    </>
  );
}
