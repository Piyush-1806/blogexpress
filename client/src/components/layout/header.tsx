import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@shared/schema';
import { CreatePostModal } from '@/components/create-post-modal';

interface HeaderProps {
  title: string;
  subtitle?: string;
  user: User | null;
  onToggleSidebar: () => void;
}

export function Header({ title, subtitle, user, onToggleSidebar }: HeaderProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex md:hidden">
          <button 
            type="button" 
            className="text-slate-500 hover:text-slate-600"
            onClick={onToggleSidebar}
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
        </div>
        
        <div className="flex-1 flex justify-between items-center md:justify-end">
          <div className="relative w-full max-w-xs md:max-w-md mr-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-slate-400"></i>
            </div>
            <Input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" 
              placeholder="Search content, teams, platforms..."
            />
          </div>
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 mr-2" 
              aria-label="View notifications"
            >
              <span className="sr-only">Notifications</span>
              <i className="ri-notification-3-line text-xl"></i>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100" 
              aria-label="View messages"
            >
              <span className="sr-only">Messages</span>
              <i className="ri-message-3-line text-xl"></i>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3 border-t border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          
          <div>
            <Button 
              className="inline-flex items-center shadow-sm"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <i className="ri-add-line mr-2"></i>
              Create Post
            </Button>
          </div>
        </div>
      </div>

      {user && (
        <CreatePostModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          user={user}
        />
      )}
    </header>
  );
}
