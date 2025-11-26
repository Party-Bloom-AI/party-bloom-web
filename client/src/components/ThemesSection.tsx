import { Card } from "@/components/ui/card";
import { useState } from "react";
import princessImage from "@assets/princess_1764138848730.png";
import dinoImage from "@assets/dino_1764138848726.png";
import mermaidImage from "@assets/marmaid_1764138848728.png";
import spaceImage from "@assets/space_1764138848730.png";

//todo: remove mock functionality - replace with real themes from API
const themes = [
  { id: 1, name: "Princess Dreams", image: princessImage },
  { id: 2, name: "Dino Adventure", image: dinoImage },
  { id: 3, name: "Mermaid Splash", image: mermaidImage },
  { id: 4, name: "Space Explorer", image: spaceImage },
];

export default function ThemesSection() {
  const [selectedTheme, setSelectedTheme] = useState<number | null>(null);

  return (
    <section id="themes" className="py-16 md:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Featured Themes
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our curated collection of party themes, or create your own
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className={`group cursor-pointer overflow-hidden hover-elevate active-elevate-2 transition-all duration-300 ${
                selectedTheme === theme.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => {
                setSelectedTheme(theme.id);
                console.log("Theme selected:", theme.name);
              }}
              data-testid={`card-theme-${theme.id}`}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={theme.image}
                  alt={theme.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-lg md:text-xl font-semibold text-center text-white drop-shadow-lg">
                    {theme.name}
                  </h3>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
