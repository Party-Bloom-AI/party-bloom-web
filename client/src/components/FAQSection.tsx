import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

//todo: remove mock functionality - replace with real FAQs from API
const faqs = [
  {
    question: "How long does it really take to plan a party?",
    answer: "Most parents complete their entire party plan in under 10 minutes. Just share your idea or choose a template, and Party Bloom generates everything — theme summary, moodboard, and shopping list — instantly.",
  },
  {
    question: "Can I customize the themes and suggestions?",
    answer: "Absolutely! While Party Bloom provides curated suggestions, you can always adjust the theme, swap out moodboard images, or modify the shopping list to match your preferences and budget.",
  },
  {
    question: "Do you have real-time pricing from retailers?",
    answer: "Party Bloom provides cost estimate ranges based on typical market prices. We include direct links to retailers so you can check current prices and shop with confidence.",
  },
  {
    question: "What age groups do your themes support?",
    answer: "Our themes work for children ages 1-12, with options ranging from toddler-friendly designs to more sophisticated themes for tweens. You can also create custom themes for any age.",
  },
  {
    question: "Is there a limit to how many parties I can plan?",
    answer: "During our free trial, you can create your first party plan with full access to all features. Premium subscriptions (coming soon) will offer unlimited party planning.",
  },
  {
    question: "Can I save and access my party plans later?",
    answer: "Yes! All your party plans are saved to your account, so you can revisit, edit, or reuse them anytime. Perfect for annual birthday parties or similar celebrations.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-16 md:py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Everything you need to know about Party Bloom
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-lg px-6"
              data-testid={`faq-${index}`}
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
