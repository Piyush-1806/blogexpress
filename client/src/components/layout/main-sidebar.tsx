import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { User, Platform } from '@shared/schema';

interface SidebarProps {
  user: User | null;
}

export function MainSidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ['/api/platforms'],
  });

  // Available navigation items
  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: 'ri-dashboard-line' },
    { name: 'Calendar', path: '/calendar', icon: 'ri-calendar-line' },
    { name: 'Content Library', path: '/content-library', icon: 'ri-draft-line' },
    { name: 'Analytics', path: '/analytics', icon: 'ri-line-chart-line' },
    { name: 'Team', path: '/team', icon: 'ri-team-line' },
    { name: 'Settings', path: '/settings', icon: 'ri-settings-3-line' },
  ];

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white mr-2">
            <i className="ri-share-forward-fill text-lg"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-800">SocialSync</h1>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  location === item.path
                    ? "bg-slate-100 text-primary"
                    : "text-slate-700 hover:bg-slate-100 hover:text-primary"
                )}>
                  <i className={`${item.icon} mr-3 text-lg`}></i>
                  {item.name}
                </a>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Connected Platforms
          </h3>
          <div className="mt-2 space-y-1">
            {platforms?.map(platform => (
              <a 
                key={platform.id}
                href="#" 
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100"
              >
                <i 
                  className={`${platform.icon} mr-3 text-lg`}
                  style={{ color: platform.color }}
                ></i>
                {platform.name}
              </a>
            ))}
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
              <i className="ri-add-circle-line mr-3 text-lg text-slate-400"></i>
              Add Platform
            </a>
          </div>
        </div>
      </nav>
      
      {user && (
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-700">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
