import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Upload,
  Type,
  Palette,
  Sparkles,
  ExternalLink,
  ChevronDown,
  LogOut,
  Plus,
  Loader2,
  ImageIcon,
  X,
} from "lucide-react";
import logoImage from "@assets/logo_1764136309223.png";
import princessTheme from "@assets/princess_1764138848730.png";
import dinoTheme from "@assets/dino_1764138848726.png";
import mermaidTheme from "@assets/marmaid_1764138848728.png";
import spaceTheme from "@assets/space_1764138848730.png";

interface DecorItem {
  name: string;
  priceRange: string;
  retailer: string;
  link: string;
}

interface ThemeResult {
  title: string;
  description: string;
  colors: string[];
  moodboardImages: string[];
  decorItems: DecorItem[];
  totalCostRange: string;
}

const presetThemes = [
  { id: "princess", name: "Princess Castle", image: princessTheme, prompt: "Magical princess castle theme with pink and gold decorations, tiaras, and fairy tale elements" },
  { id: "dino", name: "Dinosaur Adventure", image: dinoTheme, prompt: "Exciting dinosaur adventure theme with prehistoric creatures, jungle elements, and earthy colors" },
  { id: "mermaid", name: "Under the Sea", image: mermaidTheme, prompt: "Enchanting mermaid under the sea theme with ocean colors, seashells, and underwater creatures" },
  { id: "space", name: "Space Explorer", image: spaceTheme, prompt: "Cosmic space explorer theme with rockets, planets, stars, and galaxy decorations" },
  { id: "safari", name: "Safari Adventure", image: dinoTheme, prompt: "Wild safari adventure theme with jungle animals, tropical leaves, and earthy tones" },
  { id: "unicorn", name: "Magical Unicorn", image: princessTheme, prompt: "Magical unicorn theme with rainbow colors, sparkles, and enchanted forest elements" },
  { id: "superhero", name: "Superhero Party", image: spaceTheme, prompt: "Action-packed superhero theme with bold colors, comic book elements, and heroic decorations" },
  { id: "garden", name: "Garden Party", image: mermaidTheme, prompt: "Beautiful garden party theme with flowers, butterflies, and pastel spring colors" },
];

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");
  const [ideaText, setIdeaText] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [result, setResult] = useState<ThemeResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateMutation = useMutation({
    mutationFn: async (input: { type: string; content: string }) => {
      const response = await apiRequest("POST", "/api/generate-theme", input);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    let input = { type: "", content: "" };
    
    if (activeTab === "upload" && uploadedImage) {
      input = { type: "image", content: uploadedImage };
    } else if (activeTab === "idea" && ideaText.trim()) {
      input = { type: "text", content: ideaText };
    } else if (activeTab === "templates" && selectedTemplate) {
      const template = presetThemes.find(t => t.id === selectedTemplate);
      if (template) {
        input = { type: "template", content: template.prompt };
      }
    }

    if (input.content) {
      generateMutation.mutate(input);
    }
  };

  const handleNewDecoration = () => {
    setResult(null);
    setIdeaText("");
    setUploadedImage(null);
    setSelectedTemplate(null);
    setActiveTab("upload");
  };

  const canGenerate = 
    (activeTab === "upload" && uploadedImage) ||
    (activeTab === "idea" && ideaText.trim()) ||
    (activeTab === "templates" && selectedTemplate);

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img 
                src={logoImage} 
                alt="Party Bloom" 
                className="h-8 cursor-pointer" 
                onClick={() => navigate("/")}
                data-testid="logo-home"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleNewDecoration}
                data-testid="button-new-decoration"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Decoration</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium" data-testid="text-user-name">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.email}
                    </p>
                    {user?.email && user?.firstName && (
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Plan Your Party Decorations</h1>
              <p className="text-muted-foreground">
                Upload a photo, describe your idea, or choose from our templates to get started.
              </p>
            </div>

            <Card className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="upload" className="gap-2" data-testid="tab-upload">
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </TabsTrigger>
                  <TabsTrigger value="idea" className="gap-2" data-testid="tab-idea">
                    <Type className="h-4 w-4" />
                    <span className="hidden sm:inline">Type Idea</span>
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="gap-2" data-testid="tab-templates">
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Templates</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    data-testid="input-file-upload"
                  />
                  
                  {uploadedImage ? (
                    <div className="relative">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={() => setUploadedImage(null)}
                        data-testid="button-remove-image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center gap-3 hover-elevate transition-colors"
                      data-testid="button-upload-area"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Upload a room photo</p>
                        <p className="text-sm text-muted-foreground">
                          or drag and drop an inspiration image
                        </p>
                      </div>
                    </button>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Upload a photo of your party space or an inspiration image to generate themed decoration ideas.
                  </p>
                </TabsContent>

                <TabsContent value="idea" className="space-y-4">
                  <Textarea
                    placeholder="Describe your party theme idea... e.g., 'A magical fairy garden party with lots of flowers and butterflies for a 5-year-old girl'"
                    value={ideaText}
                    onChange={(e) => setIdeaText(e.target.value)}
                    className="min-h-[180px] resize-none"
                    data-testid="input-idea-text"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific about colors, themes, and the age of the birthday child for best results.
                  </p>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {presetThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTemplate(theme.id)}
                        className={`relative overflow-visible rounded-lg transition-all hover-elevate ${
                          selectedTemplate === theme.id
                            ? "ring-2 ring-primary ring-offset-2"
                            : ""
                        }`}
                        data-testid={`template-${theme.id}`}
                      >
                        <img
                          src={theme.image}
                          alt={theme.name}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
                        <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-medium text-left">
                          {theme.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose a preset theme to get instant decoration ideas and shopping lists.
                  </p>
                </TabsContent>
              </Tabs>
            </Card>

            <Button
              size="lg"
              className="w-full text-lg py-6 h-auto gap-2"
              onClick={handleGenerate}
              disabled={!canGenerate || generateMutation.isPending}
              data-testid="button-generate"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Your Plan...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Decoration Plan
                </>
              )}
            </Button>
          </div>

          <div className="space-y-6">
            {!result && !generateMutation.isPending && (
              <Card className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Your Decoration Plan</h3>
                <p className="text-muted-foreground max-w-sm">
                  Upload an image, type your idea, or select a template, then click "Generate" to see your personalized decoration plan.
                </p>
              </Card>
            )}

            {generateMutation.isPending && (
              <Card className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Creating Your Perfect Theme</h3>
                <p className="text-muted-foreground">
                  Our AI is curating moodboard images and decoration ideas...
                </p>
              </Card>
            )}

            {result && (
              <div className="space-y-6">
                <Card className="p-6" data-testid="card-theme-summary">
                  <h3 className="text-xl font-bold mb-2">{result.title}</h3>
                  <p className="text-muted-foreground mb-4">{result.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Theme colors:</span>
                    <div className="flex gap-1">
                      {result.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full border border-border"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="p-6" data-testid="card-moodboard">
                  <h3 className="font-semibold mb-4">Moodboard</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {result.moodboardImages.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Moodboard ${i + 1}`}
                        className="w-full h-24 md:h-32 object-cover rounded-lg"
                        data-testid={`img-moodboard-${i}`}
                      />
                    ))}
                  </div>
                </Card>

                <Card className="p-6" data-testid="card-decor-items">
                  <h3 className="font-semibold mb-4">Decoration Items</h3>
                  <div className="space-y-3">
                    {result.decorItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                        data-testid={`decor-item-${i}`}
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.retailer}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-primary">{item.priceRange}</span>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            data-testid={`link-item-${i}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-primary/5 border-primary/20" data-testid="card-total-cost">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Estimated Total Cost</h3>
                      <p className="text-sm text-muted-foreground">Based on current retail prices</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">{result.totalCostRange}</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
