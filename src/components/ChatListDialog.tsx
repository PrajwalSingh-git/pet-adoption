import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { ChatDialog } from "./ChatDialog";

interface ChatContact {
  id: string;
  name: string;
  lastMessage?: string;
  applicationId: string;
}

interface ChatListDialogProps {
  userRole: "shelter" | "adopter";
}

export const ChatListDialog = ({ userRole }: ChatListDialogProps) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);

  useEffect(() => {
    if (!open || !user) return;

    const fetchContacts = async () => {
      if (userRole === "shelter") {
        // Get all users who have applied to this shelter
        const { data, error } = await supabase
          .from("applications")
          .select(`
            id,
            adopter_id,
            profiles!applications_adopter_id_fkey (
              full_name
            )
          `)
          .eq("shelter_id", user.id);

        if (error) {
          console.error("Error fetching contacts:", error);
          return;
        }

        // Remove duplicates by adopter_id
        const uniqueContacts = new Map<string, ChatContact>();
        data?.forEach((app: any) => {
          if (!uniqueContacts.has(app.adopter_id)) {
            uniqueContacts.set(app.adopter_id, {
              id: app.adopter_id,
              name: app.profiles.full_name,
              applicationId: app.id,
            });
          }
        });

        setContacts(Array.from(uniqueContacts.values()));
      } else {
        // Get all shelters this user has applied to
        const { data, error } = await supabase
          .from("applications")
          .select(`
            id,
            shelter_id,
            profiles!applications_shelter_id_fkey (
              full_name,
              shelter_name
            )
          `)
          .eq("adopter_id", user.id);

        if (error) {
          console.error("Error fetching contacts:", error);
          return;
        }

        // Remove duplicates by shelter_id
        const uniqueContacts = new Map<string, ChatContact>();
        data?.forEach((app: any) => {
          if (!uniqueContacts.has(app.shelter_id)) {
            uniqueContacts.set(app.shelter_id, {
              id: app.shelter_id,
              name: app.profiles.shelter_name || app.profiles.full_name,
              applicationId: app.id,
            });
          }
        });

        setContacts(Array.from(uniqueContacts.values()));
      }
    };

    fetchContacts();
  }, [open, user, userRole]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            My Chats
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>My Conversations</DialogTitle>
            <DialogDescription>
              Chat with {userRole === "shelter" ? "adopters" : "shelters"}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {contacts.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm">
                  No conversations yet
                </p>
              ) : (
                contacts.map((contact) => (
                  <Button
                    key={contact.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {contact.name}
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {selectedContact && (
        <ChatDialog
          applicationId={selectedContact.applicationId}
          otherPartyName={selectedContact.name}
        />
      )}
    </>
  );
};
