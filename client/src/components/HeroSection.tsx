import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@assets/6_1764136309222.png";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Plan a Perfect Party Decoration{" "}
              <span className="text-primary">in 10 Minutes</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Turn your idea into a complete theme, curated moodboard, and shopping list. 
              The antidote to endless Pinterest scrolling for busy parents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => console.log("Plan my party clicked")}
                data-testid="button-hero-cta"
                className="text-base px-8 py-6 h-auto"
              >
                Plan My Party in 10 Minutes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const element = document.getElementById("how-it-works");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                data-testid="button-see-how"
                className="text-base px-8 py-6 h-auto"
              >
                See How It Works
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Party planning app interface"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
