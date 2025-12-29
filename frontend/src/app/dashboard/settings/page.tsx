'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { portfolioApi, Skill, SocialLink, CreateSkillData, PortfolioTheme, UpdateThemeData } from '@/lib/portfolio';
import api from '@/lib/api';

// Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const socialPlatforms = [
  { value: 'github', label: 'GitHub', icon: '🐙' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'devto', label: 'Dev.to', icon: '📝' },
  { value: 'medium', label: 'Medium', icon: '📰' },
  { value: 'stackoverflow', label: 'Stack Overflow', icon: '📚' },
];

const skillCategories = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Database' },
  { value: 'devops', label: 'DevOps' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'design', label: 'Design' },
  { value: 'other', label: 'Other' },
];

const colorPresets = [
  { name: 'Purple', primary: '#9333ea', secondary: '#ec4899', accent: '#a855f7' },
  { name: 'Blue', primary: '#3b82f6', secondary: '#06b6d4', accent: '#60a5fa' },
  { name: 'Green', primary: '#22c55e', secondary: '#84cc16', accent: '#4ade80' },
  { name: 'Orange', primary: '#f97316', secondary: '#ef4444', accent: '#fb923c' },
  { name: 'Teal', primary: '#14b8a6', secondary: '#0891b2', accent: '#2dd4bf' },
];

const fontFamilies = [
  { value: 'inter', label: 'Inter (Modern)' },
  { value: 'roboto', label: 'Roboto (Clean)' },
  { value: 'poppins', label: 'Poppins (Friendly)' },
  { value: 'fira-code', label: 'Fira Code (Developer)' },
  { value: 'playfair', label: 'Playfair Display (Elegant)' },
];

