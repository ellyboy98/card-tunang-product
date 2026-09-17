// Form primitives for the admin. Plain Tailwind, no component library (CLAUDE.md).
import type { ComponentProps, ReactNode } from "react";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function Panel({ title, actions, children, className }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-xl border border-line bg-panel p-5", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12px] text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const controlClass = "w-full rounded-md border border-line bg-white px-2.5 text-[14px] text-ink placeholder:text-muted/70 focus:border-accent disabled:opacity-60";
export const inputClass = cx(controlClass, "h-[34px]");

type Invalid = { invalid?: boolean };

export function Input({ className, invalid, ...props }: ComponentProps<"input"> & Invalid) {
  return <input {...props} aria-invalid={invalid || undefined} className={cx(inputClass, invalid && "border-danger", className)} />;
}

export function Textarea({ className, invalid, ...props }: ComponentProps<"textarea"> & Invalid) {
  return <textarea rows={3} {...props} aria-invalid={invalid || undefined} className={cx(controlClass, "min-h-[80px] py-2", invalid && "border-danger", className)} />;
}

export function Select({ className, invalid, children, ...props }: ComponentProps<"select"> & Invalid) {
  return (
    <select {...props} aria-invalid={invalid || undefined} className={cx(inputClass, invalid && "border-danger", className)}>
      {children}
    </select>
  );
}

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "sm";

const variantClass: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink/90",
  secondary: "border border-line bg-white text-ink hover:bg-paper",
  danger: "border border-danger/40 bg-white text-danger hover:bg-danger/5",
  ghost: "text-ink hover:bg-paper",
};
const sizeClass: Record<Size, string> = {
  md: "h-[34px] rounded-lg px-4 text-[14px]",
  sm: "h-[28px] rounded-md px-2.5 text-[12px]",
};

export function buttonClass(variant: Variant = "secondary", size: Size = "md", className?: string): string {
  return cx(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    variantClass[variant],
    sizeClass[size],
    className,
  );
}

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type={type} {...props} className={buttonClass(variant, size, className)} />;
}

export function Notice({ tone, children }: { tone: "error" | "success" | "muted"; children: ReactNode }) {
  const toneClass = { error: "border-danger/30 bg-danger/5 text-danger", success: "border-success/30 bg-success/5 text-success", muted: "border-line bg-paper text-muted" }[tone];
  return (
    <p className={cx("rounded-md border px-3 py-2 text-[13px]", toneClass)} role={tone === "error" ? "alert" : undefined}>
      {children}
    </p>
  );
}
