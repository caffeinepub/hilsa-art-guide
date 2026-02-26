import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { SiInstagram, SiBehance } from "react-icons/si";
import { SiX } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "hilsa-art"
  );

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand */}
        <div className="flex flex-col items-center gap-6">
          <Link to="/" className="text-xl font-bold tracking-widest font-serif">
            <span className="text-foreground">HILSA-</span>
            <span className="text-primary">ART</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              How It Works
            </Link>
            <Link
              to="/contact"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Contact
            </Link>
          </nav>

          {/* Social icons */}
          <div className="flex items-center gap-5">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
              aria-label="Instagram"
            >
              <SiInstagram size={18} />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
              aria-label="X (Twitter)"
            >
              <SiX size={18} />
            </a>
            <a
              href="https://behance.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
              aria-label="Behance"
            >
              <SiBehance size={18} />
            </a>
          </div>

          <div className="ink-divider w-full" />

          {/* Copyright */}
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-xs text-muted-foreground">
              © {year} HILSA-ART GUIDE. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Built with{" "}
              <Heart
                size={12}
                className="text-primary fill-primary"
              />{" "}
              using{" "}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
