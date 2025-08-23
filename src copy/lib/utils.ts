// import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// This is your existing, correct function. It should stay.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- ADD THE FOLLOWING CODE BELOW YOUR EXISTING `cn` FUNCTION ---

/**
 * A helper function to check if an item is a non-array object.
 */
const isObject = (item: any): boolean => {
  return (item && typeof item === 'object' && !Array.isArray(item));
};

/**
 * Recursively merges properties from a source object into a target object.
 * This is useful for combining a default configuration with user-specific data from a database.
 * @param target The base object (e.g., default settings).
 * @param source The object with new properties to merge in (e.g., data from DB).
 * @returns A new object with the merged properties.
 */
export function deepMerge(target: any, source: any): any {
  // Start with a shallow copy of the target
  const output = { ...target };

  // Ensure both are valid objects before attempting to merge
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      // If the property in the source is also a nested object
      if (isObject(source[key])) {
        // If the key doesn't exist in the target, just add it
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          // If the key exists in both, recurse to merge the nested objects
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        // If the property is not an object (e.g., string, number), just overwrite it
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}