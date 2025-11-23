import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const fetchTheme = async () => {
      if (!user) {
        const savedTheme = localStorage.getItem("theme") as Theme;
        if (savedTheme) {
          setThemeState(savedTheme);
          document.documentElement.classList.toggle("dark", savedTheme === "dark");
        }
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("theme_preference")
        .eq("id", user.id)
        .single();

      if (data?.theme_preference) {
        setThemeState(data.theme_preference as Theme);
        document.documentElement.classList.toggle("dark", data.theme_preference === "dark");
      }
    };

    fetchTheme();
  }, [user]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    if (user) {
      await supabase
        .from("profiles")
        .update({ theme_preference: newTheme })
        .eq("id", user.id);
    } else {
      localStorage.setItem("theme", newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
