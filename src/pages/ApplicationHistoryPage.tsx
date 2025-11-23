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

interface HistoryEntry {
  id: string;
  pet_name: string;
  adopter_name: string;
  shelter_name: string;
  status: string;
  applied_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
}

interface ApplicationHistoryPageProps {
  userRole: "shelter" | "adopter";
}

const ApplicationHistoryPage = ({ userRole }: ApplicationHistoryPageProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      const query = supabase
        .from("application_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (userRole === "shelter") {
        query.eq("shelter_id", user.id);
      } else {
        query.eq("adopter_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching history:", error);
      } else {
        setHistory(data || []);
        setFilteredHistory(data || []);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user, userRole]);

  useEffect(() => {
    let filtered = history;

    if (statusFilter !== "all") {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.pet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (userRole === "shelter" 
            ? entry.adopter_name.toLowerCase().includes(searchQuery.toLowerCase())
            : entry.shelter_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredHistory(filtered);
  }, [searchQuery, statusFilter, history, userRole]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
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
          <h1 className="text-4xl font-bold mb-2">Application History</h1>
          <p className="text-muted-foreground text-lg">
            View all past applications
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search by pet name or ${userRole === "shelter" ? "adopter" : "shelter"} name...`}
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
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>History ({filteredHistory.length} total)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" ? "No history found matching your filters." : "No application history yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{entry.pet_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {userRole === "shelter"
                            ? `Adopter: ${entry.adopter_name}`
                            : `Shelter: ${entry.shelter_name}`}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(entry.status)}>
                        {entry.status}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">
                        Applied: {format(new Date(entry.applied_at), "MMM d, yyyy")}
                      </p>
                      {entry.approved_at && (
                        <p className="text-green-600 dark:text-green-400">
                          Approved: {format(new Date(entry.approved_at), "MMM d, yyyy")}
                        </p>
                      )}
                      {entry.rejected_at && (
                        <>
                          <p className="text-red-600 dark:text-red-400">
                            Rejected: {format(new Date(entry.rejected_at), "MMM d, yyyy")}
                          </p>
                          {entry.rejection_reason && (
                            <div className="mt-2 p-3 bg-destructive/10 rounded border border-destructive/20">
                              <p className="font-medium text-destructive text-sm">Reason:</p>
                              <p className="text-sm text-muted-foreground mt-1">{entry.rejection_reason}</p>
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

export default ApplicationHistoryPage;
