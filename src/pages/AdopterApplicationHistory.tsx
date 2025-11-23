import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Application {
  id: string;
  status: string;
  message: string;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  pet_id: string;
  pets: {
    id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    photo_url: string;
    description: string;
  };
  profiles: {
    shelter_name: string;
    full_name: string;
  };
}

const AdopterApplicationHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          message,
          created_at,
          approved_at,
          rejected_at,
          rejection_reason,
          pet_id,
          shelter_id,
          pets (
            id,
            name,
            species,
            breed,
            age,
            photo_url,
            description
          )
        `)
        .eq("adopter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        setLoading(false);
        return;
      }

      // Fetch shelter profiles separately
      const shelterIds = [...new Set(data?.map(app => app.shelter_id) || [])];
      const { data: shelterData } = await supabase
        .from("profiles")
        .select("id, shelter_name, full_name")
        .in("id", shelterIds);

      const shelterMap = new Map(shelterData?.map(s => [s.id, s]) || []);

      const enrichedData = data?.map(app => ({
        ...app,
        profiles: shelterMap.get(app.shelter_id) || { shelter_name: "", full_name: "" }
      })) || [];

      setApplications(enrichedData as Application[]);
      setFilteredApplications(enrichedData as Application[]);
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
          (app.profiles.shelter_name || app.profiles.full_name).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  }, [searchQuery, statusFilter, applications]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "ignored":
        return "secondary";
      default:
        return "secondary";
    }
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
          <h1 className="text-4xl font-bold mb-2">My Application History</h1>
          <p className="text-muted-foreground text-lg">
            View all your past applications
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by pet name or shelter name..."
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length} total)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" ? "No applications found matching your filters." : "No application history yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="border rounded-lg p-4 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/pets/${app.pet_id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <img
                          src={app.pets.photo_url || "/placeholder.svg"}
                          alt={app.pets.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-semibold text-lg">{app.pets.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {app.pets.breed} • {app.pets.age} years old
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Shelter: {app.profiles.shelter_name || app.profiles.full_name}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">
                        Applied: {format(new Date(app.created_at), "MMM d, yyyy")}
                      </p>
                      {app.approved_at && (
                        <p className="text-green-600 dark:text-green-400">
                          Approved: {format(new Date(app.approved_at), "MMM d, yyyy")}
                        </p>
                      )}
                      {app.rejected_at && (
                        <>
                          <p className="text-red-600 dark:text-red-400">
                            Rejected: {format(new Date(app.rejected_at), "MMM d, yyyy")}
                          </p>
                          {app.rejection_reason && (
                            <div className="mt-2 p-3 bg-destructive/10 rounded border border-destructive/20">
                              <p className="font-medium text-destructive text-sm">Reason:</p>
                              <p className="text-sm text-muted-foreground mt-1">{app.rejection_reason}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
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

export default AdopterApplicationHistory;
