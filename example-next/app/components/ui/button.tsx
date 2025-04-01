import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-800/90",
        destructive:
          "bg-red-500/90 text-neutral-50 shadow-sm hover:bg-red-500/80",
        outline:
          "border border-neutral-800 bg-transparent shadow-sm hover:bg-neutral-900/80 hover:text-neutral-50",
        secondary:
          "bg-neutral-800 text-neutral-50 shadow-sm hover:bg-neutral-800/80",
        ghost: "hover:bg-neutral-900/80 hover:text-neutral-50",
        link: "text-neutral-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variants.variant;
  size?: keyof typeof buttonVariants.variants.size;
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
