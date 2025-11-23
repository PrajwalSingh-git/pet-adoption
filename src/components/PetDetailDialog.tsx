import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Edit, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

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

interface PetDetailDialogProps {
  pet: Pet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPetUpdated?: () => void;
  onPetDeleted?: () => void;
}

export function PetDetailDialog({ pet, open, onOpenChange, onPetUpdated, onPetDeleted }: PetDetailDialogProps) {
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adoptDialogOpen, setAdoptDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: pet?.name || "",
    species: pet?.species || "",
    breed: pet?.breed || "",
    age: pet?.age || 0,
    gender: pet?.gender || "",
    size: pet?.size || "",
    description: pet?.description || "",
    location: pet?.location || "",
  });

  const handleEdit = () => {
    if (pet) {
      setFormData({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        size: pet.size,
        description: pet.description,
        location: pet.location,
      });
    }
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!pet) return;

    setUploading(true);
    try {
      let photoUrl = pet.photo_url;

      // Handle photo upload if a new file is selected
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${pet.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("pet-photos")
          .upload(fileName, photoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("pet-photos")
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      const { error } = await supabase
        .from("pets")
        .update({
          ...formData,
          photo_url: photoUrl,
        })
        .eq("id", pet.id);

      if (error) throw error;

      toast.success("Pet updated successfully");
      setEditMode(false);
      setPhotoFile(null);
      onPetUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating pet:", error);
      toast.error("Failed to update pet");
    } finally {
      setUploading(false);
    }
  };

  const handleMarkAdopted = async () => {
    if (!pet) return;

    try {
      const { error } = await supabase
        .from("pets")
        .update({ status: "adopted" })
        .eq("id", pet.id);

      if (error) throw error;

      toast.success("Pet marked as adopted");
      setAdoptDialogOpen(false);
      onPetUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error marking pet as adopted:", error);
      toast.error("Failed to mark pet as adopted");
    }
  };

  const handleDelete = async () => {
    if (!pet) return;

    try {
      const { error } = await supabase
        .from("pets")
        .delete()
        .eq("id", pet.id);

      if (error) throw error;

      toast.success("Pet deleted successfully");
      setDeleteDialogOpen(false);
      onPetDeleted?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("Failed to delete pet");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("File must be an image");
        return;
      }
      setPhotoFile(file);
    }
  };

  if (!pet) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Pet" : pet.name}</DialogTitle>
            <DialogDescription>
              {editMode ? "Update pet information" : "Pet details"}
            </DialogDescription>
          </DialogHeader>

          {editMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Species</Label>
                  <Select value={formData.species} onValueChange={(value) => setFormData({ ...formData, species: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="rabbit">Rabbit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Breed</Label>
                  <Input
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Size</Label>
                  <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  {photoFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {photoFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img
                  src={pet.photo_url || "/placeholder.svg"}
                  alt={pet.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="text-lg px-4 py-2">{pet.species}</Badge>
                  <Badge variant={pet.status === "available" ? "default" : "secondary"}>
                    {pet.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <p className="text-sm text-muted-foreground">Breed</p>
                    <p className="font-semibold">{pet.breed}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{pet.location}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">About {pet.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {pet.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => {
                  setEditMode(false);
                  setPhotoFile(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={uploading}>
                  {uploading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {pet.status === "available" && (
                  <Button variant="default" onClick={() => setAdoptDialogOpen(true)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Adopted
                  </Button>
                )}
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {pet.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={adoptDialogOpen} onOpenChange={setAdoptDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Adopted</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark {pet.name} as adopted?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAdopted}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
