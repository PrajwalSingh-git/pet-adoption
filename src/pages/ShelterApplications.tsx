import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input as InputUI } from "@/components/ui/input";
import { ArrowLeft, Search, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ChatDialog } from "@/components/ChatDialog";
import { EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

const ShelterApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('status') || 'all';
  });
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [adopterProfile, setAdopterProfile] = useState<AdopterProfile | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      const { data, error } = await supabase
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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications");
      } else {
        setApplications(data || []);
        setFilteredApplications(data || []);
      }
      setLoading(false);
    };

    fetchApplications();
  }, [user]);

  useEffect(() => {
    let filtered = applications;

    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.pets.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.pets.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.pets.species.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  }, [searchQuery, statusFilter, applications]);

  const openApplicationDetails = async (app: Application) => {
    setSelectedApplication(app);
    
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("full_name, email, phone, avatar_url")
      .eq("id", app.adopter_id)
      .single();

    if (error) {
      console.error("Error fetching adopter profile:", error);
      toast.error("Failed to load adopter details");
    } else {
      setAdopterProfile(profileData);
    }
    
    setSheetOpen(true);
  };

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
      setPendingAction("reject");
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

    // Find the pet_id from the application
    const petId = selectedApplication.pet_id;

    // Update pet status to adopted
    const { error: petError } = await supabase
      .from("pets")
      .update({ status: "adopted" })
      .eq("id", petId);

    if (petError) {
      console.error("Error updating pet status:", petError);
    }

    setApplications(prev =>
      prev.map(app =>
        app.id === selectedApplication.id 
          ? { ...app, status: "approved", approved_at: new Date().toISOString() } 
          : app
      )
    );
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
      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApplication.id 
            ? { ...app, status: "rejected", approved_at: null, rejected_at: new Date().toISOString(), rejection_reason: rejectionReason } 
            : app
        )
      );
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
    
    if (pendingAction === "reject") {
      await confirmReject();
    }
    setPendingAction(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">All Applications</h1>
          <p className="text-muted-foreground text-lg">
            Review and manage all adoption applications
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <InputUI
              placeholder="Search by pet name, breed, or species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading applications...</p>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" ? "No applications found matching your filters." : "No applications yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
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
                          {app.status === "approved" && app.approved_at && (
                            <p className="text-xs text-green-600 font-medium">
                              Approved on {new Date(app.approved_at).toLocaleDateString()}
                            </p>
                          )}
                          {app.status === "rejected" && app.rejected_at && (
                            <p className="text-xs text-destructive font-medium">
                              Rejected on {new Date(app.rejected_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                          {app.status}
                        </Badge>
                        {(app.status === "approved" || app.status === "rejected") && app.deletion_scheduled_at && (
                          <p className="text-xs text-muted-foreground">
                            Removes in {calculateDaysRemaining(app.deletion_scheduled_at)} days
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Application Details</SheetTitle>
            <SheetDescription>Review the application and adopter information</SheetDescription>
          </SheetHeader>

          {selectedApplication && adopterProfile && (
            <div className="mt-6 space-y-6">
              <div className="flex flex-col gap-4 pb-4 border-b">
                <div className="flex gap-4">
                  <Button
                    onClick={handleApprove}
                    disabled={selectedApplication.status === "approved"}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {selectedApplication.status === "approved" ? "Approved" : "Approve"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={selectedApplication.status === "rejected"}
                    className="flex-1"
                  >
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
                      <AvatarImage src={adopterProfile.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{adopterProfile.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{adopterProfile.full_name}</p>
                      <p className="text-sm text-muted-foreground">{adopterProfile.email}</p>
                      <p className="text-sm text-muted-foreground">{adopterProfile.phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Message:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedApplication.message}
                    </p>
                  </div>
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
                      {selectedApplication.pets.species} • {selectedApplication.pets.breed} • {selectedApplication.pets.age} years
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedApplication.pets.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this adoption application? The adopter will be notified.
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

      <Dialog open={rejectDialogOpen} onOpenChange={(open) => {
        setRejectDialogOpen(open);
        if (!open) setRejectionReason("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this application is being rejected..."
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false);
              setRejectionReason("");
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmReject}
              disabled={!rejectionReason.trim()}
            >
              Reject
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
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ShelterApplications;
