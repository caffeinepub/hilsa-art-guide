import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import { SiInstagram, SiBehance } from 'react-icons/si';
import { SiX } from 'react-icons/si';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'hilsa-art-guide');

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
                <rect x="2" y="2" width="24" height="24" rx="1" stroke="currentColor" strokeWidth="1.5" className="text-gold" />
                <path d="M7 21 L14 7 L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground" />
                <path d="M9.5 16 H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold" />
              </svg>
              <span className="font-serif text-sm font-semibold tracking-wide">
                HILSA<span className="text-gold">·</span>ART GUIDE
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed font-sans">
              Transforming photographs into art through a five-stage creative process. Where technology meets artistic vision.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <p className="section-label">Navigation</p>
            <nav className="flex flex-col gap-2">
              {[
                { label: 'Home', path: '/' },
                { label: 'How It Works', path: '/how-it-works' },
                { label: 'Docs', path: '/docs' },
                { label: 'Contact', path: '/contact' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-muted-foreground hover:text-gold transition-colors font-sans"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <p className="section-label">Follow the Journey</p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-border hover:border-gold hover:text-gold text-muted-foreground transition-all duration-200"
                aria-label="Instagram"
              >
                <SiInstagram size={15} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-border hover:border-gold hover:text-gold text-muted-foreground transition-all duration-200"
                aria-label="X (Twitter)"
              >
                <SiX size={15} />
              </a>
              <a
                href="https://behance.net"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-border hover:border-gold hover:text-gold text-muted-foreground transition-all duration-200"
                aria-label="Behance"
              >
                <SiBehance size={15} />
              </a>
            </div>
          </div>
        </div>

        <div className="ink-divider mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-sans">
          <p>© {year} HILSA-ART GUIDE. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with{' '}
            <Heart size={12} className="text-gold fill-gold" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
