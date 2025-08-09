import React from 'react';
import { Link } from 'react-router-dom';
import { Github, FileText } from 'lucide-react';
import AnimatedGradient from '../ui/AnimatedGradient';

export const GlobalFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto glass-card-prominent border-t border-glass-prominent">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Brand and Copyright */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <AnimatedGradient
                gradientColors={['var(--primary-purple)', 'var(--primary-pink)', 'var(--primary-teal)', 'var(--primary-violet)']}
                className="w-6 h-6 rounded-lg flex items-center justify-center shadow-md"
                textClassName="text-white font-bold text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                duration={20}
              >
                S
              </AnimatedGradient>
              <span className="font-semibold text-text-1 text-sm whitespace-nowrap">Social Distribution</span>
            </Link>
            <span className="text-xs text-text-2">© {currentYear} CMPUT 404 • S25 Project Black</span>
          </div>

          {/* Right: Links */}
          <nav className="flex items-center space-x-4 text-sm">
            <Link 
              to="/docs" 
              className="text-text-2 hover:text-text-1 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <FileText size={14} className="shrink-0" />
              Docs
            </Link>
            <a 
              href="https://github.com/uofa-cmput404/s25-project-black" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-text-2 hover:text-text-1 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Github size={14} className="shrink-0" />
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;