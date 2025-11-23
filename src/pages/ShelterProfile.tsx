import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Building2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ShelterProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    shelter_name: "",
    shelter_description: "",
    avatar_url: ""
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setFormData({
          full_name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
          shelter_name: profile.shelter_name || "",
          shelter_description: profile.shelter_description || "",
          avatar_url: profile.avatar_url || ""
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    }
  };

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

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          shelter_name: formData.shelter_name,
          shelter_description: formData.shelter_description,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Profile updated successfully.",
      });
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

        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">Shelter Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
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
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter shelter address"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shelter_description">Shelter Description</Label>
                    <Textarea
                      id="shelter_description"
                      value={formData.shelter_description}
                      onChange={(e) => setFormData({ ...formData, shelter_description: e.target.value })}
                      placeholder="Describe your shelter"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="hero"
                      disabled={loading || uploading}
                      className="flex-1"
                    >
                      {loading ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </div>

              <div className="flex flex-col items-center justify-center space-y-6">
                <Avatar className="h-48 w-48 border-4 border-primary/20">
                  <AvatarImage src={formData.avatar_url} alt="Shelter Logo" />
                  <AvatarFallback>
                    <Building2 className="h-24 w-24 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="w-full space-y-2">
                  <Label htmlFor="avatar">Shelter Logo</Label>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShelterProfile;
