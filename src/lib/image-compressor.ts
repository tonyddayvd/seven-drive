/**
 * Utilitário para compactação de imagens client-side via Canvas.
 * Reduz fotos de alta resolução tiradas por smartphones (3MB - 15MB) para ~100KB - 200KB,
 * preservando nitidez para leitura de odômetro, placas e detalhes de vistorias,
 * eliminando erros de QuotaExceededError no navegador e limites de payload no Supabase.
 */
export async function compressImage(
  fileOrBase64: File | string,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Se for arquivo PDF, não é imagem, retorna como DataURL diretamente
    if (typeof fileOrBase64 !== "string" && fileOrBase64.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrBase64);
      return;
    }

    const img = new Image();

    img.onload = () => {
      try {
        let { width, height } = img;

        // Mantém a proporção original redimensionando para o limite máximo
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback caso canvas 2D falhe
          if (typeof fileOrBase64 === "string") {
            resolve(fileOrBase64);
          } else {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(fileOrBase64);
          }
          return;
        }

        // Fundo branco para imagens com transparência
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Exporta como JPEG otimizado
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      } catch (err) {
        console.warn("Falha na compressão de imagem via canvas, usando fallback:", err);
        if (typeof fileOrBase64 === "string") {
          resolve(fileOrBase64);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(fileOrBase64);
        }
      }
    };

    img.onerror = () => {
      // Se não conseguir carregar como imagem, fallback lê como DataURL
      if (typeof fileOrBase64 === "string") {
        resolve(fileOrBase64);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(fileOrBase64);
      }
    };

    if (typeof fileOrBase64 === "string") {
      img.src = fileOrBase64;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(fileOrBase64);
    }
  });
}
