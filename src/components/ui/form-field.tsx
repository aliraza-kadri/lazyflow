import { ReactNode } from "react";

const inputBase =
  "w-full rounded-xl border bg-lf-card px-4 py-3 text-[15px] text-lf-ink placeholder:text-lf-muted/60 outline-none transition-colors focus:border-lf-accent";

export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-lf-ink">{label}</label>
      {children}
      {hint && !error && <span className="text-xs text-lf-muted">{hint}</span>}
      {error && <span className="text-xs font-medium text-lf-accent-2">{error}</span>}
    </div>
  );
}

export function TextInput({
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={`${inputBase} ${error ? "border-lf-accent-2" : "border-lf-border"} ${className}`}
    />
  );
}

export function TextArea({
  error,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      {...props}
      className={`${inputBase} min-h-[110px] resize-y ${error ? "border-lf-accent-2" : "border-lf-border"} ${className}`}
    />
  );
}

export function Select({
  error,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      {...props}
      className={`${inputBase} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="%235b6272" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>')] bg-[right_1rem_center] bg-no-repeat pr-10 ${
        error ? "border-lf-accent-2" : "border-lf-border"
      } ${className}`}
    >
      {children}
    </select>
  );
}
