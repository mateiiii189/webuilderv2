import type { ComponentPropsWithRef, ReactNode } from "react";

const control =
  "block w-full min-w-0 rounded-control border border-field-border bg-field p-3.5 text-base leading-normal text-foreground transition-colors duration-200 placeholder:text-sm placeholder:text-placeholder hover:border-primary/40 focus:border-primary focus:bg-primary/5 focus:outline-1 focus:outline-offset-0 focus:outline-primary disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

export function Input({
  className = "",
  ...props
}: ComponentPropsWithRef<"input">) {
  return (
    <input {...props} className={`${control} min-h-[50px] ${className}`} />
  );
}
export function Textarea({
  className = "",
  ...props
}: ComponentPropsWithRef<"textarea">) {
  return (
    <textarea
      {...props}
      className={`${control} min-h-[148px] resize-y ${className}`}
    />
  );
}
export default function FormField({
  id,
  label,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mb-[22px] min-w-0">
      <label htmlFor={id} className="mb-2.5 block text-[13px] text-label">
        {label}
        {optional && (
          <small className="ml-1.5 text-kicker text-muted">opțional</small>
        )}
      </label>
      {children}
    </div>
  );
}
