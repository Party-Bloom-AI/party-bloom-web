import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Favorite } from "@shared/schema";
import {
  Upload,
  Sparkles,
  ExternalLink,
  ChevronDown,
  LogOut,
  Plus,
  Loader2,
  ImageIcon,
  X,
  Palette,
  Wand2,
  Download,
  Heart,
  Trash2,
  ChevronRight,
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
  themeImage: string;
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
  const { toast } = useToast();
  const [promptText, setPromptText] = useState("");
  const [inspirationType, setInspirationType] = useState<"template" | "upload">("template");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [result, setResult] = useState<ThemeResult | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [expandedFavorite, setExpandedFavorite] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites"],
  });

  const generateMutation = useMutation({
    mutationFn: async (input: { prompt: string; inspirationType: string; inspirationContent: string }) => {
      const response = await apiRequest("POST", "/api/generate-theme", input);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const saveFavoriteMutation = useMutation({
    mutationFn: async (themeData: ThemeResult) => {
      const response = await apiRequest("POST", "/api/favorites", themeData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Saved to Favorites",
        description: "Your theme has been saved to your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save theme to favorites.",
        variant: "destructive",
      });
    },
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/favorites/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from Favorites",
        description: "Theme has been removed from your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove theme from favorites.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          console.log('Image compressed:', {
            originalSize: file.size,
            compressedLength: compressedDataUrl.length,
            dimensions: `${width}x${height}`
          });
          
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedImage = await compressImage(file, 1024, 0.7);
        setUploadedImage(compressedImage);
        setSelectedTemplate(null);
      } catch (error) {
        console.error('Error compressing image:', error);
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImage(event.target?.result as string);
          setSelectedTemplate(null);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setUploadedImage(null);
  };

  const handleGenerate = () => {
    let inspirationContent = "";
    
    if (inspirationType === "upload" && uploadedImage) {
      inspirationContent = uploadedImage;
    } else if (inspirationType === "template" && selectedTemplate) {
      const template = presetThemes.find(t => t.id === selectedTemplate);
      if (template) {
        inspirationContent = template.prompt;
      }
    }

    if (promptText.trim() || inspirationContent) {
      generateMutation.mutate({
        prompt: promptText,
        inspirationType: inspirationType,
        inspirationContent: inspirationContent,
      });
    }
  };

  const handleNewDecoration = () => {
    setResult(null);
    setPromptText("");
    setUploadedImage(null);
    setSelectedTemplate(null);
    setInspirationType("template");
  };

  const downloadImage = (imageData: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canGenerate = promptText.trim() || 
    (inspirationType === "upload" && uploadedImage) ||
    (inspirationType === "template" && selectedTemplate);

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
                variant={showFavorites ? "secondary" : "outline"}
                onClick={() => setShowFavorites(!showFavorites)}
                data-testid="button-toggle-favorites"
                className="gap-2"
              >
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Favorites</span>
                {favorites.length > 0 && (
                  <span className="ml-1 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                    {favorites.length}
                  </span>
                )}
              </Button>

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
        {showFavorites ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Saved Themes</h1>
                <p className="text-muted-foreground">
                  Your favorite party decoration themes
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFavorites(false)}
                data-testid="button-back-to-planner"
                className="gap-2"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Back to Planner
              </Button>
            </div>

            {favoritesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : favorites.length === 0 ? (
              <Card className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Saved Themes Yet</h3>
                <p className="text-muted-foreground max-w-sm mb-4">
                  Generate a party theme and click "Save" to add it to your favorites.
                </p>
                <Button onClick={() => setShowFavorites(false)} data-testid="button-start-planning">
                  Start Planning
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => (
                  <Card 
                    key={favorite.id} 
                    className="overflow-hidden"
                    data-testid={`card-favorite-${favorite.id}`}
                  >
                    {favorite.themeImage && (
                      <img
                        src={favorite.themeImage}
                        alt={favorite.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{favorite.title}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFavoriteMutation.mutate(favorite.id)}
                          disabled={deleteFavoriteMutation.isPending}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          data-testid={`button-delete-favorite-${favorite.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {favorite.colors && Array.isArray(favorite.colors) && (
                        <div className="flex gap-1">
                          {favorite.colors.map((color: string, i: number) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full border border-border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}

                      {favorite.totalCostRange && (
                        <p className="text-sm font-medium text-primary">{favorite.totalCostRange}</p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setExpandedFavorite(expandedFavorite === favorite.id ? null : favorite.id)}
                        data-testid={`button-expand-favorite-${favorite.id}`}
                      >
                        {expandedFavorite === favorite.id ? "Show Less" : "View Details"}
                      </Button>

                      {expandedFavorite === favorite.id && (
                        <div className="space-y-4 pt-3 border-t">
                          {favorite.description && (
                            <p className="text-sm text-muted-foreground">{favorite.description}</p>
                          )}

                          {favorite.moodboardImages && Array.isArray(favorite.moodboardImages) && favorite.moodboardImages.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Moodboard</p>
                              <div className="grid grid-cols-2 gap-2">
                                {favorite.moodboardImages.map((img: string, i: number) => (
                                  <img
                                    key={i}
                                    src={img}
                                    alt={`Moodboard ${i + 1}`}
                                    className="w-full h-16 object-cover rounded"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {favorite.decorItems && Array.isArray(favorite.decorItems) && favorite.decorItems.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Decoration Items</p>
                              <div className="space-y-2">
                                {favorite.decorItems.map((item: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between text-sm">
                                    <span>{item.name}</span>
                                    <span className="text-muted-foreground">{item.priceRange}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Plan Your Party Decorations</h1>
              <p className="text-muted-foreground">
                Describe your vision and choose visual inspiration to generate the perfect theme.
              </p>
            </div>

            <Card className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">Describe Your Party Vision</Label>
                </div>
                <Textarea
                  placeholder="Tell us about your dream party... e.g., 'A magical fairy garden party with lots of flowers and butterflies for my 5-year-old daughter who loves pink and purple'"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="min-h-[120px] resize-none"
                  data-testid="input-prompt-text"
                />
                <p className="text-sm text-muted-foreground">
                  Include details like age, favorite colors, interests, and any must-have elements.
                </p>
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">Visual Inspiration</Label>
                </div>

                <RadioGroup
                  value={inspirationType}
                  onValueChange={(value) => setInspirationType(value as "template" | "upload")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="template" id="template" data-testid="radio-template" />
                    <Label htmlFor="template" className="cursor-pointer">Choose a Template</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" data-testid="radio-upload" />
                    <Label htmlFor="upload" className="cursor-pointer">Upload Image</Label>
                  </div>
                </RadioGroup>

                {inspirationType === "template" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {presetThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleTemplateSelect(theme.id)}
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
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
                        <span className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium text-center truncate">
                          {theme.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {inspirationType === "upload" && (
                  <div>
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
                          className="w-full h-40 object-cover rounded-lg"
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
                        className="w-full h-40 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center gap-3 hover-elevate transition-colors"
                        data-testid="button-upload-area"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Upload inspiration image</p>
                          <p className="text-sm text-muted-foreground">
                            Room photo or party inspiration
                          </p>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
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
                  Describe your party vision and choose visual inspiration, then click "Generate" to see your personalized decoration plan with a custom theme image.
                </p>
              </Card>
            )}

            {generateMutation.isPending && (
              <Card className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Creating Your Perfect Theme</h3>
                <p className="text-muted-foreground">
                  Our AI is generating a custom theme image and curating decoration ideas...
                </p>
              </Card>
            )}

            {result && (
              <div className="space-y-6">
                <Card className="p-6" data-testid="card-theme-summary">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{result.title}</h3>
                      <p className="text-muted-foreground">{result.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => saveFavoriteMutation.mutate(result)}
                      disabled={saveFavoriteMutation.isPending}
                      className="gap-2 shrink-0"
                      data-testid="button-save-favorite"
                    >
                      {saveFavoriteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className="h-4 w-4" />
                      )}
                      Save
                    </Button>
                  </div>
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

                {result.themeImage && (
                  <Card className="p-6" data-testid="card-theme-image">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Wand2 className="h-4 w-4 text-primary" />
                        AI-Generated Theme Vision
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadImage(result.themeImage, `${result.title.replace(/\s+/g, '-').toLowerCase()}-theme.png`)}
                        data-testid="button-download-theme"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={result.themeImage}
                        alt={result.title}
                        className="w-full h-64 object-cover"
                        data-testid="img-theme-image"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  </Card>
                )}

                <Card className="p-6" data-testid="card-moodboard">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Moodboard</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        result.moodboardImages.forEach((url, i) => {
                          setTimeout(() => {
                            downloadImage(url, `${result.title.replace(/\s+/g, '-').toLowerCase()}-moodboard-${i + 1}.png`);
                          }, i * 300);
                        });
                      }}
                      data-testid="button-download-all-moodboard"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {result.moodboardImages.map((url, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={url}
                          alt={`Moodboard ${i + 1}`}
                          className="w-full h-24 md:h-32 object-cover rounded-lg"
                          data-testid={`img-moodboard-${i}`}
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => downloadImage(url, `${result.title.replace(/\s+/g, '-').toLowerCase()}-moodboard-${i + 1}.png`)}
                          data-testid={`button-download-moodboard-${i}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
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
      )}
      </main>
    </div>
  );
}
