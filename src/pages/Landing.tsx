import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Search, Home } from "lucide-react";
import Navbar from "@/components/Navbar";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Heart className="h-4 w-4 fill-current" />
            Connect Hearts, Change Lives
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Find Your
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> Perfect </span>
            Companion
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            PawsConnect brings together loving families and pets in need of homes. 
            Start your adoption journey today and make a difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button variant="hero" size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link to="/pets">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Browse Pets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-border">
            <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Easy Search</h3>
            <p className="text-muted-foreground">
              Browse through hundreds of pets with advanced filters to find your perfect match.
            </p>
          </div>

          <div className="bg-card rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-border">
            <div className="bg-secondary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Verified Shelters</h3>
            <p className="text-muted-foreground">
              All shelters are verified to ensure the safety and well-being of every pet.
            </p>
          </div>

          <div className="bg-card rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-border">
            <div className="bg-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Home className="h-7 w-7 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Forever Homes</h3>
            <p className="text-muted-foreground">
              Join thousands of happy families who found their perfect companions through us.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Whether you're looking to adopt or help pets find homes, join our community today.
          </p>
          <Link to="/auth">
            <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90 border-0 text-lg px-8">
              Join PawsConnect
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-primary fill-current" />
            <span className="font-semibold text-foreground">PawsConnect</span>
          </div>
          <p className="text-sm">© 2025 PawsConnect. Helping pets find loving homes.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
