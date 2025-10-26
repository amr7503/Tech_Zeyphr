import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accessibility, Volume2, Contrast, Languages, X } from "lucide-react";

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceNav, setVoiceNav] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLanguage] = useState("en");

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle("high-contrast");
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full glow shadow-lg"
        >
          <Accessibility className="w-6 h-6" />
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 right-6 z-50 w-80"
            >
              <Card className="glass-strong p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Accessibility className="w-5 h-5 text-primary" />
                    Accessibility
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Voice Navigation</span>
                    </div>
                    <Switch checked={voiceNav} onCheckedChange={setVoiceNav} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Contrast className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">High Contrast</span>
                    </div>
                    <Switch
                      checked={highContrast}
                      onCheckedChange={toggleHighContrast}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Language</span>
                    </div>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityPanel;
