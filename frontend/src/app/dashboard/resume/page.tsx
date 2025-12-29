'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface ResumeData {
  personal: {
    name: string;
    email: string;
    title: string;
    bio: string;
    github: string;
    linkedin: string;
    portfolio: string;
  };
  skills: Array<{ id: number; name: string; category: string; category_display: string; proficiency: number }>;
  experience: Array<{
    id: number;
    company: string;
    position: string;
    type_display: string;
    location: string;
    description: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
  }>;
  education: Array<{
    id: number;
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    grade: string;
  }>;
  certifications: Array<{
    id: number;
    name: string;
    issuing_organization: string;
    issue_date: string;
    credential_url: string;
  }>;
  projects: Array<{
    id: number;
    title: string;
    short_description: string;
    technologies: string[];
    github_url: string;
    live_url: string;
  }>;
}

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export default function ResumePage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadResumeData();
    }
  }, [isAuthenticated]);

  const loadResumeData = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<ResumeData>('/portfolio/resume/');
      setResumeData(data);
    } catch (err) {
      setError('Failed to load resume data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/portfolio/resume/download/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to download');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download PDF');
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const data = await api.get('/portfolio/export/');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio-data.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export data');
      console.error(err);
    }
  };

  // Calculate completeness
  const getCompleteness = () => {
    if (!resumeData) return { score: 0, items: [] };
    
    const items = [
      { name: 'Basic Info', complete: !!resumeData.personal.name && !!resumeData.personal.email },
      { name: 'Professional Title', complete: !!resumeData.personal.title },
      { name: 'Bio/Summary', complete: !!resumeData.personal.bio },
      { name: 'Skills (3+)', complete: resumeData.skills.length >= 3 },
      { name: 'Experience (1+)', complete: resumeData.experience.length >= 1 },
      { name: 'Education (1+)', complete: resumeData.education.length >= 1 },
      { name: 'Projects (1+)', complete: resumeData.projects.length >= 1 },
      { name: 'GitHub Profile', complete: !!resumeData.personal.github },
      { name: 'LinkedIn Profile', complete: !!resumeData.personal.linkedin },
    ];
    
    const completed = items.filter(i => i.complete).length;
    return { score: Math.round((completed / items.length) * 100), items };
  };

  const completeness = getCompleteness();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-bold text-white">Resume Builder</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Export JSON
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <DownloadIcon />
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Completeness & Quick Actions */}
          <div className="space-y-6">
            {/* Completeness Score */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Resume Completeness</h2>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${completeness.score * 3.52} 352`}
                    className={completeness.score >= 80 ? 'text-green-500' : completeness.score >= 50 ? 'text-yellow-500' : 'text-red-500'}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
                  {completeness.score}%
                </span>
              </div>
              <div className="space-y-2">
                {completeness.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {item.complete ? <CheckIcon /> : <WarningIcon />}
                    <span className={item.complete ? 'text-gray-300' : 'text-yellow-400'}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Improve Your Resume</h2>
              <div className="space-y-2">
                <Link href="/dashboard/settings" className="block px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors">
                  + Add Profile Info
                </Link>
                <Link href="/dashboard/experience" className="block px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors">
                  + Add Experience
                </Link>
                <Link href="/dashboard/education" className="block px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors">
                  + Add Education
                </Link>
                <Link href="/dashboard/projects" className="block px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors">
                  + Add Projects
                </Link>
                <Link href="/dashboard/certifications" className="block px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors">
                  + Add Certifications
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Resume Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-white">
                <h2 className="text-2xl font-bold">{resumeData?.personal.name || 'Your Name'}</h2>
                {resumeData?.personal.title && (
                  <p className="text-purple-200 mt-1">{resumeData.personal.title}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-purple-100">
                  {resumeData?.personal.email && <span>{resumeData.personal.email}</span>}
                  {resumeData?.personal.github && (
                    <span>github.com/{resumeData.personal.github}</span>
                  )}
                  {resumeData?.personal.linkedin && <span>LinkedIn</span>}
                </div>
              </div>

              <div className="p-8 space-y-6 text-gray-800">
                {/* Summary */}
                {resumeData?.personal.bio && (
                  <section>
                    <h3 className="text-lg font-bold text-purple-600 border-b border-purple-200 pb-1 mb-3">
                      Professional Summary
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{resumeData.personal.bio}</p>
                  </section>
                )}

                {/* Experience */}
                {resumeData?.experience && resumeData.experience.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-purple-600 border-b border-purple-200 pb-1 mb-3">
                      Work Experience
                    </h3>
                    <div className="space-y-4">
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{exp.position}</h4>
                              <p className="text-purple-600">{exp.company}</p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {exp.start_date?.slice(0, 7)} - {exp.is_current ? 'Present' : exp.end_date?.slice(0, 7)}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-gray-600 text-sm mt-1">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Education */}
                {resumeData?.education && resumeData.education.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-purple-600 border-b border-purple-200 pb-1 mb-3">
                      Education
                    </h3>
                    <div className="space-y-3">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{edu.degree}</h4>
                              <p className="text-purple-600">{edu.institution} - {edu.field_of_study}</p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {edu.start_date?.slice(0, 7)} - {edu.is_current ? 'Present' : edu.end_date?.slice(0, 7)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Skills */}
                {resumeData?.skills && resumeData.skills.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-purple-600 border-b border-purple-200 pb-1 mb-3">
                      Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Projects */}
                {resumeData?.projects && resumeData.projects.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-purple-600 border-b border-purple-200 pb-1 mb-3">
                      Notable Projects
                    </h3>
                    <div className="space-y-3">
                      {resumeData.projects.map((project) => (
                        <div key={project.id}>
                          <h4 className="font-semibold">{project.title}</h4>
                          {project.technologies?.length > 0 && (
                            <p className="text-sm text-gray-500">{project.technologies.join(', ')}</p>
                          )}
                          {project.short_description && (
                            <p className="text-gray-600 text-sm mt-1">{project.short_description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Certifications */}
                {resumeData?.certifications && resumeData.certifications.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-purple-600 border-b border-purple-200 pb-1 mb-3">
                      Certifications
                    </h3>
                    <div className="space-y-2">
                      {resumeData.certifications.map((cert) => (
                        <div key={cert.id} className="flex justify-between">
                          <span className="font-medium">{cert.name}</span>
                          <span className="text-gray-500">{cert.issuing_organization}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
