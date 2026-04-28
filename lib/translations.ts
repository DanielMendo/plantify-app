const PLANT_NAMES: Record<string, string> = {
  Apple: "Manzano",
  Corn: "Maíz",
  Pepper: "Pimiento",
  Potato: "Papa",
  Tomato: "Tomate",
};

const DISEASE_NAMES: Record<string, string> = {
  "Apple Scab": "Sarna del Manzano",
  "Black Rot": "Podredumbre Negra",
  "Cedar Apple Rust": "Roya del Cedro y Manzano",
  "Gray Leaf Spot": "Mancha Gris Foliar",
  "Common Rust": "Roya Común",
  "Northern Leaf Blight": "Tizón del Norte",
  "Bacterial Spot": "Mancha Bacteriana",
  "Early Blight": "Tizón Temprano",
  "Late Blight": "Tizón Tardío",
  "Leaf Mold": "Moho Foliar",
  "Septoria Leaf Spot": "Mancha Foliar por Septoria",
  "Spider Mites": "Ácaros Araña",
  "Target Spot": "Mancha en Diana",
  "Yellow Leaf Curl Virus": "Virus del Rizado Amarillo",
  "Tomato Mosaic Virus": "Virus del Mosaico del Tomate",
  // Healthy variants
  Healthy: "Saludable",
  Saludable: "Saludable",
};

/** Returns the Spanish name of the plant, falls back to the original. */
export function translatePlant(name: string): string {
  return PLANT_NAMES[name] ?? name;
}

/**
 * Returns the disease label for display.
 * If a Spanish translation exists → "Español (English)"
 * Otherwise → original name unchanged.
 */
export function translateDisease(name: string): {
  spanish: string;
  english: string;
  label: string;
} {
  const spanish = DISEASE_NAMES[name];

  if (!spanish || spanish === name) {
    return { spanish: name, english: name, label: name };
  }

  return {
    spanish,
    english: name,
    label: `${spanish} (${name})`,
  };
}
