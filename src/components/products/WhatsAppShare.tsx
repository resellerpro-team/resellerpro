import { Button } from "@/components/ui/button";
import { Download, Copy, Check, MessageCircle, Share2, Smartphone, Send, Layout, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  id: string;
  name: string;
  description?: string;
  image_url: string | null;
  images?: string[];
  cost_price: number;
  selling_price: number;
  stock_quantity?: number;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  category?: string;
  sku?: string;
};

interface WhatsAppShareProps {
  product: Product;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  iconOnly?: boolean;
}

const WhatsAppIcon = ({ className, fill = "#25D366" }: { className?: string; fill?: string }) => (
  <svg className={className} fill={fill} viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export function WhatsAppShare({
  product,
  variant = "outline",
  size = "sm",
  iconOnly = false,
}: WhatsAppShareProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState<
    Array<{ id: string; name: string; phone: string }>
  >([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  useEffect(() => {
    // Detect mobile device
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, phone")
        .not("phone", "is", null)
        .order("name")
        .limit(100);

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setPhoneNumber(customer.phone);
    }
  };

  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];

  const formatProductMessage = () => {
    const stockStatus =
      product.stock_status === "in_stock"
        ? "✅ In Stock"
        : product.stock_status === "low_stock"
          ? "⚠️ Low Stock"
          : "❌ Out of Stock";

    let message = `*${product.name}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━\n\n`;

    if (product.description) {
      message += `${product.description}\n\n`;
    }

    message += `💰 *Price:* ₹${product.selling_price.toLocaleString()}\n`;
    message += `📦 *Availability:* ${stockStatus}\n`;

    if (product.category) {
      message += `🏷️ *Category:* ${product.category}\n`;
    }

    const publicUrl = `${window.location.origin}/p/${product.id}`;
    message += `\n🔗 *View Details:* ${publicUrl}\n`;

    message += `\n━━━━━━━━━━━━━━━━━━━\n`;
    message += `*Interested? Reply to order!* 📱`;

    return message;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formatProductMessage());
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  const downloadProductCard = async () => {
    setDownloading(true);
    try {
      const imageUrl = allImages[selectedImageIndex];
      if (!imageUrl) return;

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const link = document.createElement("a");
      const imageName = `${product.name.replace(/[^a-z0-9]/gi, "_")}_${selectedImageIndex + 1}.png`;

      link.download = imageName;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);

      toast({
        title: "Success",
        description: "Image saved successfully",
      });
    } catch (error) {
      toast({
        title: "Failed",
        description: "Could not download image",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const shareProductImage = async () => {
    if (!navigator.share) {
      toast({
        title: "Not Supported",
        description: "Sharing is not supported on this browser. Please use download instead.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      const imageUrl = allImages[selectedImageIndex];
      if (!imageUrl) return;

      // Fetch image as blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Create file for sharing
      const fileName = `${product.name.replace(/[^a-z0-9]/gi, "_")}_${selectedImageIndex + 1}.jpg`;
      const file = new File([blob], fileName, { type: blob.type });

      // Check if files can be shared
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: product.name,
          text: `Check out ${product.name} - ₹${product.selling_price}`,
        });

        toast({
          title: "Success",
          description: "Product image shared successfully",
        });
      } else {
        // Fallback to download
        const link = document.createElement("a");
        link.download = fileName;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);

        toast({
          title: "Info",
          description: "Sharing not available. Image downloaded instead.",
        });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast({
          title: "Cancelled",
          description: "Share cancelled",
        });
      } else {
        toast({
          title: "Failed",
          description: "Could not share image",
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  const shareToWhatsApp = () => {
    if (!phoneNumber) {
      toast({ title: "Phone Required", variant: "destructive" });
      return;
    }
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "").replace("+", "");
    const encodedMessage = encodeURIComponent(formatProductMessage());
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, "_blank");
    setPhoneNumber("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {iconOnly ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full transition-all hover:bg-green-50 active:scale-95"
          >
            <WhatsAppIcon className="h-6 w-6" />
          </Button>
        ) : (
          <Button
            variant={variant}
            size={size}
            className={`w-full font-medium transition-all active:scale-[0.98] ${variant === "default"
              ? "bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md hover:shadow-lg"
              : "border-green-200 hover:bg-green-50 text-green-700"
              }`}
          >
            <WhatsAppIcon className={`h-4 w-4 mr-2 ${variant === "default" ? "fill-white" : "fill-[#25D366]"}`} />
            Share Product
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none bg-slate-50">
        <div className="bg-[#075E54] p-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <WhatsAppIcon className="h-7 w-7 fill-white" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl font-bold tracking-tight text-white">WhatsApp Share</DialogTitle>
                <DialogDescription className="text-green-100/80">Connect with your customers instantly</DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-4 py-6 sm:px-8 max-h-[75vh] overflow-y-auto">
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 mb-8 rounded-xl h-auto">
              <TabsTrigger
                value="image"
                className="rounded-lg py-3 text-sm font-semibold transition-all data-[state=active]:bg-[#128C7E] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-500 hover:text-slate-900"
              >
                <Layout className="w-4 h-4 mr-2" />
                Product Card
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="rounded-lg py-3 text-sm font-semibold transition-all data-[state=active]:bg-[#128C7E] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-500 hover:text-slate-900"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Direct Share
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="image" className="space-y-6 mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {allImages.length > 1 && (
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pick Cover Image</Label>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {allImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative min-w-[80px] h-[80px] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${selectedImageIndex === idx ? "border-[#25D366] ring-4 ring-green-100 scale-95" : "border-white hover:border-slate-200"
                              }`}
                          >
                            <Image src={img} alt="" fill className="object-cover" crossOrigin="anonymous" />
                            {selectedImageIndex === idx && (
                              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white bg-green-500 rounded-full p-0.5 shadow-sm" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-[28px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div ref={cardRef} className="relative bg-white rounded-[24px] shadow-2xl overflow-hidden max-w-sm mx-auto border border-white">
                      <div className="relative aspect-square">
                        <Image
                          src={allImages[selectedImageIndex] || ""}
                          alt={product.name}
                          fill
                          className="object-cover"
                          crossOrigin="anonymous"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                          <h3 className="text-2xl font-bold leading-tight mb-1">{product.name}</h3>
                          <p className="text-sm text-white/80 line-clamp-1">{product.category}</p>
                        </div>
                      </div>

                      <div className="p-8 space-y-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Selling Price</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">₹{product.selling_price.toLocaleString()}</p>
                          </div>
                          <Badge className={`px-4 py-1.5 rounded-full font-bold shadow-sm ${product.stock_status === "in_stock" ? "bg-green-50 text-green-700" :
                            product.stock_status === "low_stock" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                            }`}>
                            {product.stock_status === "in_stock" ? "In Stock" :
                              product.stock_status === "low_stock" ? "Low Stock" : "Out of Stock"}
                          </Badge>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                              <WhatsAppIcon className="w-4 h-4 fill-green-600" />
                            </div>
                            <span className="text-sm font-bold text-green-700">Order via WhatsApp</span>
                          </div>
                          <div className="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center">
                            <span className="text-[10px] font-black text-slate-200">RP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Share and Download Buttons */}
                  <div className="space-y-3">
                    {isMobile && (
                      <Button
                        onClick={shareProductImage}
                        disabled={isSharing || downloading}
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white h-14 rounded-2xl font-bold text-base shadow-lg shadow-green-900/10 transition-all hover:translate-y-[-2px] active:translate-y-[1px]"
                      >
                        {isSharing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Preparing to Share...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Share2 className="w-5 h-5" />
                            Share Product Image
                          </div>
                        )}
                      </Button>
                    )}

                    <Button
                      onClick={downloadProductCard}
                      disabled={downloading || isSharing}
                      className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white h-14 rounded-2xl font-bold text-base shadow-lg shadow-green-900/10 transition-all hover:translate-y-[-2px] active:translate-y-[1px]"
                    >
                      {downloading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Generating Card...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Download className="w-5 h-5" />
                          Download High-Res Card
                        </div>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="text" className="space-y-6 mt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/60 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-slate-400" />
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Recipient Details</Label>
                      </div>

                      <SearchableSelect
                        options={customers.map((c): SearchableSelectOption => ({
                          value: c.id,
                          label: c.name,
                          subtitle: c.phone,
                        }))}
                        value={selectedCustomer}
                        onValueChange={handleCustomerSelect}
                        placeholder={loadingCustomers ? "Syncing customers..." : "Select existing customer"}
                        className="h-12 border-slate-200 rounded-xl bg-slate-50/50"
                      />

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center px-2">
                          <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-3 text-slate-300 font-bold tracking-widest">Or Entry</span>
                        </div>
                      </div>

                      <Input
                        placeholder="+91 Phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d+]/g, ""))}
                        className="h-12 border-slate-200 rounded-xl bg-slate-50/50 text-base"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-slate-400" />
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Message Preview</Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyToClipboard}
                          className="h-8 rounded-lg text-slate-500 hover:text-green-600 hover:bg-green-50"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>

                      {/* WhatsApp Chat Bubble Style */}
                      <div className="bg-[#e5ddd5] p-3 rounded-2xl relative min-h-[150px] shadow-inner">
                        <div className="absolute top-0 right-3 w-0 h-0 border-t-[10px] border-t-[#dcf8c6] border-r-[10px] border-r-transparent -translate-y-2"></div>
                        <div className="bg-[#dcf8c6] p-4 rounded-xl rounded-tr-none shadow-sm ml-auto max-w-[90%] relative">
                          <div className="text-[13px] whitespace-pre-wrap font-sans text-[#4a4a4a] leading-relaxed">
                            {formatProductMessage()}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-1 opacity-40">
                            <span className="text-[10px]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <Check className="w-3 h-3 scale-75" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={shareToWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white h-14 rounded-2xl font-bold text-base shadow-lg shadow-green-900/10 transition-all hover:translate-y-[-2px]"
                  >
                    <Send className="w-5 h-5 mr-3" />
                    Open in WhatsApp
                  </Button>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>

        <div className="px-8 py-4 bg-slate-100/50 border-t border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <Info className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-snug">
            Sending details through WhatsApp helps you close deals faster. Your contact information is never shared without your permission.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
