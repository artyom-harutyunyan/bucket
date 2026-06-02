import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const variants = {
    primary:
      "bg-stone-800 text-white hover:bg-stone-700 disabled:bg-stone-400",
    secondary:
      "bg-stone-100 text-stone-800 border border-stone-300 hover:bg-stone-200",
    danger: "bg-red-700 text-white hover:bg-red-600 disabled:bg-red-300",
    ghost: "text-stone-600 hover:bg-stone-100",
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 ${className}`}
      {...props}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-sm font-medium text-stone-700">
      {children}
    </label>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-stone-200 bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
