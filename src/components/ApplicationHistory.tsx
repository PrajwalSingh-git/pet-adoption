import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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

interface ApplicationHistoryProps {
  userRole: "shelter" | "adopter";
}

export const ApplicationHistory = ({ userRole }: ApplicationHistoryProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

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
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user, userRole]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  if (loading) {
    return (
      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Application History</CardTitle>
          <Button
            variant="outline"
            onClick={() => navigate(`/application-history/${userRole}`)}
          >
            View All
          </Button>
        </div>
      </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Application History</CardTitle>
            <CardDescription>
              Past applications ({history.length} total)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/application-history/${userRole}`)}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No application history yet
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{entry.pet_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {userRole === "shelter"
                          ? `Adopter: ${entry.adopter_name}`
                          : `Shelter: ${entry.shelter_name}`}
                      </p>
                    </div>
                    <Badge className={getStatusColor(entry.status)}>
                      {entry.status}
                    </Badge>
                  </div>
                  <div className="text-xs space-y-1">
                    <p>
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
                          <div className="mt-1 p-2 bg-destructive/10 rounded">
                            <p className="font-medium text-destructive">Reason:</p>
                            <p className="text-muted-foreground">{entry.rejection_reason}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
