import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Mail, Clock, CheckCircle, XCircle, Trash2, PawPrint, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatListDialog } from "@/components/ChatListDialog";
import { ApplicationHistory } from "@/components/ApplicationHistory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface Application {
  id: string;
  status: string;
  message: string;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  pet_id: string;
  pets: {
    id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    photo_url: string;
    description: string;
  };
}


const AdopterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [applications, setApplications] = useState<Application[]>([]);
  const [likedPetsCount, setLikedPetsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [applicationFilter, setApplicationFilter] = useState<string>("all");
  const applicationsRef = useRef<HTMLDivElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);

  const scrollToApplications = () => {
    applicationsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openDeleteDialog = (applicationId: string) => {
    setApplicationToDelete(applicationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    const app = applications.find(a => a.id === applicationToDelete);
    if (app && (app.status === "approved" || app.status === "rejected")) {
      toast({
        title: "Cannot delete",
        description: `${app.status === "approved" ? "Approved" : "Rejected"} applications cannot be deleted.`,
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationToDelete);

      if (error) throw error;

      setApplications(prev => prev.filter(app => app.id !== applicationToDelete));
      toast({
        title: "Application deleted",
        description: "Your application has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Error",
        description: "Failed to delete application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
    }
  };


  const filteredApplications = applications.filter((app) => {
    if (applicationFilter === "all") return true;
    return app.status === applicationFilter;
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setUserName(profileData.full_name);
        setAvatarUrl(profileData.avatar_url || "");
      }

      // Fetch applications
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          message,
          created_at,
          approved_at,
          rejected_at,
          pet_id,
          pets (
            id,
            name,
            species,
            breed,
            age,
            photo_url,
            description
          )
        `)
        .eq("adopter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        setApplications((data || []) as Application[]);
      }

      // Fetch liked pets count
      const { count, error: likedError } = await supabase
        .from("liked_pets")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

      if (likedError) {
        console.error("Error fetching liked pets:", likedError);
      } else {
        setLikedPetsCount(count || 0);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-secondary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-accent/10 text-accent border-accent/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome {userName}!</h1>
            <p className="text-muted-foreground text-lg">Manage your pet adoption journey</p>
          </div>
          <Avatar className="h-20 w-20 border-4 border-primary/20">
            <AvatarImage src={avatarUrl} alt="Profile" />
            <AvatarFallback>
              <User className="h-10 w-10 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => {
              setApplicationFilter("all");
              scrollToApplications();
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => {
              setApplicationFilter("pending");
              scrollToApplications();
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {applications.filter(app => app.status === "pending").length}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => {
              setApplicationFilter("approved");
              scrollToApplications();
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {applications.filter(app => app.status === "approved").length}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => navigate("/favorites")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Favorite Pets</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{likedPetsCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex gap-4">
          <Button 
            onClick={() => navigate("/pets")} 
            size="lg"
            className="flex-1 md:flex-initial"
          >
            <PawPrint className="h-5 w-5 mr-2" />
            Adopt Pets
          </Button>
          <ChatListDialog userRole="adopter" />
        </div>

        <div className="grid gap-6">
          <Card className="shadow-lg" ref={applicationsRef}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Pending Applications</CardTitle>
                  <CardDescription>
                    Track the status of your pending adoption applications
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  View All Applications
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading applications...</p>
              ) : applications.filter(app => app.status === "pending").length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You don't have any pending applications.
                  </p>
                  <Link to="/pets">
                    <Button variant="default">Browse Pets</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.filter(app => app.status === "pending").slice(0, 5).map((app) => (
                    <div 
                      key={app.id} 
                      className="flex items-center gap-4 p-4 border rounded-lg transition-colors cursor-pointer group"
                      onClick={() => navigate(`/pets/${app.pet_id}`)}
                    >
                      <img
                        src={app.pets.photo_url || "/placeholder.svg"}
                        alt={app.pets.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{app.pets.name}</h3>
                        <p className="text-sm text-muted-foreground">{app.pets.breed} • {app.pets.age} years old</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </p>
                          {app.approved_at && (
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                              • Approved {format(new Date(app.approved_at), "MMM d, yyyy")}
                            </p>
                          )}
                          {app.rejected_at && (
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">
                              • Rejected {format(new Date(app.rejected_at), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                        {app.status === "rejected" && app.rejection_reason && (
                          <div className="mt-2 p-2 bg-destructive/10 rounded">
                            <p className="text-xs font-medium text-destructive mb-1">Rejection Reason:</p>
                            <p className="text-xs text-muted-foreground">{app.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(app.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(app.status)}
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </Badge>
                        {isMobile ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={app.status === "approved"}
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(app.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={app.status === "approved"}
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(app.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <ApplicationHistory userRole="adopter" />
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteApplication} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdopterDashboard;
