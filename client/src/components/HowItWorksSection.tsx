import { Card } from "@/components/ui/card";
import { Upload, Sparkles, ShoppingBag } from "lucide-react";
import yourVisionImage from "@assets/your-vision_1764530395753.jpeg";
import image3 from "@assets/3_1764136309220.png";
import image4 from "@assets/4_1764136309221.png";

const steps = [
  {
    number: 1,
    title: "Share Your Vision",
    description: "Upload an image, type an idea, or browse our curated templates. It takes just seconds.",
    icon: Upload,
    image: yourVisionImage,
  },
  {
    number: 2,
    title: "Get Your Theme & Moodboard",
    description: "AI creates a cohesive theme summary and curated moodboard with 4-6 inspiring images.",
    icon: Sparkles,
    image: image3,
  },
  {
    number: 3,
    title: "Shop with Confidence",
    description: "Receive a starter décor shopping list with cost estimates and direct retailer links.",
    icon: ShoppingBag,
    image: image4,
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            From idea to party-ready in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card
              key={step.number}
              className="p-6 md:p-8 hover-elevate transition-all duration-300"
              data-testid={`card-step-${step.number}`}
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                      {step.number}
                    </div>
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <div className="mt-auto h-48 md:h-56 overflow-hidden rounded-lg">
                  <img
                    src={step.image}
                    alt={step.title}
                    className={`w-full h-full object-cover ${step.number === 3 ? 'object-bottom' : 'object-center'}`}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
