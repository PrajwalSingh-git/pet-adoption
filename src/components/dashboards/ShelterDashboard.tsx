import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Heart, Mail, CheckCircle, Building2, X, Trash2, EyeOff } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChatDialog } from "@/components/ChatDialog";
import { ChatListDialog } from "@/components/ChatListDialog";
import { ApplicationHistory } from "@/components/ApplicationHistory";
import { PetDetailDialog } from "@/components/PetDetailDialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  status: string;
  photo_url: string;
  created_at: string;
}

interface Application {
  id: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  deletion_scheduled_at: string | null;
  adopter_id: string;
  message: string;
  pet_id: string;
  pets: {
    name: string;
    species: string;
    breed: string;
    age: number;
    photo_url: string;
    description: string;
  };
}

interface AdopterProfile {
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
}

const ShelterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [shelterName, setShelterName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [adopterProfile, setAdopterProfile] = useState<AdopterProfile | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [petDialogOpen, setPetDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const [petsResult, appsResult, profileResult] = await Promise.all([
        supabase
          .from("pets")
          .select("*")
          .eq("shelter_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("applications")
          .select(`
            id,
            status,
            created_at,
            approved_at,
            rejected_at,
            rejection_reason,
            deletion_scheduled_at,
            adopter_id,
            message,
            pet_id,
            pets (name, species, breed, age, photo_url, description)
          `)
          .eq("shelter_id", user.id)
          .neq("status", "ignored")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("shelter_name, avatar_url")
          .eq("id", user.id)
          .single()
      ]);

      if (petsResult.error) console.error("Error fetching pets:", petsResult.error);
      else setPets(petsResult.data || []);

      if (appsResult.error) console.error("Error fetching applications:", appsResult.error);
      else setApplications((appsResult.data || []) as Application[]);

      if (profileResult.error) console.error("Error fetching profile:", profileResult.error);
      else {
        setShelterName(profileResult.data?.shelter_name || "Shelter");
        setAvatarUrl(profileResult.data?.avatar_url || "");
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleApprove = () => {
    if (!selectedApplication) return;
    
    if (selectedApplication.status === "approved") {
      toast.error("Application is already approved");
      return;
    }
    
    setApproveDialogOpen(true);
  };

  const handleReject = () => {
    if (!selectedApplication) return;
    
    if (selectedApplication.status === "approved") {
      setPasswordDialogOpen(true);
    } else {
      setRejectDialogOpen(true);
    }
  };

  const confirmApprove = async () => {
    if (!selectedApplication) return;

    // Update application status
    const { error: appError } = await supabase
      .from("applications")
      .update({ status: "approved" })
      .eq("id", selectedApplication.id);

    if (appError) {
      console.error("Error approving application:", appError);
      toast.error("Failed to approve application");
      setApproveDialogOpen(false);
      return;
    }

    // Update pet status to adopted
    const { error: petError } = await supabase
      .from("pets")
      .update({ status: "adopted" })
      .eq("id", selectedApplication.pet_id);

    if (petError) {
      console.error("Error updating pet status:", petError);
    }

    setApplications(applications.map(app => 
      app.id === selectedApplication.id 
        ? { ...app, status: "approved", approved_at: new Date().toISOString() } 
        : app
    ));
    
    // Update pets list
    setPets(pets.map(pet =>
      pet.id === selectedApplication.pet_id
        ? { ...pet, status: "adopted" }
        : pet
    ));

    toast.success("Application approved and pet marked as adopted");
    setSheetOpen(false);
    setApproveDialogOpen(false);
  };

  const confirmReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    const { error } = await supabase
      .from("applications")
      .update({ 
        status: "rejected",
        rejection_reason: rejectionReason
      })
      .eq("id", selectedApplication.id);

    if (error) {
      console.error("Error rejecting application:", error);
      toast.error("Failed to reject application");
    } else {
      setApplications(applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: "rejected", approved_at: null, rejected_at: new Date().toISOString(), rejection_reason: rejectionReason } 
          : app
      ));
      toast.success("Application rejected");
      setSheetOpen(false);
      setRejectionReason("");
    }
    setRejectDialogOpen(false);
  };

  const handleIgnoreApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "ignored" })
        .eq("id", applicationId);

      if (error) throw error;

      setApplications(prev => prev.filter(app => app.id !== applicationId));
      toast.success("Application ignored");
      setSheetOpen(false);
    } catch (error) {
      console.error("Error ignoring application:", error);
      toast.error("Failed to ignore application");
    }
  };

  const calculateDaysRemaining = (deletion_date: string | null) => {
    if (!deletion_date) return null;
    const days = Math.max(0, Math.ceil((new Date(deletion_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    return days;
  };

  const verifyPasswordAndReject = async () => {
    if (!password || !user) return;

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password: password,
    });

    if (error) {
      toast.error("Incorrect password");
      return;
    }

    setPassword("");
    setPasswordDialogOpen(false);
    await confirmReject();
  };

  const openApplicationDetails = async (app: Application) => {
    setSelectedApplication(app);
    
    // Fetch adopter profile
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email, phone, avatar_url")
      .eq("id", app.adopter_id)
      .single();

    if (error) {
      console.error("Error fetching adopter profile:", error);
    } else {
      setAdopterProfile(data);
    }
    
    setSheetOpen(true);
  };

  const openPetDialog = (pet: Pet) => {
    setSelectedPet(pet);
    setPetDialogOpen(true);
  };

  const handlePetUpdated = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("pets")
      .select("*")
      .eq("shelter_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setPets(data);
  };

  const handlePetDeleted = () => {
    if (selectedPet) {
      setPets(pets.filter(p => p.id !== selectedPet.id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage src={avatarUrl} alt="Shelter Logo" />
              <AvatarFallback>
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold mb-2">{shelterName} Dashboard</h1>
              <p className="text-muted-foreground text-lg">Manage your pets and applications</p>
            </div>
          </div>
          <div className="flex gap-4">
            <ChatListDialog userRole="shelter" />
            <Link to="/add-pet">
              <Button variant="hero" size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Pet
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => navigate("/shelter-pets")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pets.length}</div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => navigate("/shelter-pets?status=available")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground fill-current text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {pets.filter(pet => pet.status === "available").length}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => navigate("/shelter-applications")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">All Applications</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {applications.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
         <Card className="shadow-lg">
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Pending Applications</CardTitle>
        <CardDescription>Review and manage adoption applications</CardDescription>
      </div>
      <Button
        variant="outline"
        onClick={() => navigate("/shelter-applications?status=pending")}
      >
        View All
      </Button>
    </div>
  </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading applications...</p>
              ) : applications.filter(app => app.status === "pending").length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending applications</p>
              ) : (
                <div className="space-y-4">
                  {applications.filter(app => app.status === "pending").slice(0, 5).map((app) => (
                    <div 
                      key={app.id}
                      className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => openApplicationDetails(app)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-3 flex-1">
                          <img
                            src={app.pets.photo_url || "/placeholder.svg"}
                            alt={app.pets.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{app.pets.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {app.pets.breed} • {app.pets.age} years
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Applied {new Date(app.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <Badge>{app.status}</Badge>
                          {(app.status === "approved" || app.status === "rejected") && app.deletion_scheduled_at && (
                            <p className="text-xs text-muted-foreground">
                              Removes in {calculateDaysRemaining(app.deletion_scheduled_at)} days
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {applications.filter(app => app.status === "pending").length > 5 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => navigate("/shelter-applications?status=pending")}>
                        View All
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Pets</CardTitle>
                  <CardDescription>Recently added pets</CardDescription>
                </div>
                <Button variant="outline" onClick={() => navigate("/shelter-pets")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading pets...</p>
              ) : pets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't added any pets yet.</p>
                  <Link to="/add-pet">
                    <Button variant="default">Add Your First Pet</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pets.slice(0, 4).map((pet) => (
                    <div 
                      key={pet.id}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <img
                        src={pet.photo_url || "/placeholder.svg"}
                        alt={pet.name}
                        className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openPetDialog(pet)}
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{pet.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{pet.breed}</p>
                        <Badge 
                          className="mt-2" 
                          variant={pet.status === "available" ? "default" : "secondary"}
                        >
                          {pet.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <ApplicationHistory userRole="shelter" />
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedApplication && adopterProfile && (
            <>
              <SheetHeader>
                <SheetTitle>Application Details</SheetTitle>
                <SheetDescription>
                  Review the application and applicant information
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="flex flex-col gap-4 pb-4 border-b">
                  <div className="flex gap-4">
                    <Button
                      onClick={handleApprove}
                      disabled={selectedApplication.status === "approved"}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {selectedApplication.status === "approved" ? "Approved" : "Approve"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={selectedApplication.status === "rejected"}
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <ChatDialog 
                      applicationId={selectedApplication.id} 
                      otherPartyName={adopterProfile?.full_name || "Adopter"}
                    />
                  </div>
                  {selectedApplication.status === "pending" && (
                    <Button
                      variant="outline"
                      onClick={() => handleIgnoreApplication(selectedApplication.id)}
                      className="w-full"
                    >
                      <EyeOff className="mr-2 h-4 w-4" />
                      Ignore Application
                    </Button>
                  )}
                  {(selectedApplication.status === "approved" || selectedApplication.status === "rejected") && selectedApplication.deletion_scheduled_at && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground text-center">
                        This application will be automatically removed in{" "}
                        <span className="font-semibold text-foreground">
                          {calculateDaysRemaining(selectedApplication.deletion_scheduled_at)} days
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Applicant Information</h3>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={adopterProfile.avatar_url} />
                        <AvatarFallback>{adopterProfile.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{adopterProfile.full_name}</p>
                        <p className="text-sm text-muted-foreground">{adopterProfile.email}</p>
                        <p className="text-sm text-muted-foreground">{adopterProfile.phone}</p>
                      </div>
                    </div>
                    <div className="pt-4">
                      <h4 className="font-medium mb-2">Application Message</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {selectedApplication.message || "No message provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Applied on {new Date(selectedApplication.created_at).toLocaleDateString()}
                      </p>
                      {selectedApplication.status === "approved" && selectedApplication.approved_at && (
                        <p className="text-sm text-green-600 font-medium">
                          Approved on {new Date(selectedApplication.approved_at).toLocaleDateString()}
                        </p>
                      )}
                  {selectedApplication.status === "rejected" && selectedApplication.rejected_at && (
                    <>
                      <p className="text-sm text-destructive font-medium">
                        Rejected on {new Date(selectedApplication.rejected_at).toLocaleDateString()}
                      </p>
                      {selectedApplication.rejection_reason && (
                        <div className="mt-2 p-3 bg-destructive/10 rounded-lg">
                          <p className="text-sm font-medium text-destructive mb-1">Rejection Reason:</p>
                          <p className="text-sm text-muted-foreground">{selectedApplication.rejection_reason}</p>
                        </div>
                      )}
                    </>
                  )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Pet Information</h3>
                    <img
                      src={selectedApplication.pets.photo_url || "/placeholder.svg"}
                      alt={selectedApplication.pets.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-lg">{selectedApplication.pets.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize mb-2">
                        {selectedApplication.pets.breed} • {selectedApplication.pets.age} years old
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedApplication.pets.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this adoption application? The pet will be marked as adopted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove} className="bg-green-600 hover:bg-green-700">
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">Rejection Reason *</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false);
              setRejectionReason("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmReject} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={!rejectionReason.trim()}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Password</DialogTitle>
            <DialogDescription>
              This application has been approved. Please enter your password to reject it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && verifyPasswordAndReject()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPasswordDialogOpen(false);
              setPassword("");
            }}>
              Cancel
            </Button>
            <Button onClick={verifyPasswordAndReject} className="bg-destructive hover:bg-destructive/90">
              Confirm Reject
            </Button>
          </DialogFooter>

          {selectedPet && (
                  <PetDetailDialog
                    pet={selectedPet}
                    open={petDialogOpen}
                    onOpenChange={setPetDialogOpen}
                    onPetUpdated={handlePetUpdated}
                    onPetDeleted={handlePetDeleted}
                  />
                )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShelterDashboard;
