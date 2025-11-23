import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Building2, FileText } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalPets: number;
  totalShelters: number;
  totalApplications: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPets: 0,
    totalShelters: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [usersResult, petsResult, sheltersResult, appsResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("pets").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }).eq("role", "shelter"),
        supabase.from("applications").select("id", { count: "exact" }),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalPets: petsResult.count || 0,
        totalShelters: sheltersResult.count || 0,
        totalApplications: appsResult.count || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">Platform overview and analytics</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered users</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{loading ? "..." : stats.totalPets}</div>
              <p className="text-xs text-muted-foreground mt-1">Listed for adoption</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Shelters</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{loading ? "..." : stats.totalShelters}</div>
              <p className="text-xs text-muted-foreground mt-1">Verified shelters</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{loading ? "..." : stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground mt-1">Total submissions</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>Overview of platform activity and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Adoption Success Rate</p>
                  <p className="text-sm text-muted-foreground">Based on approved applications</p>
                </div>
                <div className="text-2xl font-bold text-accent">
                  {stats.totalApplications > 0 
                    ? Math.round((stats.totalApplications / stats.totalPets) * 100) 
                    : 0}%
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Average Pets per Shelter</p>
                  <p className="text-sm text-muted-foreground">Platform average</p>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {stats.totalShelters > 0 
                    ? Math.round(stats.totalPets / stats.totalShelters) 
                    : 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
