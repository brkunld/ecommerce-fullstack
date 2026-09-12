export const slugify = (text: string): string => {
  const trMap: Record<string, string> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  };

  return (
    text
      // Türkçe karakterleri eşleştirip değiştir
      .replace(/[çÇğĞıİöÖşŞüÜ]/g, (match) => trMap[match] || match)
      .toLowerCase()
      .trim()
      // Harf, sayı ve boşluk dışındaki özel karakterleri kaldır
      .replace(/[^a-z0-9 -]/g, "")
      // Boşlukları ve alt çizgileri tireye çevir
      .replace(/[\s_]+/g, "-")
      // Birden fazla yan yana tireyi tek tireye indir
      .replace(/-+/g, "-")
      // Başta veya sonda kalan tireleri temizle
      .replace(/^-+|-+$/g, "")
  );
};
