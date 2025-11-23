import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface LikedPet {
  id: string;
  pet_id: string;
  pets: {
    id: string;
    name: string;
    species: string;
    breed: string;
    photo_url: string;
    age: number;
    location: string;
  };
}

const FavoritePets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likedPets, setLikedPets] = useState<LikedPet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPets = async () => {
      if (!user) return;

      const { data: likedData, error: likedError } = await supabase
        .from("liked_pets")
        .select(`
          id,
          pet_id,
          pets (
            id,
            name,
            species,
            breed,
            photo_url,
            age,
            location
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (likedError) {
        console.error("Error fetching liked pets:", likedError);
      } else {
        setLikedPets(likedData || []);
      }

      setLoading(false);
    };

    fetchLikedPets();
  }, [user]);

  const handleUnlikePet = async (likedPetId: string, petName: string) => {
    try {
      const { error } = await supabase
        .from('liked_pets')
        .delete()
        .eq('id', likedPetId);

      if (error) throw error;

      setLikedPets(prev => prev.filter(liked => liked.id !== likedPetId));
      toast({
        title: "Pet removed from favorites",
        description: `${petName} has been removed from your favorites.`,
      });
    } catch (error) {
      console.error('Error removing liked pet:', error);
      toast({
        title: "Error",
        description: "Failed to remove pet from favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/dashboard");
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Favorite Pets</h1>
          <p className="text-muted-foreground text-lg">Pets you've marked as favorites</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Favorite Pets ({likedPets.length})
            </CardTitle>
            <CardDescription>
              Click on any pet to view details or remove them from favorites
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading favorites...</p>
            ) : likedPets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't liked any pets yet.</p>
                <Button variant="default" onClick={() => navigate("/pets")}>
                  Browse Pets
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {likedPets.map((liked) => (
                  <div key={liked.id} className="relative">
                    <Card 
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/pets/${liked.pets.id}`, { state: { fromFavorites: true } })}
                    >
                      <img
                        src={liked.pets.photo_url || "/placeholder.svg"}
                        alt={liked.pets.name}
                        className="w-full h-40 object-cover"
                      />
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-1">{liked.pets.name}</h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          {liked.pets.breed} • {liked.pets.age} years old
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {liked.pets.species}
                        </Badge>
                      </CardContent>
                    </Card>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlikePet(liked.id, liked.pets.name);
                      }}
                    >
                      <Heart className="h-5 w-5 fill-primary text-primary" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FavoritePets;
