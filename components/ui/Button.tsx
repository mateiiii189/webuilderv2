import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type SharedProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  arrow?: boolean;
  direction?: "forward" | "back";
  className?: string;
};
type ButtonProps = SharedProps &
  (
    | ({ href: string } & Omit<
        ComponentPropsWithoutRef<"a">,
        "children" | "className" | "href"
      >)
    | ({ href?: never } & Omit<
        ComponentPropsWithoutRef<"button">,
        "children" | "className"
      >)
  );
const variants = {
  primary:
    "border-primary bg-primary text-background group-[:hover:not(:disabled)]/button:border-primary-hover group-[:hover:not(:disabled)]/button:bg-primary-hover",
  secondary:
    "border-field-border bg-transparent text-foreground group-[:hover:not(:disabled)]/button:border-primary group-[:hover:not(:disabled)]/button:bg-primary/5 group-[:hover:not(:disabled)]/button:text-primary",
};
export default function Button({
  children,
  variant = "primary",
  arrow = true,
  direction = "forward",
  className = "",
  ...props
}: ButtonProps) {
  const isBack = direction === "back";
  const classes = [
    "group/button inline-flex min-h-control w-fit max-w-full items-stretch rounded-control text-center text-sm font-medium leading-normal focus-visible:outline-offset-5 disabled:cursor-not-allowed disabled:opacity-45",
    className,
  ].join(" ");
  const icon = arrow && (
    <svg
      className={`block size-6 shrink-0 [transform:translate3d(0,0,0)] transition-[transform] duration-500 ease-in-out motion-reduce:transition-none ${
        isBack
          ? "motion-safe:group-[:focus-visible:not(:disabled)]/button:[transform:translate3d(-4px,0,0)] motion-safe:group-[:hover:not(:disabled)]/button:[transform:translate3d(-4px,0,0)]"
          : "motion-safe:group-[:focus-visible:not(:disabled)]/button:[transform:translate3d(4px,0,0)] motion-safe:group-[:hover:not(:disabled)]/button:[transform:translate3d(4px,0,0)]"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={isBack ? "M20 12H4m6-6-6 6 6 6" : "M4 12h16m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  // Move the visual surface, keeping the pointer target stable at its edges.
  const content = (
    <span
      className={`pointer-events-none flex min-w-0 flex-1 [transform:translate3d(0,0,0)] items-center justify-center gap-6 rounded-control border px-[22px] py-[13px] transition-[transform,background-color,border-color,color] duration-500 ease-in-out motion-safe:group-[:active:not(:disabled)]/button:[transform:translate3d(0,0,0)_scale(0.98)] motion-safe:group-[:hover:not(:disabled):not(:active)]/button:[transform:translate3d(0,-2px,0)] motion-reduce:transition-none ${variants[variant]}`}
    >
      {isBack && icon}
      <span className="min-w-0 wrap-anywhere">{children}</span>
      {!isBack && icon}
    </span>
  );
  if (typeof props.href === "string") {
    return props.href.startsWith("/") ? (
      <Link {...props} className={classes}>
        {content}
      </Link>
    ) : (
      <a {...props} className={classes}>
        {content}
      </a>
    );
  }
  return (
    <button {...props} type={props.type ?? "button"} className={classes}>
      {content}
    </button>
  );
}
