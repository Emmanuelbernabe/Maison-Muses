/* ───────── Mise en forme simple des textes saisis dans le Studio ─────────
   **texte** → gras (ou « appuyé » dans les grands titres), *texte* → italique,
   retour à la ligne → saut de ligne sur le site.
   Chaque composant décide de la classe à appliquer à chaque morceau. */

export interface RichPart {
  text: string;
  bold?: boolean;
  italic?: boolean;
  br?: boolean;
}

export function rich(value?: string | null): RichPart[] {
  if (!value) return [];
  const parts: RichPart[] = [];
  value.split(/\r?\n/).forEach((line, i) => {
    if (i > 0) parts.push({ text: '', br: true });
    for (const piece of line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)) {
      if (!piece) continue;
      if (piece.startsWith('**') && piece.endsWith('**')) parts.push({ text: piece.slice(2, -2), bold: true });
      else if (piece.startsWith('*') && piece.endsWith('*') && piece.length > 2) parts.push({ text: piece.slice(1, -1), italic: true });
      else parts.push({ text: piece });
    }
  });
  return parts;
}

/* Lignes d'un texte multiligne (un retour à la ligne = une ligne) */
export const lines = (value?: string | null) => (value ? value.split(/\r?\n/) : []);
