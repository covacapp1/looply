import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface QRGeneratorProps {
  url: string;
  title: string;
  description?: string;
}

export function QRGenerator({ url, title, description }: QRGeneratorProps) {
  const handleDownload = () => {
    const svg = document.querySelector(`#qr-${title.replace(/\s/g, "-")} svg`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${title.replace(/\s/g, "-").toLowerCase()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div
              id={`qr-${title.replace(/\s/g, "-")}`}
              className="rounded-xl bg-white p-4 shadow-sm mb-4"
            >
              <QRCodeSVG value={url} size={180} level="H" includeMargin />
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2 break-all">{url}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
