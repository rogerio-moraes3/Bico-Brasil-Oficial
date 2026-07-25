/**
 * Redimensiona uma imagem no navegador antes do upload, via canvas.
 * Evita subir fotos de câmera de celular (frequentemente 3000px+) em
 * tamanho original para exibição em avatares pequenos. Se qualquer coisa
 * falhar, retorna o arquivo original — nunca deve bloquear o upload.
 */
export async function resizeImageFile(
  file: File,
  maxDimension = 800,
  quality = 0.82
): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    if (width <= maxDimension && height <= maxDimension) {
      bitmap.close?.();
      return file;
    }

    const scale = maxDimension / Math.max(width, height);
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close?.();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );
    if (!blob) return file;

    const newName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch (err) {
    console.error('Erro ao redimensionar imagem, enviando original:', err);
    return file;
  }
}
