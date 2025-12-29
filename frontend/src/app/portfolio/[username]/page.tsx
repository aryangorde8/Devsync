'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

interface PortfolioData {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    title: string;
    bio: string;
    avatar: string | null;
  };
  theme: {
    preset: string;
    primary_color: string;
    secondary_color: string;
    background_color: string;
    text_color: string;
    hero_title: string;
    hero_subtitle: string;
    show_skills_section: boolean;
    show_experience_section: boolean;
    show_projects_section: boolean;
    show_contact_form: boolean;
  } | null;
  projects: {
    id: number;
    title: string;
    slug: string;
    short_description: string;
    technologies: string[];
    github_url: string;
    live_url: string;
    is_featured: boolean;
  }[];
  skills: {
    id: number;
    name: string;
    category: string;
    category_display: string;
    proficiency: number;
  }[];
  experiences: {
    id: number;
    company: string;
    position: string;
    type_display: string;
    location: string;
    description: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
  }[];
  education: {
    id: number;
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
  }[];
  social_links: {
    id: number;
    platform: string;
    platform_display: string;
    url: string;
  }[];
}

export default function PublicPortfolioPage() {
  const params = useParams();
  const username = params.username as string;
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactForm, setContactForm] = useState({
    sender_name: '',
    sender_email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    loadPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const loadPortfolio = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<PortfolioData>(`/portfolio/public/${username}/`, { authenticated: false });
      setPortfolio(data);
    } catch {
      setError('Portfolio not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post(`/portfolio/public/${username}/contact/`, contactForm, { authenticated: false });
      setSent(true);
      setContactForm({ sender_name: '', sender_email: '', subject: '', message: '' });
    } catch {
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-gray-400">{error || 'Portfolio not found'}</p>
        </div>
      </div>
    );
  }

  const theme = portfolio.theme;
  const primaryColor = theme?.primary_color || '#8B5CF6';
  const secondaryColor = theme?.secondary_color || '#EC4899';

  // Group skills by category
  const skillsByCategory = portfolio.skills.reduce((acc, skill) => {
    const cat = skill.category_display;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, typeof portfolio.skills>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
        <div className="relative z-10 text-center px-4">
          {portfolio.user.avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={portfolio.user.avatar}
              alt={portfolio.user.full_name}
              className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white/20"
            />
          ) : (
            <div
              className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            >
              {portfolio.user.first_name?.[0] || portfolio.user.full_name[0]}
            </div>
          )}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            {theme?.hero_title || portfolio.user.full_name}
          </h1>
          <p className="text-xl md:text-2xl text-purple-300 mb-6">
            {theme?.hero_subtitle || portfolio.user.title}
          </p>
          {portfolio.user.bio && (
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">{portfolio.user.bio}</p>
          )}
          <div className="flex justify-center gap-4">
            {portfolio.social_links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title={link.platform_display}
              >
                {link.platform === 'github' && '🐙'}
                {link.platform === 'linkedin' && '💼'}
                {link.platform === 'twitter' && '🐦'}
                {link.platform === 'website' && '🌐'}
                {link.platform === 'youtube' && '📺'}
                {!['github', 'linkedin', 'twitter', 'website', 'youtube'].includes(link.platform) && '🔗'}
              </a>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="text-white/50 text-2xl">↓</span>
        </div>
      </section>

      {/* Projects Section */}
      {(theme?.show_projects_section ?? true) && portfolio.projects.length > 0 && (
        <section className="py-20 px-4" id="projects">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Projects</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:border-purple-500/50 transition-all hover:-translate-y-1"
                >
                  {project.is_featured && (
                    <span className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded mb-3">
                      ⭐ Featured
                    </span>
                  )}
                  <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{project.short_description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        GitHub →
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Live Demo →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {(theme?.show_skills_section ?? true) && portfolio.skills.length > 0 && (
        <section className="py-20 px-4 bg-black/20" id="skills">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Skills</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category} className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">{category}</h3>
                  <div className="space-y-3">
                    {skills.map((skill) => (
                      <div key={skill.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{skill.name}</span>
                          <span className="text-gray-500">{skill.proficiency}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${skill.proficiency}%`,
                              background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience Section */}
      {(theme?.show_experience_section ?? true) && portfolio.experiences.length > 0 && (
        <section className="py-20 px-4" id="experience">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Experience</h2>
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-purple-500/30" />
              <div className="space-y-8">
                {portfolio.experiences.map((exp, i) => (
                  <div
                    key={exp.id}
                    className={`relative flex flex-col md:flex-row gap-4 ${
                      i % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-purple-500 rounded-full -translate-x-1.5 md:-translate-x-1.5 mt-2" />
                    <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:pl-8' : 'md:pr-8 md:text-right'} pl-10 md:pl-0`}>
                      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                        <span className="text-purple-400 text-sm">{exp.type_display}</span>
                        <h3 className="text-xl font-semibold text-white mt-1">{exp.position}</h3>
                        <p className="text-gray-400">{exp.company}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          {' - '}
                          {exp.is_current ? 'Present' : exp.end_date && new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                        {exp.description && (
                          <p className="text-gray-400 text-sm mt-3">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {(theme?.show_contact_form ?? true) && (
        <section className="py-20 px-4 bg-black/20" id="contact">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Get in Touch</h2>
            {sent ? (
              <div className="text-center p-8 rounded-2xl bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 text-xl">✓ Message sent successfully!</p>
                <p className="text-gray-400 mt-2">I&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.sender_name}
                      onChange={(e) => setContactForm({ ...contactForm, sender_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={contactForm.sender_email}
                      onChange={(e) => setContactForm({ ...contactForm, sender_email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>Built with DevSync</p>
      </footer>
    </div>
  );
}
