import { Timestamp } from "@firebase/firestore";

export const ensureDate = (date: Date | Timestamp): Date => {
  if (date instanceof Date) {
    return date;
  }

  if (typeof date === "string") {
    return new Date(date);
  }

  if (date instanceof Timestamp) {
    return date.toDate();
  }

  return new Date();
};

export const formatDate = (date: Date | Timestamp): string => {
  const d = ensureDate(date);
  return d.toLocaleDateString();
}

// Shuffle an array
export const shuffleArray = (array: any[]): any[] => {
  const shuffled = array.slice(0);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
