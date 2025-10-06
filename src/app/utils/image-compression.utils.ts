/**
 * Utilidades para compresión de imágenes
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Comprime una imagen usando Canvas API
 * @param file - Archivo de imagen a comprimir
 * @param options - Opciones de compresión
 * @returns Promise con el archivo comprimido y estadísticas
 */
export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    outputFormat = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('No se pudo obtener el contexto del canvas'));
      return;
    }

    img.onload = () => {
      try {
        // Calcular nuevas dimensiones manteniendo la proporción
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Configurar canvas
        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen'));
              return;
            }

            // Crear archivo comprimido
            const compressedFile = new File([blob], file.name, {
              type: outputFormat,
              lastModified: Date.now()
            });

            const originalSize = file.size;
            const compressedSize = blob.size;
            const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

            resolve({
              compressedFile,
              originalSize,
              compressedSize,
              compressionRatio
            });
          },
          outputFormat,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'));
    };

    // Cargar imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Valida si un archivo es una imagen válida
 * @param file - Archivo a validar
 * @returns true si es una imagen válida
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
}

/**
 * Obtiene el tamaño de archivo en formato legible
 * @param bytes - Tamaño en bytes
 * @returns Tamaño formateado (ej: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Comprime una imagen con configuración optimizada para web
 * @param file - Archivo de imagen
 * @returns Promise con el archivo comprimido
 */
export async function compressImageForWeb(file: File): Promise<CompressionResult> {
  return compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    outputFormat: 'image/jpeg'
  });
}

/**
 * Comprime una imagen con configuración optimizada para thumbnails
 * @param file - Archivo de imagen
 * @returns Promise con el archivo comprimido
 */
export async function compressImageForThumbnail(file: File): Promise<CompressionResult> {
  return compressImage(file, {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.7,
    outputFormat: 'image/jpeg'
  });
}
