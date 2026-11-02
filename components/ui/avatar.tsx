import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({
  src,
  name = "User",
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-indigo-700 font-semibold select-none shrink-0 border border-slate-200",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="48px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

