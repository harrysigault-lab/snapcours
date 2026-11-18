import type { PhotoPage } from '../types/quiz';

/**
 * Compresses and resizes an uploaded image file to keep Gemini requests fast on mobile networks.
 */
export async function compressImageFile(file: File): Promise<PhotoPage> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Impossible de lire ce fichier image.'));
    reader.readAsDataURL(file);
  });

  return compressDataUrl(dataUrl, file.name || 'Page de cours');
}

export async function compressDataUrl(dataUrl: string, name: string): Promise<PhotoPage> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Format d’image non pris en charge.'));
    image.src = dataUrl;
  });

  const maxDimension = 1440;
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      dataUrl,
      mimeType: 'image/jpeg',
    };
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const compressed = canvas.toDataURL('image/jpeg', 0.85);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    dataUrl: compressed,
    mimeType: 'image/jpeg',
  };
}

/**
 * Loads a static asset URL and returns a compressed PhotoPage.
 */
export async function loadSampleImageUrl(url: string, name: string): Promise<PhotoPage> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Impossible de charger la photo d’exemple.');
  }
  const blob = await res.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Lecture impossible.'));
    reader.readAsDataURL(blob);
  });
  return compressDataUrl(dataUrl, name);
}

/**
 * Generates a crisp French Mathematics exercise sheet image on an offscreen canvas.
 * Useful for instant demo/testing of "Exercices similaires" and step-by-step math corrections.
 */
export function createSampleMathsPage(): PhotoPage {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Notebook paper background
    ctx.fillStyle = '#FFFDF7';
    ctx.fillRect(0, 0, 900, 1200);

    // Subtle ruled lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    for (let y = 110; y < 1150; y += 44) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(900, y);
      ctx.stroke();
    }

    // Margin red line
    ctx.strokeStyle = '#FCA5A5';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(105, 0);
    ctx.lineTo(105, 1200);
    ctx.stroke();

    // Title
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('MATHÉMATIQUES — FICHE DE RÉVISION (3e)', 130, 82);

    ctx.fillStyle = '#4F46E5';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('1. Équations du premier degré', 130, 168);

    ctx.fillStyle = '#1E293B';
    ctx.font = '23px sans-serif';
    ctx.fillText('Méthode : on isole l’inconnue x en gardant l’égalité.', 130, 214);
    ctx.fillText('Exemple résolu :  3x + 5 = 20', 130, 260);
    ctx.fillText('  Étape 1 : 3x = 20 - 5  →  3x = 15', 130, 304);
    ctx.fillText('  Étape 2 : x = 15 / 3   →  x = 5', 130, 348);

    ctx.fillStyle = '#4F46E5';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('2. Théorème de Pythagore', 130, 442);

    ctx.fillStyle = '#1E293B';
    ctx.font = '23px sans-serif';
    ctx.fillText('Dans un triangle ABC rectangle en A :', 130, 488);
    ctx.fillText('Le carré de l’hypoténuse est égal à la somme des', 130, 532);
    ctx.fillText('carrés des deux autres côtés :  BC² = AB² + AC²', 130, 576);
    ctx.fillText('Application : Si AB = 6 cm et AC = 8 cm :', 130, 624);
    ctx.fillText('  BC² = 6² + 8² = 36 + 64 = 100', 130, 668);
    ctx.fillText('  BC = √100 = 10 cm', 130, 712);

    ctx.fillStyle = '#0F766E';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('3. Exercices d’entraînement', 130, 810);

    ctx.fillStyle = '#1E293B';
    ctx.font = '23px sans-serif';
    ctx.fillText('Exercice A : Résoudre  4x - 7 = 17', 130, 860);
    ctx.fillText('Exercice B : Résoudre  5x + 2 = 3x + 14', 130, 910);
    ctx.fillText('Exercice C : Triangle EFG rectangle en E avec', 130, 965);
    ctx.fillText('  EF = 5 cm et EG = 12 cm. Calculer l’hypoténuse FG.', 130, 1010);
    ctx.fillText('Exercice D : Développer et réduire 3(2x - 4) + 5.', 130, 1068);
  }

  return {
    id: `sample-maths-${Date.now()}`,
    name: 'Maths · Équations & Pythagore',
    dataUrl: canvas.toDataURL('image/jpeg', 0.9),
    mimeType: 'image/jpeg',
  };
}
