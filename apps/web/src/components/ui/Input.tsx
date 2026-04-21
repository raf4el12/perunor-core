import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";

interface FieldWrapperProps {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
}

export function Field({ label, helper, error, required, children, style }: FieldWrapperProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", ...style }}>
      {label && (
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.02em", textTransform: "uppercase" }}>
          {label}
          {required && <span style={{ color: "var(--accent)", marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span style={{ fontSize: "0.78rem", color: "var(--danger)" }}>{error}</span>
      ) : helper ? (
        <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>{helper}</span>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leftIcon, rightIcon, hasError, style, onFocus, onBlur, ...rest },
  ref,
) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "var(--surface)",
        border: `1px solid ${hasError ? "var(--danger)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        padding: "0 0.75rem",
        transition: "border-color var(--dur), box-shadow var(--dur)",
        boxShadow: "var(--shadow-xs)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--brand-500)";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(44, 82, 130, 0.12)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = hasError ? "var(--danger)" : "var(--border)";
        e.currentTarget.style.boxShadow = "var(--shadow-xs)";
      }}
    >
      {leftIcon && <span style={{ color: "var(--text-subtle)", marginRight: "0.5rem", display: "flex" }}>{leftIcon}</span>}
      <input
        ref={ref}
        {...rest}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          flex: 1,
          padding: "0.65rem 0",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "0.9rem",
          color: "var(--text)",
          ...style,
        }}
      />
      {rightIcon && <span style={{ color: "var(--text-subtle)", marginLeft: "0.5rem", display: "flex" }}>{rightIcon}</span>}
    </div>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { hasError, style, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      {...rest}
      style={{
        padding: "0.65rem 2.2rem 0.65rem 0.75rem",
        background: "var(--surface)",
        border: `1px solid ${hasError ? "var(--danger)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        fontSize: "0.9rem",
        color: "var(--text)",
        boxShadow: "var(--shadow-xs)",
        appearance: "none",
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.65rem center",
        ...style,
      }}
    >
      {children}
    </select>
  );
});
