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
  const height = 900;
  canvas.width = width;
  canvas.height = height;

  const primaryColor = "#6366f1";
  const primaryDark = "#4f46e5";
  const bgColor = "#ffffff";
  const textColor = "#1f2937";
  const mutedColor = "#6b7280";
  const successColor = "#10b981";

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  const headerHeight = 140;
  const gradient = ctx.createLinearGradient(0, 0, width, headerHeight);
  gradient.addColorStop(0, primaryColor);
  gradient.addColorStop(1, primaryDark);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, headerHeight);

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "14px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(data.businessName.toUpperCase(), 24, 40);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Arial, sans-serif";
  ctx.fillText(data.rewardName, 24, 70);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "12px Arial, sans-serif";
  ctx.fillText("SELLOS", width - 24, 30);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Arial, sans-serif";
  ctx.fillText(`${data.currentStamps}/${data.stampsRequired}`, width - 24, 60);

  if (data.businessLogo) {
    try {
      const logoImg = await loadImage(data.businessLogo);
      const logoSize = 60;
      const logoX = width - 24 - logoSize;
      const logoY = 75;
      ctx.save();
      ctx.beginPath();
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    } catch {
      console.warn("No se pudo cargar el logo del negocio");
    }
  }

  let yPos = headerHeight + 24;

  ctx.fillStyle = mutedColor;
  ctx.font = "12px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("CLIENTE", 24, yPos);
  yPos += 18;

  ctx.fillStyle = textColor;
  ctx.font = "bold 16px Arial, sans-serif";
  ctx.fillText(data.customerName || "Sin cliente", 24, yPos);
  yPos += 28;

  drawDivider(ctx, 24, yPos, width - 48);
  yPos += 24;

  ctx.fillStyle = mutedColor;
  ctx.font = "12px Arial, sans-serif";
  ctx.fillText("PARA CONSEGUIR UN SELLO:", 24, yPos);
  yPos += 18;

  ctx.fillStyle = textColor;
  ctx.font = "14px Arial, sans-serif";
  ctx.fillText(data.stampAction || "Configura tu programa", 24, yPos);
  yPos += 32;

  drawDivider(ctx, 24, yPos, width - 48);
  yPos += 24;

  const stampSize = 56;
  const stampGap = 16;
  const stampsPerRow = Math.min(data.stampsRequired, 6);
  const totalStampsWidth = stampsPerRow * stampSize + (stampsPerRow - 1) * stampGap;
  const stampsStartX = (width - totalStampsWidth) / 2;

  const rows = Math.ceil(data.stampsRequired / stampsPerRow);

  for (let row = 0; row < rows; row++) {
    const stampsInRow = row === rows - 1
      ? data.stampsRequired - row * stampsPerRow
      : stampsPerRow;
    const rowWidth = stampsInRow * stampSize + (stampsInRow - 1) * stampGap;
    const rowStartX = (width - rowWidth) / 2;

    for (let col = 0; col < stampsInRow; col++) {
      const stampIndex = row * stampsPerRow + col;
      const x = rowStartX + col * (stampSize + stampGap);
      const y = yPos;
      const isFilled = stampIndex < data.currentStamps;

      ctx.beginPath();
      ctx.arc(x + stampSize / 2, y + stampSize / 2, stampSize / 2, 0, Math.PI * 2);
      ctx.closePath();

      if (isFilled) {
        if (data.isCompleted) {
          ctx.fillStyle = successColor;
        } else {
          ctx.fillStyle = primaryColor;
        }
        ctx.fill();

        ctx.strokeStyle = "transparent";
        ctx.lineWidth = 0;
      } else {
        ctx.fillStyle = "#f3f4f6";
        ctx.fill();
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
      }
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (isFilled) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Arial, sans-serif";
        ctx.fillText("✓", x + stampSize / 2, y + stampSize / 2);
      } else {
        ctx.fillStyle = "#9ca3af";
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText(`${stampIndex + 1}`, x + stampSize / 2, y + stampSize / 2);
      }
    }
    yPos += stampSize + stampGap;
  }

  yPos += 8;
  drawDivider(ctx, 24, yPos, width - 48);
  yPos += 24;

  const rewardBoxHeight = 60;
  const rewardBoxY = yPos;

  if (data.isCompleted) {
    ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
  } else {
    ctx.fillStyle = "rgba(99, 102, 241, 0.1)";
    ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
  }
  ctx.lineWidth = 1;
  roundRect(ctx, 24, rewardBoxY, width - 48, rewardBoxHeight, 12);

  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  if (data.isCompleted) {
    ctx.fillStyle = successColor;
    ctx.font = "bold 14px Arial, sans-serif";
    ctx.fillText("🎉 ¡Felicitaciones! Ya puedes canjear tu premio:", 40, rewardBoxY + 14);
    ctx.fillStyle = "#065f46";
    ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText(data.rewardName, 40, rewardBoxY + 36);
  } else {
    ctx.fillStyle = primaryColor;
    ctx.font = "bold 14px Arial, sans-serif";
    const remaining = data.stampsRequired - data.currentStamps;
    ctx.fillText(`${remaining} más y consigues:`, 40, rewardBoxY + 14);
    ctx.fillStyle = textColor;
    ctx.font = "14px Arial, sans-serif";
    ctx.fillText(data.rewardDescription || data.rewardName, 40, rewardBoxY + 36);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, "image/png", 1.0);
  });
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

function drawDivider(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export function imageBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
