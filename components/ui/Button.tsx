import type {
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";

type SharedProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  arrow?: boolean;
  direction?: "forward" | "back";
  className?: string;
};

type ButtonProps = SharedProps &
  (
    | ({
        href: string;
      } & Omit<
        ComponentPropsWithoutRef<"a">,
        "children" | "className" | "href"
      >)
    | ({
        href?: never;
      } & Omit<
        ComponentPropsWithoutRef<"button">,
        "children" | "className"
      >)
  );

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
    "wb-button",
    `wb-button--${variant}`,
    isBack ? "wb-button--back" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const arrowIcon = arrow ? (
    <span
      className="wb-button__arrow"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d={
            isBack
              ? "M20 12H4m6-6-6 6 6 6"
              : "M4 12h16m-6-6 6 6-6 6"
          }
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  ) : null;

  const content = (
    <>
      {isBack && arrowIcon}

      <span className="wb-button__label">
        {children}
      </span>

      {!isBack && arrowIcon}
    </>
  );

  if (typeof props.href === "string") {
    return (
      <a {...props} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={classes}
    >
      {content}
    </button>
  );
}