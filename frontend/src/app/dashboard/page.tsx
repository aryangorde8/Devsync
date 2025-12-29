'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { portfolioApi, DashboardStats, Project } from '@/lib/portfolio';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setIsLoadingData(true);
      const [statsData, projectsData] = await Promise.all([
        portfolioApi.getStats(),
        portfolioApi.getProjects(),
      ]);
      setStats(statsData);
      setRecentProjects(projectsData.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const statsData = [
    {
      label: 'Total Projects',
      value: stats?.total_projects ?? 0,
      icon: (
        <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple',
    },
    {
      label: 'Completed',
      value: stats?.completed_projects ?? 0,
      icon: (
        <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      label: 'In Progress',
      value: stats?.in_progress_projects ?? 0,
      icon: (
        <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'yellow',
    },
    {
      label: 'Skills',
      value: stats?.total_skills ?? 0,
      icon: (
        <svg className="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'pink',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
              <span className="text-xl font-bold text-white">DevSync</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-white font-medium">
                Dashboard
              </Link>
              <Link href="/dashboard/projects" className="text-gray-400 hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/dashboard/settings" className="text-gray-400 hover:text-white transition-colors">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user.first_name || user.email.split('@')[0]}! 👋
          </h1>
          <p className="mt-2 text-gray-400">
            Here&apos;s an overview of your portfolio activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {isLoadingData ? '-' : stat.value}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Profile */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/dashboard/projects"
                className="flex items-center gap-3 rounded-lg bg-purple-500/20 p-4 hover:bg-purple-500/30 transition-colors"
              >
                <span className="text-xl">🚀</span>
                <span className="text-white">Projects</span>
              </Link>
              <Link
                href="/dashboard/experience"
                className="flex items-center gap-3 rounded-lg bg-purple-500/20 p-4 hover:bg-purple-500/30 transition-colors"
              >
                <span className="text-xl">💼</span>
                <span className="text-white">Experience</span>
              </Link>
              <Link
                href="/dashboard/education"
                className="flex items-center gap-3 rounded-lg bg-purple-500/20 p-4 hover:bg-purple-500/30 transition-colors"
              >
                <span className="text-xl">🎓</span>
                <span className="text-white">Education</span>
              </Link>
              <Link
                href="/dashboard/certifications"
                className="flex items-center gap-3 rounded-lg bg-purple-500/20 p-4 hover:bg-purple-500/30 transition-colors"
              >
                <span className="text-xl">🏆</span>
                <span className="text-white">Certifications</span>
              </Link>
              <Link
                href="/dashboard/analytics"
                className="flex items-center gap-3 rounded-lg bg-blue-500/20 p-4 hover:bg-blue-500/30 transition-colors"
              >
                <span className="text-xl">📊</span>
                <span className="text-white">Analytics</span>
              </Link>
              <Link
                href="/dashboard/messages"
                className="flex items-center gap-3 rounded-lg bg-blue-500/20 p-4 hover:bg-blue-500/30 transition-colors"
              >
                <span className="text-xl">✉️</span>
                <span className="text-white">Messages</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-lg bg-gray-500/20 p-4 hover:bg-gray-500/30 transition-colors"
              >
                <span className="text-xl">⚙️</span>
                <span className="text-white">Settings</span>
              </Link>
              <Link
                href={`/portfolio/${user.email.split('@')[0]}`}
                target="_blank"
                className="flex items-center gap-3 rounded-lg bg-green-500/20 p-4 hover:bg-green-500/30 transition-colors"
              >
                <span className="text-xl">🌐</span>
                <span className="text-white">View Portfolio</span>
              </Link>
            </div>
          </div>

          {/* Profile Card */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your Profile</h2>
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                {(user.first_name?.[0] || user.email[0]).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  {user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email.split('@')[0]}
                </h3>
                <p className="text-gray-400">{user.email}</p>
                {user.title && (
                  <p className="text-purple-400 text-sm mt-1">{user.title}</p>
                )}
                {user.github_username && (
                  <a
                    href={`https://github.com/${user.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    @{user.github_username}
                  </a>
                )}
                <div className="mt-4">
                  <Link
                    href="/dashboard/settings"
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Edit Profile →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
            <Link href="/dashboard/projects" className="text-sm text-purple-400 hover:text-purple-300">
              View all →
            </Link>
          </div>
          
          {isLoadingData ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-4">No projects yet</p>
              <p className="mt-1 text-sm">Start by adding your first project!</p>
              <Link
                href="/dashboard/projects"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Project
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href="/dashboard/projects"
                  className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{project.title}</h3>
                    {project.is_featured && (
                      <svg className="h-5 w-5 text-yellow-400 fill-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {project.short_description || 'No description'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
