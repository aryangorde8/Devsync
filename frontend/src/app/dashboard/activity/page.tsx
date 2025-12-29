'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ActivityItem {
  id: number;
  action: string;
  action_display: string;
  model_name: string;
  object_id: number | null;
  object_repr: string;
  changes: Record<string, unknown>;
  created_at: string;
  time_ago: string;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const url = filter === 'all' 
        ? '/portfolio/activity/' 
        : `/portfolio/activity/by_model/?model=${filter}`;
      const response = await api.get(url);
      setActivities(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'update':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'delete':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'login':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'export':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'update':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'delete':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'login':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        );
      case 'export':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const modelFilters = [
    { value: 'all', label: 'All Activity' },
    { value: 'project', label: 'Projects' },
    { value: 'skill', label: 'Skills' },
    { value: 'experience', label: 'Experience' },
    { value: 'education', label: 'Education' },
    { value: 'certification', label: 'Certifications' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Activity Log</h1>
            <p className="text-slate-400 mt-1">Track all changes to your portfolio</p>
          </div>
          
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {modelFilters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Activity Timeline */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-700" />

            {/* Activity items */}
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${getActionColor(
                      activity.action
                    )}`}
                  >
                    {getActionIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full border ${getActionColor(
                              activity.action
                            )}`}
                          >
                            {activity.action_display}
                          </span>
                          <span className="text-white font-medium">{activity.model_name}</span>
                        </div>
                        {activity.object_repr && (
                          <p className="text-slate-300 mt-1">{activity.object_repr}</p>
                        )}
                        {activity.changes && Object.keys(activity.changes).length > 0 && (
                          <div className="mt-2 text-sm text-slate-400">
                            <details className="cursor-pointer">
                              <summary className="hover:text-slate-300">View changes</summary>
                              <pre className="mt-2 p-2 bg-slate-900 rounded text-xs overflow-x-auto">
                                {JSON.stringify(activity.changes, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-slate-500 whitespace-nowrap">
                        {activity.time_ago}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No activity yet</h3>
            <p className="text-slate-400">Start making changes to see your activity history</p>
          </div>
        )}
      </div>
    </div>
  );
}
