import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import partyImage from "@assets/5_1764137637746.png";

export default function PartyShowcaseSection() {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={partyImage}
          alt="Happy children at a themed birthday party"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center text-white space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">Create memories that last</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            From Vision to Celebration in Minutes
          </h2>

          <p className="text-lg md:text-xl text-white/90">
            Join thousands of parents who've created magical birthday moments without the stress. 
            Your child's perfect party is just a few clicks away.
          </p>

          <Link href="/auth">
            <Button
              size="lg"
              data-testid="button-showcase-cta"
              className="text-base px-8 py-6 h-auto bg-white text-foreground hover:bg-white/90"
            >
              Start Planning Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
