// Converte o EventoSchema do SUAP para { days, schedule }, o mesmo formato dos arrays de js/script.js.
// Fica fora de netlify/functions/ porque a Netlify publica cada arquivo de lá como uma função.

// aprendizado prático = lime, conversa e mercado = violet (legenda em index.html); demais tipos = white
const ACCENT_BY_TIPO = {
  minicurso: "lime", oficina: "lime", "torneio desportivo": "lime",
  palestra: "violet", "mesa redonda": "violet",
};
const WEEKDAY = new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" });

const hhmm = (time) => (time ?? "").slice(0, 5);

function toDay(isoDate) {
  const [, month, day] = isoDate.split("-");
  const label = WEEKDAY.format(new Date(`${isoDate}T00:00:00Z`)).replace("-feira", "");
  return { id: isoDate, label, date: `${day}/${month}` };
}

function toSession(atividade, place) {
  const type = (atividade.tipo ?? "").toLowerCase();
  return {
    time: hhmm(atividade.hora),
    title: atividade.descricao,
    type,
    speaker: "", // a API não tem palestrante por atividade
    place,
    accent: ACCENT_BY_TIPO[type] ?? "white",
  };
}

export function toSiteSchedule(evento) {
  const place = evento.local ?? ""; // a API só tem o local do evento, não o de cada atividade
  const dias = (evento.programacao ?? []).filter((d) => d.data && d.atividades?.length);
  const days = dias.map((d) => toDay(d.data));
  const schedule = Object.fromEntries(
    dias.map((d) => [d.data, d.atividades.map((a) => toSession(a, place)).sort((a, b) => a.time.localeCompare(b.time))])
  );
  return { days, schedule };
}
