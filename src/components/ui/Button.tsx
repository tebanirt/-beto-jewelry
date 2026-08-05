import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "gold";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  external?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-beto-black text-beto-white border border-beto-black hover:bg-beto-gold hover:border-beto-gold",
  secondary:
    "bg-transparent text-beto-black border border-beto-black hover:bg-beto-black hover:text-beto-white",
  ghost:
    "bg-transparent text-beto-black border border-transparent hover:text-beto-gold",
  gold:
    "bg-beto-gold text-beto-black border border-beto-gold hover:bg-beto-gold-dark hover:border-beto-gold-dark",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-xs tracking-widest",
  md: "px-7 py-3.5 text-xs tracking-widest",
  lg: "px-10 py-4 text-xs tracking-[0.2em]",
};

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  onClick,
  type = "button",
  disabled = false,
  external = false,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center font-medium uppercase transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beto-gold focus-visible:ring-offset-2",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
