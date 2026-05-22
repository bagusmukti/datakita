import { Github, Database } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-border bg-surface overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231E2761'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill-opacity='0.4'/%3E%3Cpath d='M30 15 L45 30 L30 45 L15 30 Z' fill-opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <p className="text-text-secondary text-center sm:text-left">
          <span className="font-semibold text-text-primary">DataKita</span>
          {' · '}2026
        </p>

        <div className="flex items-center gap-1.5 text-text-secondary">
          <Database size={13} />
          <span>Powered by</span>
          <span className="font-medium text-text-primary">BMKG</span>
          <span>·</span>
          <span className="font-medium text-text-primary">World Bank</span>
          <span>·</span>
          <span className="font-medium text-text-primary">disease.sh</span>
        </div>

        <a
          href="https://github.com/bagusmukti/datakita"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary hover:text-text-primary transition-colors"
          aria-label="GitHub Repository"
        >
          <Github size={18} />
        </a>
      </div>
    </footer>
  );
}
