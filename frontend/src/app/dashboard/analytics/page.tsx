'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface AnalyticsData {
  total_profile_views: number;
  total_project_views: number;
  views_today: number;
  views_this_week: number;
  views_this_month: number;
  top_projects: { id: number; title: string; view_count: number }[];
  views_by_day: { date: string; views: number }[];
  referrers: { referrer: string; count: number }[];
  devices: Record<string, number>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics();
    }
  }, [isAuthenticated]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<AnalyticsData>('/portfolio/analytics/');
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const maxViews = Math.max(...(analytics?.views_by_day.map(d => d.views) || [1]), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Views', value: (analytics?.total_profile_views || 0) + (analytics?.total_project_views || 0), icon: '👁️' },
            { label: 'Today', value: analytics?.views_today || 0, icon: '📅' },
            { label: 'This Week', value: analytics?.views_this_week || 0, icon: '📊' },
            { label: 'This Month', value: analytics?.views_this_month || 0, icon: '📈' },
            { label: 'Project Views', value: analytics?.total_project_views || 0, icon: '🚀' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Views Chart */}
          <div className="lg:col-span-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Views (Last 30 Days)</h2>
            <div className="h-64 flex items-end gap-1">
              {analytics?.views_by_day.slice(-30).map((day, i) => (
                <div
                  key={day.date}
                  className="flex-1 bg-purple-500/50 hover:bg-purple-500 transition-colors rounded-t cursor-pointer group relative"
                  style={{ height: `${Math.max((day.views / maxViews) * 100, 2)}%` }}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString()}: {day.views} views
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Devices</h2>
            <div className="space-y-4">
              {Object.entries(analytics?.devices || {}).map(([device, count]) => {
                const total = Object.values(analytics?.devices || {}).reduce((a, b) => a + b, 0) || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={device}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 capitalize">
                        {device === 'desktop' && '🖥️ '}
                        {device === 'mobile' && '📱 '}
                        {device === 'tablet' && '📱 '}
                        {device}
                      </span>
                      <span className="text-white">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(analytics?.devices || {}).length === 0 && (
                <p className="text-gray-500 text-center py-4">No device data yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Top Projects */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Top Projects</h2>
            <div className="space-y-3">
              {analytics?.top_projects.map((project, i) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-purple-400">#{i + 1}</span>
                    <span className="text-white">{project.title}</span>
                  </div>
                  <span className="text-gray-400">{project.view_count} views</span>
                </div>
              ))}
              {(analytics?.top_projects.length || 0) === 0 && (
                <p className="text-gray-500 text-center py-4">No project views yet</p>
              )}
            </div>
          </div>

          {/* Top Referrers */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Top Referrers</h2>
            <div className="space-y-3">
              {analytics?.referrers.slice(0, 5).map((ref) => (
                <div
                  key={ref.referrer}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <span className="text-white truncate flex-1 mr-2">
                    {new URL(ref.referrer).hostname}
                  </span>
                  <span className="text-gray-400">{ref.count} visits</span>
                </div>
              ))}
              {(analytics?.referrers.length || 0) === 0 && (
                <p className="text-gray-500 text-center py-4">No referrer data yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
