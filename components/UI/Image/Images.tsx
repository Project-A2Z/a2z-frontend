"use client";

import React, { useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

interface ImageProps {
  src: string | StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  priority?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  fallbackSrc?: string;
  fill?: boolean;
  onClick?: () => void;
}

export function CustomImage({
  src,
  alt,
  width,
  height,
  className,
  objectFit = "cover",
  priority,
  rounded = "none",
  fallbackSrc = "/acessts/NoImage.jpg",
  fill,
  onClick,
  ...props
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
  };

  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        roundedClasses[rounded],
        className
      )}
      onClick={onClick}
    >
      <Image
        src={imgSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        onError={handleError}
        priority={priority}
        className={cn(
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down",
          "transition-opacity duration-300"
        )}
        {...props}
      />
    </div>
  );
}
