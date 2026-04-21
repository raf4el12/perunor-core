import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const svgBase = (size = 18): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export function IconDashboard({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

export function IconDocument({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M14 3v4a2 2 0 0 0 2 2h4" />
      <path d="M5 5a2 2 0 0 1 2-2h7l6 6v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" />
      <path d="M9 14h6M9 17h4" />
    </svg>
  );
}

export function IconBox({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5Z" />
      <path d="M3 8 12 13 21 8" />
      <path d="M12 13v8" />
    </svg>
  );
}

export function IconLedger({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M4 5a2 2 0 0 1 2-2h11l3 3v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export function IconChart({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-6 3 4 5-8" />
    </svg>
  );
}

export function IconTruck({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M2 6a2 2 0 0 1 2-2h10v11H2Z" />
      <path d="M14 8h4l3 3v4h-7Z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

export function IconUser({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function IconUsers({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20a7 7 0 0 1 14 0" />
      <path d="M16 4a3.5 3.5 0 0 1 0 7" />
      <path d="M18 20a6 6 0 0 0-3-5" />
    </svg>
  );
}

export function IconWarehouse({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M3 21V9l9-5 9 5v12" />
      <path d="M8 21v-7h8v7" />
      <path d="M8 11h8" />
    </svg>
  );
}

export function IconSettings({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.36.16.66.41.87.72" />
    </svg>
  );
}

export function IconTag({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.8 7.8a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function IconWorkflow({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="15" y="15" width="6" height="6" rx="1.5" />
      <path d="M9 6h6a3 3 0 0 1 3 3v6" />
    </svg>
  );
}

export function IconBuilding({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M16 9h4a1 1 0 0 1 1 1v11" />
      <path d="M9 7h2M9 11h2M9 15h2" />
    </svg>
  );
}

export function IconPlus({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconSearch({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconChevronDown({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconChevronRight({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function IconArrowLeft({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function IconLogout({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}

export function IconSpark({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  );
}

export function IconDownload({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M3 21h18" />
    </svg>
  );
}

export function IconFilter({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
  );
}

export function IconCalendar({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconCircleDot({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function IconMenu({ size, ...p }: IconProps) {
  return (
    <svg {...svgBase(size)} {...p}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
