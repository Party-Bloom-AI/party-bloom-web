import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const features = [
  "Unlimited theme generations",
  "Curated moodboards with 4-6 images",
  "Shopping list with cost estimates",
  "Save and revisit your party plans",
  "Access to 100+ preset themes",
  "Priority customer support",
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Start Planning for Free
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Try Party Bloom free — no credit card required
          </p>
        </div>

        <Card className="p-8 md:p-12" data-testid="card-pricing">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Free to Try</h3>
            <p className="text-muted-foreground mb-4">
              Create your first party decoration plan with full access to all features
            </p>
            <div className="inline-block">
              <p className="text-sm text-muted-foreground mb-6">
                Premium subscription coming soon for unlimited parties
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3"
                data-testid={`feature-${index}`}
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full text-lg py-6 h-auto"
            onClick={() => console.log("Start free trial clicked")}
            data-testid="button-start-free"
          >
            Start Planning Your Party
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            No credit card required • Takes less than 2 minutes
          </p>
        </Card>
      </div>
    </section>
  );
}
