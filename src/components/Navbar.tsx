import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, User, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "./ThemeToggle";
const Navbar = () => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const handleProfileClick = async () => {
    if (!user) return;
    const {
      data: profile
    } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role === "shelter") {
      navigate("/shelter-profile");
    } else {
      navigate("/adopter-profile");
    }
  };
  return <nav className="border-b bg-card shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
          <Heart className="h-6 w-6 fill-current" />
          PawsConnect
        </Link>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleProfileClick}>
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-base text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </> : <Link to="/auth">
              <Button variant="default" size="sm">
                Get Started
              </Button>
            </Link>}
        </div>
      </div>
    </nav>;
};
export default Navbar;