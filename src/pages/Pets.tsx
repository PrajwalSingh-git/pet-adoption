import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Heart, Filter, ArrowLeft } from "lucide-react";
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

const Pets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingForPet, setApplyingForPet] = useState<string | null>(null);
  const [likedPets, setLikedPets] = useState<Set<string>>(new Set());
  const [appliedPets, setAppliedPets] = useState<Set<string>>(new Set());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<{ id: string; name: string; shelterId: string } | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [breedFilter, setBreedFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  useEffect(() => {
    const fetchPets = async () => {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching pets:", error);
      else setPets(data || []);
      setLoading(false);
    };

    const fetchUserData = async () => {
      if (!user) return;

      // Fetch liked pets
      const { data: likedData } = await supabase
        .from("liked_pets")
        .select("pet_id")
        .eq("user_id", user.id);

      if (likedData) {
        setLikedPets(new Set(likedData.map(item => item.pet_id)));
      }

      // Fetch applied pets
      const { data: applicationData } = await supabase
        .from("applications")
        .select("pet_id")
        .eq("adopter_id", user.id);

      if (applicationData) {
        setAppliedPets(new Set(applicationData.map(item => item.pet_id)));
      }
    };

    fetchPets();
    fetchUserData();
  }, [user]);

  // Get unique values for filters
  const uniqueSpecies = [...new Set(pets.map(pet => pet.species))];
  const uniqueBreeds = [...new Set(pets.map(pet => pet.breed))];
  const uniqueLocations = [...new Set(pets.map(pet => pet.location))];

  // Filter pets based on selected filters
  const filteredPets = pets.filter((pet) => {
    if (speciesFilter !== "all" && pet.species !== speciesFilter) return false;
    if (breedFilter !== "all" && pet.breed !== breedFilter) return false;
    if (locationFilter !== "all" && pet.location !== locationFilter) return false;
    return true;
  });

  const handleLikeToggle = async (petId: string, petName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like pets.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const isLiked = likedPets.has(petId);

    if (isLiked) {
      const { error } = await supabase
        .from("liked_pets")
        .delete()
        .eq("user_id", user.id)
        .eq("pet_id", petId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to unlike pet.",
          variant: "destructive",
        });
      } else {
        setLikedPets(prev => {
          const newSet = new Set(prev);
          newSet.delete(petId);
          return newSet;
        });
        toast({
          title: "Removed from favorites",
          description: `${petName} has been removed from your favorites.`,
        });
      }
    } else {
      const { error } = await supabase
        .from("liked_pets")
        .insert({ user_id: user.id, pet_id: petId });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to like pet.",
          variant: "destructive",
        });
      } else {
        setLikedPets(prev => new Set(prev).add(petId));
        toast({
          title: "Added to favorites",
          description: `${petName} has been added to your favorites.`,
        });
      }
    }
  };

  const openConfirmDialog = (petId: string, petName: string, shelterId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for adoption.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (appliedPets.has(petId)) {
      toast({
        title: "Already Applied",
        description: "You have already submitted an application for this pet.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPet({ id: petId, name: petName, shelterId });
    setConfirmDialogOpen(true);
  };

  const handleApplyToAdopt = async () => {
    if (!selectedPet || !user) return;

    setApplyingForPet(selectedPet.id);
    setConfirmDialogOpen(false);

    try {
      const { error } = await supabase
        .from("applications")
        .insert({
          pet_id: selectedPet.id,
          adopter_id: user.id,
          shelter_id: selectedPet.shelterId,
          message: "I would like to adopt this pet!",
          status: "pending"
        });

      if (error) throw error;

      setAppliedPets(prev => new Set(prev).add(selectedPet.id));
      toast({
        title: "Application Submitted!",
        description: "Your adoption application has been sent to the shelter.",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplyingForPet(null);
      setSelectedPet(null);
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

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

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Available Pets</h1>
          <p className="text-muted-foreground text-lg">Find your perfect companion</p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filter Pets</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Species</label>
                <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Species</SelectItem>
                    {uniqueSpecies.map((species) => (
                      <SelectItem key={species} value={species}>
                        {species}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Breed</label>
                <Select value={breedFilter} onValueChange={setBreedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Breeds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Breeds</SelectItem>
                    {uniqueBreeds.map((breed) => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading pets...</p>
        ) : filteredPets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No pets found matching your filters.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSpeciesFilter("all");
                setBreedFilter("all");
                setLocationFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <Card key={pet.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <Link to={`/pets/${pet.id}`} className="block">
                  <img
                    src={pet.photo_url || "/placeholder.svg"}
                    alt={pet.name}
                    className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </Link>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <Link to={`/pets/${pet.id}`}>
                      <h3 className="text-2xl font-bold hover:text-primary transition-colors cursor-pointer">{pet.name}</h3>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleLikeToggle(pet.id, pet.name)}
                      className="hover:bg-transparent"
                    >
                      <Heart className={`h-6 w-6 ${likedPets.has(pet.id) ? "fill-primary text-primary" : "text-primary"}`} />
                    </Button>
                  </div>
                  <p className="text-muted-foreground mb-2">{pet.breed} • {pet.age} years old</p>
                  <Badge className="mb-3">{pet.species}</Badge>
                  <p className="text-sm mb-4 line-clamp-3">{pet.description}</p>
                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={() => openConfirmDialog(pet.id, pet.name, pet.shelter_id)}
                    disabled={applyingForPet === pet.id || appliedPets.has(pet.id)}
                  >
                    {applyingForPet === pet.id 
                      ? "Submitting..." 
                      : appliedPets.has(pet.id)
                      ? "Already Applied"
                      : "Apply to Adopt"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Adoption Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to apply to adopt {selectedPet?.name}? The shelter will review your application and contact you soon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApplyToAdopt}>
              Confirm Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Pets;