const layoutOptions = [
  { value: 'modern', label: 'Modern', description: 'Clean and minimal design' },
  { value: 'classic', label: 'Classic', description: 'Traditional portfolio layout' },
  { value: 'creative', label: 'Creative', description: 'Bold and expressive style' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    title: '',
    bio: '',
    github_username: '',
    linkedin_url: '',
    portfolio_url: '',
  });

  // Skills
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState<CreateSkillData>({
    name: '',
    category: 'other',
    proficiency: 50,
  });

  // Social Links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newSocialLink, setNewSocialLink] = useState({ platform: 'github', url: '' });

  // Theme
  const [theme, setTheme] = useState<PortfolioTheme | null>(null);
  const [themeData, setThemeData] = useState<UpdateThemeData>({
    primary_color: '#9333ea',
    secondary_color: '#ec4899',
    accent_color: '#a855f7',
    background_color: '#111827',
    text_color: '#ffffff',
    font_family: 'inter',
    layout: 'modern',
    show_skills: true,
    show_projects: true,
    show_experience: true,
    show_education: true,
    show_certifications: true,
    show_social_links: true,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        title: user.title || '',
        bio: user.bio || '',
        github_username: user.github_username || '',
        linkedin_url: user.linkedin_url || '',
        portfolio_url: user.portfolio_url || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSkills();
      loadSocialLinks();
      loadTheme();
    }
  }, [isAuthenticated]);

  const loadSkills = async () => {
    try {
      const data = await portfolioApi.getSkills();
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skills:', err);
    }
  };

  const loadSocialLinks = async () => {
    try {
      const data = await portfolioApi.getSocialLinks();
      setSocialLinks(data);
    } catch (err) {
      console.error('Failed to load social links:', err);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.patch('/auth/profile/', profileData);
      await refreshUser();
      setSuccess('Profile updated successfully!');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    try {
      await portfolioApi.createSkill(newSkill);
      setNewSkill({ name: '', category: 'other', proficiency: 50 });
      loadSkills();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to add skill');
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await portfolioApi.deleteSkill(id);
      loadSkills();
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  const handleAddSocialLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocialLink.url.trim()) return;

    try {
      await portfolioApi.createSocialLink(newSocialLink);
      setNewSocialLink({ platform: 'github', url: '' });
      loadSocialLinks();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to add social link');
    }
  };

  const handleDeleteSocialLink = async (id: number) => {
    try {
      await portfolioApi.deleteSocialLink(id);
      loadSocialLinks();
    } catch (err) {
      console.error('Failed to delete social link:', err);
    }
  };

  const loadTheme = async () => {
    try {
      const data = await portfolioApi.getTheme();
      setTheme(data);
      setThemeData({
        primary_color: data.primary_color || '#9333ea',
        secondary_color: data.secondary_color || '#ec4899',
        accent_color: data.accent_color || '#a855f7',
        background_color: data.background_color || '#111827',
        text_color: data.text_color || '#ffffff',
        font_family: data.font_family || 'inter',
        layout: data.layout || 'modern',
        show_skills: data.show_skills,
        show_projects: data.show_projects,
        show_experience: data.show_experience,
        show_education: data.show_education,
        show_certifications: data.show_certifications,
        show_social_links: data.show_social_links,
      });
    } catch (err) {
      console.error('Failed to load theme:', err);
    }
  };

  const handleThemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await portfolioApi.updateTheme(themeData);
      setSuccess('Theme updated successfully!');
      loadTheme();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to update theme');
    } finally {
      setIsLoading(false);
    }
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setThemeData({
      ...themeData,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/projects" className="text-gray-400 hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/dashboard/settings" className="text-white font-medium">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-2 text-gray-400">Manage your profile and preferences</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-green-400">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-white/10">
          {['profile', 'skills', 'social', 'theme'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-purple-400 border-purple-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={profileData.title}
                    onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="e.g., Full Stack Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-purple-500 focus:outline-none resize-none"
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <p className="mt-1 text-sm text-gray-500">{profileData.bio.length}/500</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={profileData.github_username ? `https://github.com/${profileData.github_username}` : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Extract username from GitHub URL or use as-is if it's just a username
                      let username = value;
                      if (value.includes('github.com/')) {
                        const match = value.match(/github\.com\/([^/\s?#]+)/);
                        username = match ? match[1] : '';
                      } else if (value.startsWith('https://') || value.startsWith('http://')) {
                        username = '';
                      }
                      setProfileData({ ...profileData, github_username: username });
                    }}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="https://github.com/your-username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={profileData.linkedin_url}
                    onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={profileData.portfolio_url}
                    onChange={(e) => setProfileData({ ...profileData, portfolio_url: e.target.value })}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="max-w-2xl">
            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Skill</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="React, Python, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  >
                    {skillCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Proficiency ({newSkill.proficiency}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newSkill.proficiency}
                    onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition-colors"
              >
                <PlusIcon />
                <span>Add Skill</span>
              </button>
            </form>

            {/* Skills List */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Skills</h3>
              {skills.length === 0 ? (
                <p className="text-gray-400">No skills added yet.</p>
              ) : (
                <div className="space-y-4">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-white">{skill.name}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                            {skill.category_display}
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${skill.proficiency}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{skill.proficiency}%</span>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Links Tab */}
        {activeTab === 'social' && (
          <div className="max-w-2xl">
            {/* Add Social Link Form */}
            <form onSubmit={handleAddSocialLink} className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Add Social Link</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Platform
                  </label>
                  <select
                    value={newSocialLink.platform}
                    onChange={(e) => setNewSocialLink({ ...newSocialLink, platform: e.target.value })}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  >
                    {socialPlatforms.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.icon} {platform.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={newSocialLink.url}
                    onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition-colors"
              >
                <PlusIcon />
                <span>Add Link</span>
              </button>
            </form>

            {/* Social Links List */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Social Links</h3>
              {socialLinks.length === 0 ? (
                <p className="text-gray-400">No social links added yet.</p>
              ) : (
                <div className="space-y-3">
                  {socialLinks.map((link) => {
                    const platform = socialPlatforms.find((p) => p.value === link.platform);
                    return (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{platform?.icon || '🔗'}</span>
                          <div>
                            <p className="font-medium text-white">{platform?.label || link.platform}</p>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-purple-400 hover:text-purple-300"
                            >
                              {link.url}
                            </a>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSocialLink(link.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <div className="max-w-2xl">
            <form onSubmit={handleThemeSubmit} className="space-y-6">
              {/* Color Presets */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Color Presets</h3>
                <div className="flex flex-wrap gap-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyColorPreset(preset)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:border-white/40 transition-colors"
                    >
                      <div className="flex -space-x-1">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      <span className="text-sm text-gray-300">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Custom Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeData.primary_color}
                        onChange={(e) => setThemeData({ ...themeData, primary_color: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeData.primary_color}
                        onChange={(e) => setThemeData({ ...themeData, primary_color: e.target.value })}
                        className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeData.secondary_color}
                        onChange={(e) => setThemeData({ ...themeData, secondary_color: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeData.secondary_color}
                        onChange={(e) => setThemeData({ ...themeData, secondary_color: e.target.value })}
                        className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeData.accent_color}
                        onChange={(e) => setThemeData({ ...themeData, accent_color: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeData.accent_color}
                        onChange={(e) => setThemeData({ ...themeData, accent_color: e.target.value })}
                        className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography & Layout */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Typography & Layout</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Font Family
                    </label>
                    <select
                      value={themeData.font_family}
                      onChange={(e) => setThemeData({ ...themeData, font_family: e.target.value })}
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    >
                      {fontFamilies.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Layout Style
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {layoutOptions.map((layout) => (
                        <button
                          key={layout.value}
                          type="button"
                          onClick={() => setThemeData({ ...themeData, layout: layout.value })}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            themeData.layout === layout.value
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                          }`}
                        >
                          <p className="font-medium text-white">{layout.label}</p>
                          <p className="text-xs text-gray-400 mt-1">{layout.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visibility Settings */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Section Visibility</h3>
                <p className="text-sm text-gray-400 mb-4">Choose which sections to display on your public portfolio</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'show_projects', label: 'Projects' },
                    { key: 'show_skills', label: 'Skills' },
                    { key: 'show_experience', label: 'Experience' },
                    { key: 'show_education', label: 'Education' },
                    { key: 'show_certifications', label: 'Certifications' },
                    { key: 'show_social_links', label: 'Social Links' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-white/20 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={themeData[item.key as keyof UpdateThemeData] as boolean}
                        onChange={(e) =>
                          setThemeData({ ...themeData, [item.key]: e.target.checked })
                        }
                        className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-white">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                <div
                  className="rounded-lg p-6 border border-white/10"
                  style={{ backgroundColor: themeData.background_color }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-full"
                      style={{ backgroundColor: themeData.primary_color }}
                    />
                    <div>
                      <h4 className="font-bold" style={{ color: themeData.text_color }}>
                        Your Name
                      </h4>
                      <p className="text-sm" style={{ color: themeData.secondary_color }}>
                        Full Stack Developer
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-sm text-white"
                      style={{ backgroundColor: themeData.primary_color }}
                    >
                      React
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-sm text-white"
                      style={{ backgroundColor: themeData.secondary_color }}
                    >
                      Python
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-sm text-white"
                      style={{ backgroundColor: themeData.accent_color }}
                    >
                      Node.js
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Theme Settings'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
