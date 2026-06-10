// Monta uma src utilizável em <img> a partir do campo `foto` do produto.
// O backend pode devolver:
//   - uma data URL completa: "data:image/png;base64,iVBOR..." (cadastros novos)
//   - apenas o base64 puro, sem prefixo (cadastros antigos)
// Para o base64 puro tentamos inferir o tipo pelos primeiros caracteres.
const inferirMime = (base64) => {
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBOR")) return "image/png";
  if (base64.startsWith("R0lGOD")) return "image/gif";
  if (base64.startsWith("UklGR")) return "image/webp";
  return "image/jpeg"; // padrão razoável
};

export const produtoFotoSrc = (foto) => {
  if (!foto || typeof foto !== "string") return null;
  if (foto.startsWith("data:")) return foto;
  return `data:${inferirMime(foto)};base64,${foto}`;
};

export default produtoFotoSrc;
