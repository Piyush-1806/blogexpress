import React from 'react';
import { User, Platform } from '@shared/schema';

interface PostPreviewProps {
  content: string;
  platform: Platform;
  user: User;
}

export function TwitterPreview({ content, user }: PostPreviewProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-start">
        <img 
          src={user.avatar || "https://via.placeholder.com/40"} 
          alt={user.name} 
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-3 flex-1">
          <div className="flex items-center">
            <p className="font-semibold text-slate-800">{user.name}</p>
            <p className="text-slate-500 ml-1">@{user.username}</p>
          </div>
          <p className="text-slate-600 mt-1">{content || "What do you want to share?"}</p>
        </div>
      </div>
    </div>
  );
}

export function FacebookPreview({ content, user }: PostPreviewProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-start">
        <img 
          src={user.avatar || "https://via.placeholder.com/40"} 
          alt={user.name} 
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-3 flex-1">
          <p className="font-semibold text-slate-800">{user.name}</p>
          <p className="text-slate-600 mt-1">{content || "What do you want to share?"}</p>
        </div>
      </div>
    </div>
  );
}

export function InstagramPreview({ content, user }: PostPreviewProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-center mb-3">
        <img 
          src={user.avatar || "https://via.placeholder.com/40"} 
          alt={user.name} 
          className="w-8 h-8 rounded-full"
        />
        <span className="ml-2 font-semibold">{user.username}</span>
      </div>
      <div className="bg-slate-200 h-32 rounded-md flex items-center justify-center">
        <i className="ri-image-2-line text-3xl text-slate-400"></i>
      </div>
      <div className="mt-3">
        <p className="text-sm">
          <span className="font-semibold mr-1">{user.username}</span>
          {content || "What do you want to share?"}
        </p>
      </div>
    </div>
  );
}

export function LinkedInPreview({ content, user }: PostPreviewProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-start">
        <img 
          src={user.avatar || "https://via.placeholder.com/40"} 
          alt={user.name} 
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-3 flex-1">
          <div className="flex flex-col">
            <p className="font-semibold text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500">Marketing Manager</p>
          </div>
          <p className="text-slate-600 mt-2">{content || "What do you want to share?"}</p>
        </div>
      </div>
    </div>
  );
}

export function PostPreview({
  content,
  platform,
  user
}: PostPreviewProps) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
      <div className="flex items-center mb-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${platform.color}20` }}
        >
          <i className={platform.icon} style={{ color: platform.color }}></i>
        </div>
        <span className="ml-2 text-sm font-medium text-slate-700">{platform.name} Preview</span>
      </div>
      
      {platform.name === "Twitter" && <TwitterPreview content={content} platform={platform} user={user} />}
      {platform.name === "Facebook" && <FacebookPreview content={content} platform={platform} user={user} />}
      {platform.name === "Instagram" && <InstagramPreview content={content} platform={platform} user={user} />}
      {platform.name === "LinkedIn" && <LinkedInPreview content={content} platform={platform} user={user} />}
    </div>
  );
}
