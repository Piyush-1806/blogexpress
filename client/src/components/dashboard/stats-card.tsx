import React from 'react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  iconColor: string;
  change: number;
  period: string;
  negative?: boolean;
}

export function StatsCard({
  title,
  value,
  icon,
  iconColor,
  change,
  period,
  negative = false
}: StatsCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow p-4 border border-slate-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconColor}`}>
          <i className={`${icon} text-xl`}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-800">{value}</p>
        </div>
      </div>
      <div className="mt-3 text-xs font-medium">
        <span className={negative ? "text-red-500" : "text-green-500"}>
          <i className={negative ? "ri-arrow-down-line" : "ri-arrow-up-line"}></i>
          {typeof change === 'number' && Math.abs(change) >= 1 ? `${Math.abs(change)}%` : Math.abs(change)}
        </span>
        <span className="text-slate-500"> {period}</span>
      </div>
    </Card>
  );
}
