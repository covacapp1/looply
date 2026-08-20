export interface StampCardImageData {
  businessName: string;
  businessLogo?: string;
  customerName: string;
  rewardName: string;
  rewardDescription: string;
  stampAction: string;
  stampsRequired: number;
  currentStamps: number;
  isCompleted: boolean;
}

export async function generateStampCardImage(data: StampCardImageData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const width = 600;
  const height = 800;
  canvas.width = width;
  canvas.height = height;

  const greenDark = "#047857";
  const greenMid = "#059669";
  const greenLight = "#10b981";
  const greenPale = "#d1fae5";
  const textColor = "#1f2937";
  const mutedColor = "#6b7280";
  const white = "#ffffff";

  ctx.fillStyle = white;
  ctx.fillRect(0, 0, width, height);

  const cardX = 40;
  const cardY = 40;
  const cardW = width - 80;
  const cardH = 340;
  const cardRadius = 24;

  ctx.save();
  ctx.shadowColor = "rgba(5, 150, 105, 0.25)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  drawRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = white;
  ctx.fill();
  ctx.restore();

  const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  cardGradient.addColorStop(0, greenDark);
  cardGradient.addColorStop(0.5, greenMid);
  cardGradient.addColorStop(1, greenLight);

  ctx.save();
  ctx.beginPath();
  drawRoundRectPath(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.clip();

  ctx.fillStyle = cardGradient;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.ellipse(cardX + cardW - 80, cardY + 60, 180, 140, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.beginPath();
  ctx.ellipse(cardX + 100, cardY + cardH - 40, 150, 100, 0, 0, Math.PI * 2);
  ctx.fill();

  const chipX = cardX + 30;
  const chipY = cardY + 30;
  const chipW = 50;
  const chipH = 40;

  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  chipGrad.addColorStop(0, "#fbbf24");
  chipGrad.addColorStop(1, "#f59e0b");
  ctx.fillStyle = chipGrad;
  roundRectFill(ctx, chipX, chipY, chipW, chipH, 8);

  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chipX + chipW / 2, chipY + 4);
  ctx.lineTo(chipX + chipW / 2, chipY + chipH - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(chipX + 6, chipY + chipH / 2);
  ctx.lineTo(chipX + chipW - 6, chipY + chipH / 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "bold 20px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(data.businessName.toUpperCase(), cardX + 30, cardY + 100);

  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "13px Arial, sans-serif";
  ctx.fillText(data.rewardName, cardX + 30, cardY + 125);

  const stampCountY = cardY + 175;
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "12px Arial, sans-serif";
  ctx.fillText("SELLOS", cardX + 30, stampCountY);

  ctx.fillStyle = white;
  ctx.font = "bold 42px Arial, sans-serif";
  ctx.fillText(`${data.currentStamps}/${data.stampsRequired}`, cardX + 30, stampCountY + 42);

  const starY = cardY + cardH - 55;
  for (let i = 0; i < data.stampsRequired; i++) {
    const starX = cardX + 30 + i * 32;
    const isFilled = i < data.currentStamps;
    drawStar(ctx, starX + 12, starY, 12, isFilled ? white : "rgba(255,255,255,0.3)");
  }

  const infoY = cardY + cardH + 40;

  ctx.fillStyle = textColor;
  ctx.font = "bold 18px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(data.customerName || "Sin cliente", cardX, infoY);

  ctx.fillStyle = mutedColor;
  ctx.font = "13px Arial, sans-serif";
  ctx.fillText("Cliente", cardX, infoY - 8);

  drawDivider(ctx, cardX, infoY + 24, cardW);
  const actionY = infoY + 52;

  ctx.fillStyle = mutedColor;
  ctx.font = "13px Arial, sans-serif";
  ctx.fillText("Para conseguir un sello", cardX, actionY - 8);

  ctx.fillStyle = greenMid;
  ctx.font = "bold 15px Arial, sans-serif";
  ctx.fillText(data.stampAction || "Configura tu programa", cardX, actionY + 14);

  drawDivider(ctx, cardX, actionY + 36, cardW);
  const stampsY = actionY + 64;

  const stampSize = 52;
  const stampGap = 14;
  const stampsPerRow = Math.min(data.stampsRequired, 7);
  const totalW = stampsPerRow * stampSize + (stampsPerRow - 1) * stampGap;
  const startX = (width - totalW) / 2;

  const rows = Math.ceil(data.stampsRequired / stampsPerRow);
  for (let row = 0; row < rows; row++) {
    const inRow = row === rows - 1 ? data.stampsRequired - row * stampsPerRow : stampsPerRow;
    const rowW = inRow * stampSize + (inRow - 1) * stampGap;
    const rowX = (width - rowW) / 2;

    for (let col = 0; col < inRow; col++) {
      const idx = row * stampsPerRow + col;
      const x = rowX + col * (stampSize + stampGap);
      const y = stampsY + row * (stampSize + stampGap);
      const filled = idx < data.currentStamps;

      ctx.beginPath();
      ctx.arc(x + stampSize / 2, y + stampSize / 2, stampSize / 2, 0, Math.PI * 2);
      ctx.closePath();

      if (filled) {
        const stampGrad = ctx.createRadialGradient(
          x + stampSize / 2, y + stampSize / 2, 0,
          x + stampSize / 2, y + stampSize / 2, stampSize / 2
        );
        stampGrad.addColorStop(0, greenLight);
        stampGrad.addColorStop(1, greenMid);
        ctx.fillStyle = stampGrad;
        ctx.fill();
        ctx.shadowColor = "rgba(16, 185, 129, 0.4)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = white;
        ctx.font = "bold 22px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✓", x + stampSize / 2, y + stampSize / 2);
      } else {
        ctx.fillStyle = "#f0fdf4";
        ctx.fill();
        ctx.strokeStyle = greenLight;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = greenMid;
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${idx + 1}`, x + stampSize / 2, y + stampSize / 2);
      }
    }
  }

  const msgY = stampsY + rows * (stampSize + stampGap) + 30;

  const boxH = 70;
  ctx.save();
  ctx.shadowColor = "rgba(16, 185, 129, 0.15)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  if (data.isCompleted) {
    const boxGrad = ctx.createLinearGradient(cardX, msgY, cardX + cardW, msgY);
    boxGrad.addColorStop(0, greenLight);
    boxGrad.addColorStop(1, greenMid);
    ctx.fillStyle = boxGrad;
  } else {
    ctx.fillStyle = greenPale;
  }
  roundRectFill(ctx, cardX, msgY, cardW, boxH, 16);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (data.isCompleted) {
    ctx.fillStyle = white;
    ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText("🎉 ¡Felicitaciones! Canjeá tu premio:", width / 2, msgY + 22);
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText(data.rewardName, width / 2, msgY + 48);
  } else {
    const remaining = data.stampsRequired - data.currentStamps;
    ctx.fillStyle = greenDark;
    ctx.font = "bold 15px Arial, sans-serif";
    ctx.fillText(`Faltan ${remaining} más`, width / 2, msgY + 22);
    ctx.fillStyle = greenMid;
    ctx.font = "14px Arial, sans-serif";
    ctx.fillText(data.rewardDescription || data.rewardName, width / 2, msgY + 48);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, "image/png", 1.0);
  });
}

function drawRoundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  drawRoundRectPath(ctx, x, y, w, h, r);
}

function roundRectFill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  drawRoundRectPath(ctx, x, y, w, h, r);
  ctx.fill();
}

function drawDivider(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function imageBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
