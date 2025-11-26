import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

//todo: remove mock functionality - replace with real testimonials from API
const testimonials = [
  {
    name: "Sarah M.",
    childAge: "Mom of 5-year-old",
    quote: "Party Bloom saved me hours of scrolling through Pinterest! I had a complete plan in minutes, and my daughter's unicorn party was absolutely perfect.",
    rating: 5,
    initials: "SM",
  },
  {
    name: "Jennifer K.",
    childAge: "Mom of twins (7)",
    quote: "As a working mom, I don't have time for endless party planning. This tool gave me everything I needed — theme, shopping list, budget — in one place.",
    rating: 5,
    initials: "JK",
  },
  {
    name: "Amanda L.",
    childAge: "Mom of 4-year-old",
    quote: "The shopping list with cost estimates was a game-changer! No more surprise expenses. I stayed on budget and the party looked amazing.",
    rating: 5,
    initials: "AL",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Loved by Busy Parents
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of parents who've reclaimed their time
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-6 md:p-8 space-y-4"
              data-testid={`card-testimonial-${index}`}
            >
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3 pt-4">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.childAge}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
