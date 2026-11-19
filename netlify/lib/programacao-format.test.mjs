// node --test netlify/lib/
import { test } from "node:test";
import assert from "node:assert/strict";
import { toSiteSchedule } from "./programacao-format.mjs";

const atividade = (hora, tipo, descricao) => ({ tipo, descricao, hora: `${hora}:00`, hora_fim: null });

test("converte a programação do SUAP para o formato do site", () => {
  const evento = {
    local: "Campus Palmas",
    programacao: [
      { data: "2026-11-23", atividades: [atividade("19:00", "Palestra", "B"), atividade("08:00", "Minicurso", "A")] },
      { data: "2026-11-24", atividades: [] },
    ],
  };

  const { days, schedule } = toSiteSchedule(evento);

  assert.deepEqual(days, [{ id: "2026-11-23", label: "segunda", date: "23/11" }]);
  assert.deepEqual(schedule["2026-11-23"], [
    { time: "08:00", title: "A", type: "minicurso", speaker: "", place: "Campus Palmas", accent: "lime" },
    { time: "19:00", title: "B", type: "palestra", speaker: "", place: "Campus Palmas", accent: "violet" },
  ]);
});

test("evento sem programação devolve listas vazias", () => {
  assert.deepEqual(toSiteSchedule({}), { days: [], schedule: {} });
});
