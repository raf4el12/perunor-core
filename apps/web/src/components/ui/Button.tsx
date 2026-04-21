import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

const paddings: Record<Size, string> = {
  sm: "0.4rem 0.75rem",
  md: "0.55rem 1rem",
  lg: "0.75rem 1.4rem",
};

const fontSizes: Record<Size, string> = {
  sm: "0.8rem",
  md: "0.88rem",
  lg: "0.95rem",
};

function styleFor(variant: Variant): React.CSSProperties {
  switch (variant) {
    case "primary":
      return { background: "var(--primary)", color: "var(--text-inverse)", border: "1px solid var(--primary)" };
    case "secondary":
      return { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" };
    case "ghost":
      return { background: "transparent", color: "var(--text-muted)", border: "1px solid transparent" };
    case "danger":
      return { background: "var(--danger)", color: "var(--text-inverse)", border: "1px solid var(--danger)" };
    case "accent":
      return { background: "var(--accent)", color: "var(--text-inverse)", border: "1px solid var(--accent)" };
  }
}

export function Button({
  variant = "secondary",
  size = "md",
  leftIcon,
  rightIcon,
  loading,
  children,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: paddings[size],
    fontSize: fontSizes[size],
    fontWeight: 600,
    borderRadius: "var(--radius-md)",
    transition: "background var(--dur) var(--ease-smooth), box-shadow var(--dur) var(--ease-smooth), transform var(--dur-fast) var(--ease-smooth)",
    opacity: disabled || loading ? 0.55 : 1,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
    letterSpacing: "-0.005em",
    ...styleFor(variant),
    ...style,
  };
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={base}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          if (variant === "primary") e.currentTarget.style.background = "var(--primary-hover)";
          if (variant === "accent") e.currentTarget.style.background = "var(--accent-hover)";
          if (variant === "secondary") e.currentTarget.style.background = "var(--surface-alt)";
          if (variant === "ghost") e.currentTarget.style.background = "var(--surface-alt)";
          if (variant === "danger") e.currentTarget.style.background = "var(--paprika-700)";
        }
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        const s = styleFor(variant);
        if (s.background) e.currentTarget.style.background = s.background as string;
        onMouseLeave?.(e);
      }}
    >
      {loading ? <Spinner size={size === "sm" ? 12 : 14} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: "50%",
        border: "2px solid currentColor", borderRightColor: "transparent",
        display: "inline-block", animation: "spin 0.8s linear infinite",
      }}
    />
  );
}
