//Leonardo Stuani Godoi
// A API devolve datas/horas SEM informação de fuso (ex.: "2026-06-11T00:43:00"),
// mas o valor é UTC (o servidor roda em UTC). O JavaScript, ao ler uma string ISO
// sem fuso, interpreta como hora LOCAL — o que deixava os horários ~3h adiantados
// (e até "no dia seguinte"). Aqui marcamos a string como UTC (sufixo "Z") antes de
// criar o Date, garantindo a conversão correta para o fuso do navegador.

// Detecta se a string já traz fuso: "Z" final ou offset "+hh:mm"/"-hh:mm".
const TEM_FUSO = /([zZ]|[+-]\d{2}:?\d{2})$/;

// Converte um valor vindo da API em um Date no fuso local correto.
export const parseApiDate = (value) => {
  if (value == null) return null;
  if (value instanceof Date) return value;

  if (typeof value === "string") {
    const s = value.trim();
    // Só ajustamos strings ISO sem fuso (formato "YYYY-MM-DDTHH:..."). Caso já
    // tenham fuso, ou sejam outro formato, deixamos o Date nativo resolver.
    if (/^\d{4}-\d{2}-\d{2}[T ]/.test(s) && !TEM_FUSO.test(s)) {
      return new Date(s.replace(" ", "T") + "Z");
    }
    return new Date(s);
  }

  return new Date(value);
};

export default parseApiDate;