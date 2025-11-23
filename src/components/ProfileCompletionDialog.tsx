import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Building2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileCompletionDialogProps {
  open: boolean;
  onComplete: () => void;
}

export const ProfileCompletionDialog = ({ open, onComplete }: ProfileCompletionDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    shelter_name: "",
    phone: "",
    address: "",
    shelter_description: "",
    avatar_url: ""
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, avatar_url: publicUrl });
      toast({
        title: "Success",
        description: "Shelter logo uploaded successfully!",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!formData.shelter_name || !formData.phone || !formData.address || !formData.shelter_description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all mandatory fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          shelter_name: formData.shelter_name,
          phone: formData.phone,
          address: formData.address,
          shelter_description: formData.shelter_description,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Completed!",
        description: "Welcome to your shelter dashboard.",
      });
      onComplete();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Your Shelter Profile</DialogTitle>
          <DialogDescription>
            Please fill in all the required information to get started with your shelter dashboard.
            All fields marked with * are mandatory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shelter_name">Shelter Name *</Label>
                <Input
                  id="shelter_name"
                  required
                  value={formData.shelter_name}
                  onChange={(e) => setFormData({ ...formData, shelter_name: e.target.value })}
                  placeholder="Enter shelter name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter shelter address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shelter_description">Shelter Description *</Label>
                <Textarea
                  id="shelter_description"
                  required
                  value={formData.shelter_description}
                  onChange={(e) => setFormData({ ...formData, shelter_description: e.target.value })}
                  placeholder="Describe your shelter"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-6">
              <Avatar className="h-48 w-48 border-4 border-primary/20">
                <AvatarImage src={formData.avatar_url} alt="Shelter Logo" />
                <AvatarFallback>
                  <Building2 className="h-24 w-24 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="w-full space-y-2">
                <Label htmlFor="avatar">Shelter Logo (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && (
                    <Upload className="h-5 w-5 animate-spin text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Maximum file size: 5MB</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              variant="hero"
              disabled={loading || uploading}
              className="w-full"
            >
              {loading ? "Saving..." : "Complete Profile & Continue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
