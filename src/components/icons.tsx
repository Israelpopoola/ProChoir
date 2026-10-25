type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const CalendarIcon = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
export const MusicIcon = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
);
export const ChevronDown = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><path d="m6 9 6 6 6-6" /></svg>
);
export const ChevronLeft = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><path d="m15 18-6-6 6-6" /></svg>
);
export const ChevronRight = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><path d="m9 18 6-6-6-6" /></svg>
);
export const SearchIcon = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
export const ShareIcon = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="m16 6-4-4-4 4M12 2v13" /></svg>
);
export const DownloadIcon = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></svg>
);
export const LinkIcon = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
);
export const PlayIcon = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><polygon points="6 3 20 12 6 21 6 3" /></svg>
);
export const CopyIcon = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);
export const EditIcon = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
export const PlusIcon = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const TrashIcon = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
);
export const ArrowUp = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><path d="m18 15-6-6-6 6" /></svg>
);
export const BookIcon = ({ className = "size-5" }: P) => (
  <svg {...base} className={className}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></svg>
);
