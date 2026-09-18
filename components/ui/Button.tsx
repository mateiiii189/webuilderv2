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
    "border-primary bg-primary text-background enabled:hover:border-primary-hover enabled:hover:bg-primary-hover [&:not(button)]:hover:border-primary-hover [&:not(button)]:hover:bg-primary-hover",
  secondary:
    "border-field-border bg-transparent text-foreground enabled:hover:border-primary enabled:hover:bg-primary/5 enabled:hover:text-primary [&:not(button)]:hover:border-primary [&:not(button)]:hover:bg-primary/5 [&:not(button)]:hover:text-primary",
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
    "group/button inline-flex min-h-control w-fit max-w-full items-center justify-center gap-6 rounded-control border px-[22px] py-[13px] text-center text-sm font-medium leading-normal transition-[scale,background-color,border-color,color] duration-500 ease-in-out focus-visible:outline-offset-5 disabled:cursor-not-allowed disabled:opacity-45 motion-safe:enabled:active:scale-[0.98] motion-safe:[&:not(button)]:active:scale-[0.98] motion-reduce:transition-none",
    variants[variant],
    className,
  ].join(" ");
  const icon = arrow && (
    <svg
      className={`size-6 shrink-0 transition-transform duration-500 ease-in-out motion-reduce:transition-none ${
        isBack
          ? "motion-safe:group-hover/button:-translate-x-1 motion-safe:group-focus-visible/button:-translate-x-1"
          : "motion-safe:group-hover/button:translate-x-1 motion-safe:group-focus-visible/button:translate-x-1"
      } group-disabled/button:translate-x-0`}
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
  const content = (
    <>
      {isBack && icon}
      <span className="min-w-0 wrap-anywhere">{children}</span>
      {!isBack && icon}
    </>
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
