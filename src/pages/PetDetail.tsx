import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, ArrowLeft, MapPin, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  size: string;
  description: string;
  photo_url: string;
  status: string;
  location: string;
  shelter_id: string;
}

const PetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("I would like to adopt this pet!");

  const fromFavorites = location.state?.fromFavorites;

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fromFavorites ? "/dashboard" : "/pets");
    }
  };

  useEffect(() => {
    const fetchPetDetails = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching pet:", error);
        toast({
          title: "Error",
          description: "Failed to load pet details.",
          variant: "destructive",
        });
        navigate("/pets");
        return;
      }

      setPet(data);
      setLoading(false);

      if (user) {
        // Check if user has liked this pet
        const { data: likedData } = await supabase
          .from("liked_pets")
          .select("id")
          .eq("user_id", user.id)
          .eq("pet_id", id)
          .maybeSingle();

        setIsLiked(!!likedData);

        // Check if user has already applied
        const { data: applicationData } = await supabase
          .from("applications")
          .select("id")
          .eq("adopter_id", user.id)
          .eq("pet_id", id)
          .maybeSingle();

        setHasApplied(!!applicationData);
      }
    };

    fetchPetDetails();
  }, [id, user, navigate, toast]);

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like pets.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!pet) return;

    if (isLiked) {
      const { error } = await supabase
        .from("liked_pets")
        .delete()
        .eq("user_id", user.id)
        .eq("pet_id", pet.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to unlike pet.",
          variant: "destructive",
        });
      } else {
        setIsLiked(false);
        toast({
          title: "Removed from favorites",
          description: `${pet.name} has been removed from your favorites.`,
        });
      }
    } else {
      const { error } = await supabase
        .from("liked_pets")
        .insert({ user_id: user.id, pet_id: pet.id });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to like pet.",
          variant: "destructive",
        });
      } else {
        setIsLiked(true);
        toast({
          title: "Added to favorites",
          description: `${pet.name} has been added to your favorites.`,
        });
      }
    }
  };

  const openConfirmDialog = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for adoption.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleApplyToAdopt = async () => {
    if (!user || !pet) return;

    setApplying(true);
    setConfirmDialogOpen(false);

    try {
      const { error } = await supabase
        .from("applications")
        .insert({
          pet_id: pet.id,
          adopter_id: user.id,
          shelter_id: pet.shelter_id,
          message: applicationMessage,
          status: "pending",
        });

      if (error) throw error;

      setHasApplied(true);
      toast({
        title: "Application Submitted!",
        description: "Your adoption application has been sent to the shelter.",
      });
      setApplicationMessage("I would like to adopt this pet!"); // Reset message
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading pet details...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Pet not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative">
            <img
              src={pet.photo_url || "/placeholder.svg"}
              alt={pet.name}
              className="w-full h-[500px] object-cover rounded-lg shadow-lg"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 rounded-full"
              onClick={handleLikeToggle}
            >
              <Heart
                className={`h-5 w-5 ${isLiked ? "fill-primary text-primary" : ""}`}
              />
            </Button>
          </div>

          <div>
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{pet.name}</h1>
                    <p className="text-xl text-muted-foreground">
                      {pet.breed}
                    </p>
                  </div>
                  <Badge className="text-lg px-4 py-2">{pet.species}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-semibold">{pet.age} years old</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-semibold capitalize">{pet.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-semibold capitalize">{pet.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold capitalize">{pet.status}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 mb-6">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{pet.location}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">About {pet.name}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {pet.description}
                  </p>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={openConfirmDialog}
                  disabled={applying || hasApplied}
                >
                  {applying
                    ? "Submitting..."
                    : hasApplied
                    ? "Application Submitted"
                    : "Apply to Adopt"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to Adopt {pet?.name}</DialogTitle>
            <DialogDescription>
              Send a message to the shelter explaining why you'd like to adopt this pet.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="application-message">Your Message</Label>
            <Textarea
              id="application-message"
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              placeholder="Tell the shelter why you'd be a great match for this pet..."
              rows={5}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyToAdopt} disabled={!applicationMessage.trim()}>
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PetDetail;
