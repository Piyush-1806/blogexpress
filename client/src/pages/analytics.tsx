import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Platform } from '@shared/schema';

// Sample data for analytics page
const engagementData = [
  { name: 'Mon', twitter: 1200, facebook: 800, instagram: 1800, linkedin: 600 },
  { name: 'Tue', twitter: 1400, facebook: 900, instagram: 1600, linkedin: 700 },
  { name: 'Wed', twitter: 1500, facebook: 950, instagram: 2000, linkedin: 800 },
  { name: 'Thu', twitter: 1300, facebook: 1100, instagram: 2100, linkedin: 900 },
  { name: 'Fri', twitter: 1600, facebook: 1200, instagram: 2300, linkedin: 1000 },
  { name: 'Sat', twitter: 1100, facebook: 800, instagram: 1900, linkedin: 600 },
  { name: 'Sun', twitter: 900, facebook: 700, instagram: 1700, linkedin: 500 },
];

const followerGrowthData = [
  { name: 'Jan', twitter: 5000, facebook: 12000, instagram: 8000, linkedin: 3000 },
  { name: 'Feb', twitter: 5500, facebook: 12500, instagram: 9000, linkedin: 3200 },
  { name: 'Mar', twitter: 6000, facebook: 13000, instagram: 10000, linkedin: 3500 },
  { name: 'Apr', twitter: 6200, facebook: 13200, instagram: 10500, linkedin: 3700 },
  { name: 'May', twitter: 6500, facebook: 13500, instagram: 11000, linkedin: 4000 },
  { name: 'Jun', twitter: 7000, facebook: 14000, instagram: 11500, linkedin: 4200 },
];

const contentPerformanceData = [
  { name: 'Product Updates', value: 35 },
  { name: 'Industry News', value: 25 },
  { name: 'Company Culture', value: 20 },
  { name: 'Tips & Tricks', value: 15 },
  { name: 'Case Studies', value: 5 },
];

const platformDistributionData = [
  { name: 'Twitter', value: 30 },
  { name: 'Facebook', value: 25 },
  { name: 'Instagram', value: 35 },
  { name: 'LinkedIn', value: 10 },
];

const COLORS = ['#4f46e5', '#f97316', '#dc2626', '#16a34a', '#8b5cf6'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7days');
  const [chartType, setChartType] = useState('engagement');

  // Fetch platforms
  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ['/api/platforms'],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div className="text-2xl font-bold">78,245</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 12%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Follower Growth</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div className="text-2xl font-bold">+2,435</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 8.3%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Avg. Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div className="text-2xl font-bold">3.7%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 0.6%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Click-through Rate</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div className="text-2xl font-bold">1.8%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-500">↓ 0.3%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader className="pb-0">
          <Tabs value={chartType} onValueChange={setChartType}>
            <TabsList>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="content">Content Performance</TabsTrigger>
              <TabsTrigger value="distribution">Platform Distribution</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[400px]">
            {chartType === 'engagement' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="twitter" fill="#1DA1F2" />
                  <Bar dataKey="facebook" fill="#1877F2" />
                  <Bar dataKey="instagram" fill="#E4405F" />
                  <Bar dataKey="linkedin" fill="#0A66C2" />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {chartType === 'followers' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={followerGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="facebook" stroke="#1877F2" />
                  <Line type="monotone" dataKey="instagram" stroke="#E4405F" />
                  <Line type="monotone" dataKey="linkedin" stroke="#0A66C2" />
                </LineChart>
              </ResponsiveContainer>
            )}
            
            {chartType === 'content' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentPerformanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {contentPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {chartType === 'distribution' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {platformDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-start space-x-3 pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: index === 0 ? '#1DA1F220' : 
                                       index === 1 ? '#E4405F20' : '#0A66C220'
                    }}
                  >
                    <i className={
                      index === 0 ? 'ri-twitter-x-fill text-[#1DA1F2]' : 
                      index === 1 ? 'ri-instagram-fill text-[#E4405F]' : 
                      'ri-linkedin-box-fill text-[#0A66C2]'
                    }></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {index === 0 ? "We're excited to announce our Q1 results!" : 
                       index === 1 ? "Introducing our latest product line" : 
                       "Our analysis of recent industry trends"}
                    </p>
                    <div className="mt-1 flex justify-between text-xs text-slate-500">
                      <span>Engagement: {index === 0 ? "1,245" : index === 1 ? "982" : "768"}</span>
                      <span>Clicks: {index === 0 ? "346" : index === 1 ? "215" : "189"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platforms?.map((platform, index) => (
                <div key={platform.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <i 
                        className={`${platform.icon} mr-2 text-lg`}
                        style={{ color: platform.color }}
                      ></i>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {index === 0 ? "45%" : index === 1 ? "28%" : index === 2 ? "20%" : "7%"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        backgroundColor: platform.color,
                        width: index === 0 ? "45%" : index === 1 ? "28%" : index === 2 ? "20%" : "7%"
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
