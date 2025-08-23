// src/components/ui/ThemeSelector.tsx

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils"; // Make sure you have this utility or remove it if not

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    // This is the button group that will replace the static buttons
    <div className="flex items-center space-x-2 rounded-lg bg-muted p-1 w-fit">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "justify-start",
          theme === "light" && "bg-background text-foreground shadow-sm"
        )}
        onClick={() => setTheme("light")}
      >
        <Sun className="mr-2 h-4 w-4" />
        Light
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "justify-start",
          theme === "dark" && "bg-background text-foreground shadow-sm"
        )}
        onClick={() => setTheme("dark")}
      >
        <Moon className="mr-2 h-4 w-4" />
        Dark
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "justify-start",
          theme === "system" && "bg-background text-foreground shadow-sm"
        )}
        onClick={() => setTheme("system")}
      >
        <Monitor className="mr-2 h-4 w-4" />
        System
      </Button>
    </div>
  );
}