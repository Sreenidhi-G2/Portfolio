import React, { useState, useEffect } from 'react';
import { Github, ExternalLink, Code2, Sparkles } from 'lucide-react';
import "../styles/Projects.css"


interface Project {
  title: string;
  stack: string;
  description: string;
  gradient: [string, string];
  icon: string;
  category: string;
  github?: string;
  demo?: string;
  type: 'personal' | 'work';
}

interface WorkExperience {
  title: string;
  company: string;
  period: string;
  description: string[];
  stack: string[];
  gradient: [string, string];
  icon: string;
  type: 'work';
}

type PortfolioItem = Project | WorkExperience;

const projectData: PortfolioItem[] = [
  // Personal Projects
  {
    title: 'Bricky Chatbot',
    stack: 'MERN + OpenRouter',
    description: 'AI-powered construction assistant built with Claude via OpenRouter, handling domain questions and casual conversations seamlessly',
    gradient: ['#ff6b6b', '#ee5a52'],
    icon: '🤖',
    category: 'AI/ML',
    type: 'personal',
    github: 'https://github.com/Sreenidhi-G2/Bricky-Chatbot.git',
    // demo: "http://bricky-chatbot.s3-website.ap-south-1.amazonaws.com/"
  },
  {
    title: 'Connect',
    stack: 'Express  + Socket.io',
    description: 'Real-time chat application featuring graph-based user matchmaking. Users are modeled as nodes and shared interests as weighted edges to recommend relevant chat rooms using similarity scoring and graph traversal, with JWT-based authentication and optimized message retrieval.',
    gradient: ['#ff6b6b', '#ee5a52'],
    icon: '💬',
    category: 'Backend',
    type: 'personal',
    github: 'https://github.com/Sreenidhi-G2/Connect-Chat-application-.git',
    // demo: "http://connect-chat-application.s3-website.ap-south-1.amazonaws.com"
  },
  { 
    title: 'Deepfake Image Detection',
    stack: 'CNN + Django + React',
    description: 'Developed a Deepfake Image Detection System using a custom CNN model achieving ~90% accuracy. Integrated with Django REST APIs and React frontend for real-time inference and visual prediction results.',
    gradient: ['#667eea', '#764ba2'],
    icon: '🔍',
    category: 'AI/ML',
    type: 'personal',
    github: 'https://github.com/Sreenidhi-G2'
  },
  {
    title: 'Short Ninja - URL Shortener',
    stack: 'Go (Fiber) + MongoDB',
    description: 'Built a production-grade URL shortener with <40ms API response time using SHA-256 + Salt hashing for collision-resistant short keys. Deployed on AWS EC2 with load testing of 5,000+ requests maintaining zero downtime.',
    gradient: ['#f093fb', '#f5576c'],
    icon: '🔗',
    category: 'Backend',
    type: 'personal',
    github: 'https://github.com/Sreenidhi-G2',
    // demo: "https://link-master-eta.vercel.app/"
  },

  // Work Experience
  {
    title: 'Software Development Engineer Intern',
    company: 'Intuceo',
    period: '2024',
    description: [
      'Worked on developing and maintaining full-stack features using FastAPI for backend and React.js for frontend',
      'Collaborated with cross-functional teams to deliver scalable web applications',
      'Implemented responsive UI components and optimized application performance'
    ],
    stack: ['FastAPI', 'React.js', 'Python', 'JavaScript'],
    gradient: ['#4facfe', '#00f2fe'],
    icon: '💼',
    type: 'work'
  },
  {
    title: 'Software Development Engineer Intern',
    company: 'Legabyte Innovations',
    period: '2023',
    description: [
      'Designed and implemented the admin backend for a tutoring website',
      'Focused on building scalable APIs and secure data management systems',
      'Worked with cloud services for efficient data storage and retrieval'
    ],
    stack: ['Express.js', 'DynamoDB', 'AWS S3', 'Node.js'],
    gradient: ['#43e97b', '#38f9d7'],
    icon: '🚀',
    type: 'work'
  },
  {
    title: 'Freelance Frontend Developer',
    company: 'Ashwa Code Labs',
    period: '2024',
    description: [
      'Built the Sree Vishnu Vocational Studies website from scratch',
      'Created responsive UI with modern frontend practices and clean code',
      'Implemented Tailwind CSS for efficient and maintainable styling'
    ],
    stack: ['React.js', 'Tailwind CSS', 'JavaScript'],
    gradient: ['#fa709a', '#fee140'],
    icon: '🎨',
    type: 'work'
  }
];

