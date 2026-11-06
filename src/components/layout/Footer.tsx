import React from 'react';
import { Tractor, ShieldCheck, Sparkles, PhoneCall, MapPin } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="mt-16 bg-white dark:bg-[#151D18] border-t border-[#E2E6E2] dark:border-[#233027] text-xs text-[#5C6E63] dark:text-[#95A69B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#E2E6E2] dark:border-[#233027]">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A2F] dark:bg-[#28483B] flex items-center justify-center text-white shadow-matte-sm">
                <Tractor className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="font-bold text-sm tracking-tight text-[#19261E] dark:text-[#E5ECE7]">
                KISAN CONNECT
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#5C6E63] dark:text-[#95A69B]">
              Direct farm machinery booking network for verified tractors, combine harvesters, and drone sprayers across Andhra Pradesh.
            </p>
          </div>

          {/* Quick Machinery Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider">
              Machinery Categories
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectTab('explore')}
                  className="hover:text-[#19261E] dark:hover:text-[#E5ECE7] transition-colors"
                >
                  Tractors (45 - 55 HP)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('explore')}
                  className="hover:text-[#19261E] dark:hover:text-[#E5ECE7] transition-colors"
                >
                  Combine Harvesters
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('explore')}
                  className="hover:text-[#19261E] dark:hover:text-[#E5ECE7] transition-colors"
                >
                  Agricultural Drone Sprayers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('map')}
                  className="hover:text-[#19261E] dark:hover:text-[#E5ECE7] transition-colors flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-[#1E3A2F] dark:text-[#88C49E]" />
                  <span>Nearby GPS Field Map</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Regional Hubs */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider">
              Operational Hubs
            </h4>
            <div className="space-y-1.5 text-xs text-[#5C6E63] dark:text-[#95A69B]">
              <div>Vijayawada & NTR District</div>
              <div>Guntur & Mangalagiri Mandals</div>
              <div>Mylavaram, Ibrahimpatnam & Kondapalli</div>
              <div>Eluru & Nuzvid Agrarian Clusters</div>
            </div>
          </div>

          {/* Verification & Help */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider">
              Trust & Support
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#19261E] dark:text-[#E5ECE7]">
                <ShieldCheck className="w-4 h-4 text-[#235834] dark:text-[#88C49E] shrink-0" />
                <span>Verified Equipment & Operator ID</span>
              </div>
              <div className="flex items-center gap-2 text-[#19261E] dark:text-[#E5ECE7]">
                <Sparkles className="w-4 h-4 text-[#B8762E] shrink-0" />
                <span>Transparent token advance via Razorpay</span>
              </div>
              <div className="flex items-center gap-2 text-[#19261E] dark:text-[#E5ECE7]">
                <PhoneCall className="w-4 h-4 text-[#5C6E63] dark:text-[#95A69B] shrink-0" />
                <span>Toll-free Kisan line: 1800-425-1556</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>© {new Date().getFullYear()} KISAN CONNECT. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <span>Offline caching enabled</span>
            <span>·</span>
            <span>Built for Indian Agriculture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
