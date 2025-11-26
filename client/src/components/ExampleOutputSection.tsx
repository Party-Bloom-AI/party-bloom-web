import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import moodboardImage from "@assets/2_1764136309219.png";
import shoppingImage from "@assets/4_1764136309221.png";

export default function ExampleOutputSection() {
  //todo: remove mock functionality - replace with real data from API
  const shoppingItems = [
    { name: "Balloons", price: "$10-$20" },
    { name: "Garland", price: "$15-$25" },
    { name: "Birthday Cake", price: "$30-$40" },
    { name: "Cupcakes", price: "$20-$30" },
    { name: "Plates & Napkins", price: "$15-$25" },
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            See What You'll Get
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Real examples of Party Bloom's output — theme moodboards and shopping lists
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          <Card className="p-6 md:p-8" data-testid="card-moodboard-example">
            <h3 className="text-2xl font-semibold mb-6">Curated Moodboard</h3>
            <div className="rounded-lg overflow-hidden mb-4">
              <img
                src={moodboardImage}
                alt="Dino Adventure moodboard"
                className="w-full h-auto"
              />
            </div>
            <p className="text-muted-foreground">
              A cohesive collection of images that bring your theme to life with color palettes, 
              décor inspiration, and visual direction.
            </p>
          </Card>

          <Card className="p-6 md:p-8" data-testid="card-shopping-example">
            <h3 className="text-2xl font-semibold mb-6">Shopping List & Estimates</h3>
            <div className="rounded-lg overflow-hidden mb-6">
              <img
                src={shoppingImage}
                alt="Mermaid Splash shopping list"
                className="w-full h-auto"
              />
            </div>
            <div className="space-y-3">
              {shoppingItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                  data-testid={`item-shopping-${index}`}
                >
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{item.price}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => console.log("Shop clicked for", item.name)}
                      data-testid={`button-shop-${index}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">Estimated Total:</span>
                  <span className="font-bold text-xl text-primary">$90-$130</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