const FloatingElement: React.FC<{
  children: React.ReactNode;
  delay: number;
  duration: number;
  size: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, delay, duration, size, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const floatKeyframes = `
    @keyframes float-${delay}-${duration} {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      25% { transform: translateY(-20px) rotate(90deg); }
      50% { transform: translateY(-10px) rotate(180deg); }
      75% { transform: translateY(-15px) rotate(270deg); }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: floatKeyframes }} />
      <div
        className={`absolute ${sizeClasses[size]} ${className}`}
        style={{
          animation: `float-${delay}-${duration} ${duration}s ease-in-out infinite`,
          animationDelay: `${delay}s`
        }}
      >
        {children}
      </div>
    </>
  );
};

const StarField: React.FC = () => {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.8 + 0.2,
    animationDelay: Math.random() * 3
  }));

  return (
    <div className="fixed inset-0 pointer-events-none">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.animationDelay}s`,
            animationDuration: '2s'
          }}
        />
      ))}
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const slideUpKeyframes = `
    @keyframes slideUp-${index} {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: slideUpKeyframes }} />
      <div
        className="group relative bg-black/40 backdrop-blur-md border border-gray-600/30 rounded-2xl p-6 transition-all duration-500 hover:scale-105 hover:bg-black/60 hover:border-gray-500/50 hover:shadow-2xl hover:shadow-purple-500/20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          animation: `slideUp-${index} 0.6s ease-out forwards`,
          animationDelay: `${index * 0.2}s`,
          opacity: 0,
          transform: 'translateY(30px)'
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className="text-4xl mb-2 transition-transform duration-300"
            style={{
              transform: isHovered ? 'scale(1.2) rotate(10deg)' : 'scale(1) rotate(0deg)'
            }}
          >
            {project.icon}
          </div>
          <div className="flex gap-2">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800/50 rounded-full flex items-center justify-center hover:bg-gray-700/70 transition-colors duration-300 group"
              >
                <Github className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800/50 rounded-full flex items-center justify-center hover:bg-gray-700/70 transition-colors duration-300 group"
              >
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
            )}
          </div>
        </div>

        <div >
          {project.category}
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-colors duration-300">
          {project.title}
        </h3>

        <div className="text-yellow-400 font-semibold mb-3 text-sm">
          {project.stack}
        </div>

        <p className="text-gray-300 text-sm leading-relaxed">
          {project.description}
        </p>

        {/* Hover glow effect */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${project.gradient[0]}15, ${project.gradient[1]}15)`,
            boxShadow: `0 0 30px ${project.gradient[0]}30`
          }}
        />
      </div>
    </>
  );
};

const WorkExperienceCard: React.FC<{ experience: WorkExperience; index: number }> = ({ experience, index }) => {
  const slideUpKeyframes = `
    @keyframes slideUp-${index} {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: slideUpKeyframes }} />
      <div
        className="group relative bg-black/40 backdrop-blur-md border border-gray-600/30 rounded-2xl p-6 transition-all duration-500 hover:scale-105 hover:bg-black/60 hover:border-gray-500/50 hover:shadow-2xl hover:shadow-blue-500/20"
        style={{
          animation: `slideUp-${index} 0.6s ease-out forwards`,
          animationDelay: `${index * 0.2}s`,
          opacity: 0,
          transform: 'translateY(30px)'
        }}
      >
        <div className="flex items-start justify-end mb-4">
          <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
            {experience.period}
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-1 group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-colors duration-300">
          {experience.title}
        </h3>

        <div className="text-blue-300 font-semibold mb-3 text-sm">
          {experience.company}
        </div>

        <div className="mb-4">
          {experience.description.map((item, idx) => (
            <p key={idx} className="text-gray-300 text-sm leading-relaxed mb-2 flex items-start">
              <span className="text-green-400 mr-2">•</span>
              {item}
            </p>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {experience.stack.map((tech, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-full border border-gray-600/30"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Hover glow effect */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${experience.gradient[0]}15, ${experience.gradient[1]}15)`,
            boxShadow: `0 0 30px ${experience.gradient[0]}30`
          }}
        />
      </div>
    </>
  );
};

