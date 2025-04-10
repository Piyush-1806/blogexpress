import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function QuickAnalytics() {
  const [timeRange, setTimeRange] = useState('7days');
  
  // These would come from API in a real app
  const analyticsData = {
    engagementRate: {
      value: 68,
      change: '+12.5%'
    },
    followerGrowth: {
      value: 45,
      change: '+8.3%'
    },
    clickThroughRate: {
      value: 23,
      change: '-2.1%'
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow border border-slate-200">
      <CardHeader className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">Quick Analytics</CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="text-sm border-0 text-slate-600 pr-7 py-1 rounded bg-transparent w-[130px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Engagement Rate</div>
              <div className="text-sm font-medium text-green-600">{analyticsData.engagementRate.change}</div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${analyticsData.engagementRate.value}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Follower Growth</div>
              <div className="text-sm font-medium text-green-600">{analyticsData.followerGrowth.change}</div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${analyticsData.followerGrowth.value}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Click-through Rate</div>
              <div className="text-sm font-medium text-red-600">{analyticsData.clickThroughRate.change}</div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${analyticsData.clickThroughRate.value}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <Button variant="secondary" className="w-full">
            View Full Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
