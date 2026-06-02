import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names cleanly using clsx and tailwind-merge.
 * Used for dynamic Tailwind CSS conditional classes.
 *
 * @param inputs - List of class values to merge.
 * @returns Combined and resolved className string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
