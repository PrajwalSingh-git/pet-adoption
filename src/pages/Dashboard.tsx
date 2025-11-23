import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdopterDashboard from "@/components/dashboards/AdopterDashboard";
import ShelterDashboard from "@/components/dashboards/ShelterDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import { ProfileCompletionDialog } from "@/components/ProfileCompletionDialog";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      const fetchUserRole = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
        } else {
          setUserRole(data?.role);
          setProfileData(data);
          
          // Check if shelter needs to complete profile
          if (data?.role === "shelter") {
            const needsCompletion = !data.shelter_name || !data.phone || !data.address || !data.shelter_description;
            setShowProfileDialog(needsCompletion);
          }
        }
        setLoading(false);
      };

      fetchUserRole();
    }
  }, [user, authLoading, navigate]);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (userRole === "adopter") {
    return (
      <>
        <AdopterDashboard />
      </>
    );
  }

  if (userRole === "shelter") {
    return (
      <>
        <ProfileCompletionDialog 
          open={showProfileDialog} 
          onComplete={() => {
            setShowProfileDialog(false);
            window.location.reload();
          }} 
        />
        <ShelterDashboard />
      </>
    );
  }

  if (userRole === "admin") {
    return (
      <>
        <AdminDashboard />
      </>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Unable to determine user role</p>
    </div>
  );
};

export default Dashboard;
