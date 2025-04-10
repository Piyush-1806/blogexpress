import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Smile, ImagePlus, Link2, Hash } from 'lucide-react';

interface Platform {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface ContentEditorProps {
  initialContent?: string;
  initialScheduleDate?: Date;
  initialScheduleTime?: string;
  initialSelectedPlatforms?: number[];
  platforms: Platform[];
  onContentChange: (content: string) => void;
  onScheduleChange: (date: Date | undefined, time: string) => void;
  onPlatformsChange: (platformIds: number[]) => void;
  characterLimit?: number;
}

export function ContentEditor({
  initialContent = '',
  initialScheduleDate,
  initialScheduleTime = '12:00',
  initialSelectedPlatforms = [],
  platforms,
  onContentChange,
  onScheduleChange,
  onPlatformsChange,
  characterLimit = 280
}: ContentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [date, setDate] = useState<Date | undefined>(initialScheduleDate);
  const [time, setTime] = useState(initialScheduleTime);
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>(initialSelectedPlatforms);

  useEffect(() => {
    onContentChange(content);
  }, [content, onContentChange]);

  useEffect(() => {
    onScheduleChange(date, time);
  }, [date, time, onScheduleChange]);

  useEffect(() => {
    onPlatformsChange(selectedPlatforms);
  }, [selectedPlatforms, onPlatformsChange]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= characterLimit) {
      setContent(newContent);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };

  const handlePlatformToggle = (platformId: number) => {
    setSelectedPlatforms(current => {
      if (current.includes(platformId)) {
        return current.filter(id => id !== platformId);
      } else {
        return [...current, platformId];
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <div>
        <Label className="block text-sm font-medium text-slate-700 mb-2">Select Platforms</Label>
        <div className="flex flex-wrap gap-2">
          {platforms.map(platform => (
            <label 
              key={platform.id}
              className="inline-flex items-center bg-white border border-slate-200 rounded-md px-3 py-2 hover:bg-slate-50 cursor-pointer"
            >
              <input 
                type="checkbox" 
                className="rounded border-slate-300 text-primary focus:ring-primary mr-2"
                checked={selectedPlatforms.includes(platform.id)}
                onChange={() => handlePlatformToggle(platform.id)}
              />
              <i className={platform.icon} style={{ color: platform.color, marginRight: '0.375rem' }}></i>
              {platform.name}
            </label>
          ))}
        </div>
      </div>
      
      {/* Post Content */}
      <div>
        <Label htmlFor="postContent" className="block text-sm font-medium text-slate-700 mb-2">Post Content</Label>
        <Textarea 
          id="postContent" 
          rows={4} 
          value={content}
          onChange={handleContentChange}
          placeholder="What do you want to share?"
          className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
        />
        <div className="mt-2 flex items-center space-x-4 text-sm text-slate-500">
          <span>
            <i className="ri-text-wrap mr-1"></i> 
            <span id="charCount">{content.length}</span>/{characterLimit}
          </span>
          <Button variant="ghost" size="sm" className="p-1 text-slate-400 hover:text-slate-600">
            <Smile className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1 text-slate-400 hover:text-slate-600">
            <ImagePlus className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1 text-slate-400 hover:text-slate-600">
            <Link2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1 text-slate-400 hover:text-slate-600">
            <Hash className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Schedule */}
      <div>
        <Label className="block text-sm font-medium text-slate-700 mb-2">Schedule</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postDate" className="block text-sm text-slate-600 mb-1">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="postTime" className="block text-sm text-slate-600 mb-1">Time</Label>
            <Input 
              type="time" 
              id="postTime" 
              value={time}
              onChange={handleTimeChange}
              className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