// const SectionHeader: React.FC<{
//   title: string;
//   subtitle: string;
//   delay: number;
// }> = ({ title, subtitle, delay }) => (
//   <div
//     className="text-center mb-12"
//     style={{
//       animation: 'fadeInUp 1s ease-out forwards',
//       animationDelay: `${delay}s`,
//       opacity: 0,
//       transform: 'translateY(30px)'
//     }}
//   >
//     <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
//       {title}
//     </h2>
//     <p className="text-lg text-gray-300 max-w-2xl mx-auto">
//       {subtitle}
//     </p>
//   </div>
// );

const SimplePortfolio: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'work' | 'personal'>('work');

  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeInUpKeyframes = `
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  // Filter items by type
  const personalProjects = projectData.filter(item => item.type === 'personal') as Project[];
  const workExperiences = projectData.filter(item => item.type === 'work') as WorkExperience[];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mb-4"></div>
          <p className="text-blue-300 text-lg">Loading Portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: fadeInUpKeyframes }} />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black relative overflow-hidden">
        {/* Animated background */}
        <StarField />

        {/* Floating GitHub icon */}
        <FloatingElement delay={0} duration={6} size="lg" className="top-10 right-10">
          <a
            href="https://github.com/Sreenidhi-G2"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-700 rounded-full flex items-center justify-center hover:from-gray-700 hover:to-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/25 group"
          >
            <Github className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
          </a>
        </FloatingElement>

        {/* Floating decorative elements */}
        <FloatingElement delay={1} duration={4} size="sm" className="top-1/4 left-10">
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-70"></div>
        </FloatingElement>

        <FloatingElement delay={2.5} duration={5} size="md" className="top-3/4 right-1/4">
          <div className="w-full h-full bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full opacity-60"></div>
        </FloatingElement>

        <FloatingElement delay={1.8} duration={7} size="sm" className="bottom-1/4 left-1/3">
          <Sparkles className="w-full h-full text-yellow-400 opacity-80" />
        </FloatingElement>

        <FloatingElement delay={3} duration={4.5} size="md" className="top-1/2 left-5">
          <Code2 className="w-full h-full text-blue-400 opacity-70" />
        </FloatingElement>

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6"
              style={{
                animation: 'fadeInUp 1s ease-out forwards',
                opacity: 0,
                transform: 'translateY(30px)'
              }}
            >
              My Portfolio
            </h1>
            <p
              className="text-xl text-gray-300 max-w-2xl mx-auto"
              style={{
                animation: 'fadeInUp 1s ease-out forwards',
                animationDelay: '0.3s',
                opacity: 0,
                transform: 'translateY(30px)'
              }}
            >
              Explore my journey through professional work experience and personal projects
            </p>
          </div>

          {/* Tab Navigation */}
          <div
            className="flex justify-center mb-16"
            style={{
              animation: 'fadeInUp 1s ease-out forwards',
              animationDelay: '0.5s',
              opacity: 0,
              transform: 'translateY(30px)'
            }}
          >
            <div className="inline-flex bg-black/40 backdrop-blur-md border border-gray-600/30 rounded-full p-1.5">
              <button
                onClick={() => setActiveTab('work')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${activeTab === 'work'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                Work Experience
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${activeTab === 'personal'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/50'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                Personal Projects
              </button>
            </div>
          </div>

          {/* Work Experience Section */}
          {activeTab === 'work' && (
            <section className="mb-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {workExperiences.map((experience, index) => (
                  <WorkExperienceCard key={`${experience.company}-${experience.title}`} experience={experience} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* Personal Projects Section */}
          {activeTab === 'personal' && (
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {personalProjects.map((project, index) => (
                  <ProjectCard key={project.title} project={project} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <div
            className="text-center mt-16"
            style={{
              animation: 'fadeInUp 1s ease-out forwards',
              animationDelay: '1.2s',
              opacity: 0,
              transform: 'translateY(30px)'
            }}
          >

          </div>
        </div>
      </div>
    </>
  );
};

export default SimplePortfolio;