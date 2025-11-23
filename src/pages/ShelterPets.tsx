import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Trash2, Edit } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PetDetailDialog } from "@/components/PetDetailDialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  status: string;
  photo_url: string;
  age: number;
  created_at: string;
  description: string;
  gender: string;
  size: string;
  location: string;
  shelter_id: string;
}

const ShelterPets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"remove" | "delete" | "markAvailable">("remove");
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [petDialogOpen, setPetDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPets = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("shelter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pets:", error);
        toast.error("Failed to load pets");
      } else {
        setPets(data || []);
        setFilteredPets(data || []);
      }
      setLoading(false);
    };

    fetchPets();
  }, [user]);

  useEffect(() => {
    let filtered = pets.filter(
      (pet) =>
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.species.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((pet) => pet.status === statusFilter);
    }
    
    setFilteredPets(filtered);
  }, [searchQuery, pets, statusFilter]);

  const openDeleteDialog = (petId: string, type: "remove" | "delete" | "markAvailable") => {
    setPetToDelete(petId);
    setActionType(type);
    setDeleteDialogOpen(true);
  };

  const handlePetAction = async () => {
    if (!petToDelete) return;

    try {
      if (actionType === "delete") {
        const { error } = await supabase
          .from("pets")
          .delete()
          .eq("id", petToDelete);

        if (error) throw error;

        setPets((prev) => prev.filter((pet) => pet.id !== petToDelete));
        toast.success("Pet deleted permanently");
      } else if (actionType === "markAvailable") {
        const { error } = await supabase
          .from("pets")
          .update({ status: "available" })
          .eq("id", petToDelete);

        if (error) throw error;

        setPets((prev) =>
          prev.map((pet) =>
            pet.id === petToDelete ? { ...pet, status: "available" } : pet
          )
        );
        toast.success("Pet marked as available");
      } else {
        const { error } = await supabase
          .from("pets")
          .update({ status: "adopted" })
          .eq("id", petToDelete);

        if (error) throw error;

        setPets((prev) =>
          prev.map((pet) =>
            pet.id === petToDelete ? { ...pet, status: "adopted" } : pet
          )
        );
        toast.success("Pet marked as adopted");
      }
    } catch (error) {
      console.error("Error handling pet action:", error);
      toast.error("Failed to complete action");
    } finally {
      setDeleteDialogOpen(false);
      setPetToDelete(null);
    }
  };

  const openPetDialog = (pet: Pet) => {
    setSelectedPet(pet);
    setPetDialogOpen(true);
  };

  const handlePetUpdated = async () => {
    // Refetch pets from the database
    if (!user) return;
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("shelter_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pets:", error);
    } else {
      setPets(data || []);
    }
  };

  const handlePetDeleted = async () => {
    // Refetch pets from the database
    if (!user) return;
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("shelter_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pets:", error);
    } else {
      setPets(data || []);
    }
    setPetDialogOpen(false);
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
          <h1 className="text-4xl font-bold mb-2">Manage All Pets</h1>
          <p className="text-muted-foreground text-lg">
            View, search, and manage all your pets
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, breed, or species..."
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
              <SelectItem value="all">All Pets</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="adopted">Adopted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Pets ({filteredPets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading pets...</p>
            ) : filteredPets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No pets found matching your search." : "No pets added yet."}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPets.map((pet) => (
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
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-lg">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {pet.breed} • {pet.age} years
                      </p>
                      <Badge
                        variant={pet.status === "available" ? "default" : "secondary"}
                      >
                        {pet.status}
                      </Badge>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPetDialog(pet)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {pet.status === "adopted" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openDeleteDialog(pet.id, "markAvailable")}
                          >
                            Mark Available
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openDeleteDialog(pet.id, "remove")}
                          >
                            Mark Adopted
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(pet.id, "delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "delete" 
                ? "Delete Pet Permanently" 
                : actionType === "markAvailable"
                ? "Mark as Available"
                : "Mark as Adopted"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "delete"
                ? "Are you sure you want to permanently delete this pet? This action cannot be undone."
                : actionType === "markAvailable"
                ? "Are you sure you want to mark this pet as available? This will list it for adoption again."
                : "Are you sure you want to mark this pet as adopted? This will remove it from available listings."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePetAction}
              className={actionType === "delete" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {actionType === "delete" ? "Delete" : actionType === "markAvailable" ? "Mark Available" : "Mark Adopted"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedPet && (
        <PetDetailDialog
          pet={selectedPet}
          open={petDialogOpen}
          onOpenChange={setPetDialogOpen}
          onPetUpdated={handlePetUpdated}
          onPetDeleted={handlePetDeleted}
        />
      )}
    </div>
  );
};

export default ShelterPets;
