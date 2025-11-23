import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Pets from "./pages/Pets";
import PetDetail from "./pages/PetDetail";
import FavoritePets from "./pages/FavoritePets";
import AddPet from "./pages/AddPet";
import AdopterProfile from "./pages/AdopterProfile";
import ShelterProfile from "./pages/ShelterProfile";
import ShelterPets from "./pages/ShelterPets";
import ShelterApplications from "./pages/ShelterApplications";
import ApplicationHistoryPage from "./pages/ApplicationHistoryPage";
import AdopterApplicationHistory from "./pages/AdopterApplicationHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/pets/:id" element={<PetDetail />} />
            <Route path="/favorites" element={<FavoritePets />} />
            <Route path="/add-pet" element={<AddPet />} />
            <Route path="/adopter-profile" element={<AdopterProfile />} />
            <Route path="/shelter-profile" element={<ShelterProfile />} />
          <Route path="/shelter-pets" element={<ShelterPets />} />
          <Route path="/shelter-applications" element={<ShelterApplications />} />
          <Route path="/application-history/shelter" element={<ApplicationHistoryPage userRole="shelter" />} />
          <Route path="/application-history/adopter" element={<AdopterApplicationHistory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
