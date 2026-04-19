import { useMemo, useState } from "react";

type AppointmentMonitor = {
  id: number;
  tramite: string;
  entidad: string;
  ciudad: string;
  url: string;
  frecuencia: string;
  canal: string;
  estado: "Activo" | "Pausado";
  ultimaRevision: string;
  disponibilidad: "Sin cupos" | "Detectado" | "Revisando";
};

type RiskFlag = {
  label: string;
  severity: "Alta" | "Media" | "Baja";
  reason: string;
};

const initialMonitors: AppointmentMonitor[] = [
  {
    id: 1,
    tramite: "Pasaporte",
    entidad: "Gobernación",
    ciudad: "Cartagena",
    url: "https://ejemplo.gov/citas/pasaporte",
    frecuencia: "Cada 10 min",
    canal: "Telegram",
    estado: "Activo",
    ultimaRevision: "Hace 2 min",
    disponibilidad: "Sin cupos",
  },
  {
    id: 2,
    tramite: "Licencia de conducción",
    entidad: "Secretaría de Movilidad",
    ciudad: "Barranquilla",
    url: "https://ejemplo.gov/citas/licencia",
    frecuencia: "Cada 15 min",
    canal: "Correo",
    estado: "Activo",
    ultimaRevision: "Hace 1 min",
    disponibilidad: "Detectado",
  },
  {
    id: 3,
    tramite: "Cita médica",
    entidad: "EPS Salud Viva",
    ciudad: "Bogotá",
    url: "https://portal.eps/citas",
    frecuencia: "Cada 5 min",
    canal: "WhatsApp",
    estado: "Pausado",
    ultimaRevision: "Hace 18 min",
    disponibilidad: "Revisando",
  },
];

const clauses = [
  {
    test: /compartir|terceros|third parties|proveedores externos|partners/i,
    label: "Comparte datos con terceros",
    severity: "Alta" as const,
    reason:
      "El texto sugiere que la empresa puede compartir información personal con terceros o aliados.",
  },
  {
    test: /modificar|cambiar.*sin previo aviso|actualizar.*sin notificación|sole discretion/i,
    label: "Cambios unilaterales",
    severity: "Media" as const,
    reason:
      "Parece permitir cambios a los términos sin avisar claramente al usuario.",
  },
  {
    test: /renuncia|waive|arbitraje|arbitration|jurisdicción exclusiva/i,
    label: "Limitación de defensa legal",
    severity: "Alta" as const,
    reason:
      "Hay señales de arbitraje forzoso, renuncia de derechos o jurisdicción restrictiva.",
  },
  {
    test: /perpetua|irrevocable|worldwide|global|royalty-free|licencia/i,
    label: "Licencia amplia sobre tu contenido",
    severity: "Alta" as const,
    reason:
      "Podrían estar obteniendo permisos muy amplios sobre contenido subido por el usuario.",
  },
  {
    test: /no nos hacemos responsables|sin responsabilidad|as is|without warranty/i,
    label: "Exención fuerte de responsabilidad",
    severity: "Media" as const,
    reason:
      "La empresa intenta limitar de forma amplia su responsabilidad frente a fallos o daños.",
  },
  {
    test: /retener|almacenar|conservar.*por|indefinidamente/i,
    label: "Retención extensa de datos",
    severity: "Media" as const,
    reason:
      "El texto indica que los datos pueden guardarse durante mucho tiempo o sin claridad suficiente.",
  },
];

function analyzeTerms(text: string): RiskFlag[] {
  if (!text.trim()) return [];
  return clauses
    .filter((clause) => clause.test.test(text))
    .map((clause) => ({
      label: clause.label,
      severity: clause.severity,
      reason: clause.reason,
    }));
}

function severityClasses(severity: RiskFlag["severity"]) {
  if (severity === "Alta") {
    return "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200";
  }
  if (severity === "Media") {
    return "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200";
  }
  return "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200";
}

function availabilityClasses(state: AppointmentMonitor["disponibilidad"]) {
  if (state === "Detectado") {
    return "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200";
  }
  if (state === "Revisando") {
    return "bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200";
  }
  return "bg-stone-200 text-stone-700 ring-1 ring-inset ring-stone-300";
}

export default function App() {
  const [monitors, setMonitors] =
    useState<AppointmentMonitor[]>(initialMonitors);
  const [termsText, setTermsText] = useState("");
  const [form, setForm] = useState({
    tramite: "",
    entidad: "",
    ciudad: "",
    url: "",
    frecuencia: "Cada 10 min",
    canal: "Telegram",
  });

  const findings = useMemo(() => analyzeTerms(termsText), [termsText]);

  const riskScore = useMemo(() => {
    return findings.reduce((acc, item) => {
      if (item.severity === "Alta") return acc + 35;
      if (item.severity === "Media") return acc + 20;
      return acc + 10;
    }, 0);
  }, [findings]);

  const normalizedRisk = Math.min(riskScore, 100);

  const activeCount = monitors.filter((m) => m.estado === "Activo").length;
  const detectedCount = monitors.filter(
    (m) => m.disponibilidad === "Detectado",
  ).length;

  function handleCreateMonitor(e: React.FormEvent) {
    e.preventDefault();

    if (!form.tramite || !form.entidad || !form.ciudad || !form.url) return;

    const newMonitor: AppointmentMonitor = {
      id: Date.now(),
      tramite: form.tramite,
      entidad: form.entidad,
      ciudad: form.ciudad,
      url: form.url,
      frecuencia: form.frecuencia,
      canal: form.canal,
      estado: "Activo",
      ultimaRevision: "Ahora",
      disponibilidad: "Revisando",
    };

    setMonitors((prev) => [newMonitor, ...prev]);

    setForm({
      tramite: "",
      entidad: "",
      ciudad: "",
      url: "",
      frecuencia: "Cada 10 min",
      canal: "Telegram",
    });
  }

  function toggleMonitor(id: number) {
    setMonitors((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              estado: item.estado === "Activo" ? "Pausado" : "Activo",
            }
          : item,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-stone-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-3xl bg-stone-700 text-stone-50 shadow-2xl">
          <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.4fr_0.9fr] md:px-10 md:py-10">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-2xl font-medium uppercase tracking-[0.2em] text-stone-200">
                React + TypeScript + Tailwind
              </div>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                CitaGuard + Terms Lens
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
                Un panel para monitorear citas disponibles en trámites y revisar
                términos y condiciones con ayuda de análisis automatizado. Ideal
                como proyecto de portafolio para mostrar frontend de producto,
                formularios, tablas, estados y lógica útil.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
              <StatCard label="Monitores activos" value={String(activeCount)} />
              <StatCard
                label="Cup os detectados"
                value={String(detectedCount)}
              />
              <StatCard label="Riesgo del texto" value={`${normalizedRisk}%`} />
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Panel
              title="Detector de citas disponibles"
              subtitle="Configura revisiones automáticas para portales de trámites, salud o licencias."
            >
              <form
                onSubmit={handleCreateMonitor}
                className="grid gap-4 md:grid-cols-2"
              >
                <Field label="Trámite">
                  <input
                    value={form.tramite}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, tramite: e.target.value }))
                    }
                    placeholder="Ej: Pasaporte"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
                  />
                </Field>

                <Field label="Entidad">
                  <input
                    value={form.entidad}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, entidad: e.target.value }))
                    }
                    placeholder="Ej: Gobernación"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
                  />
                </Field>

                <Field label="Ciudad">
                  <input
                    value={form.ciudad}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, ciudad: e.target.value }))
                    }
                    placeholder="Ej: Cartagena"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
                  />
                </Field>

                <Field label="URL del portal">
                  <input
                    value={form.url}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, url: e.target.value }))
                    }
                    placeholder="https://..."
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
                  />
                </Field>

                <Field label="Frecuencia">
                  <select
                    value={form.frecuencia}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        frecuencia: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
                  >
                    <option>Cada 5 min</option>
                    <option>Cada 10 min</option>
                    <option>Cada 15 min</option>
                    <option>Cada 30 min</option>
                  </select>
                </Field>

                <Field label="Canal de alerta">
                  <select
                    value={form.canal}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, canal: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
                  >
                    <option>Telegram</option>
                    <option>Correo</option>
                    <option>WhatsApp</option>
                    <option>SMS</option>
                  </select>
                </Field>

                <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-2xl bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                  >
                    Crear monitor
                  </button>
                  <span className="text-sm text-stone-500">
                    En backend puedes conectar Playwright o Selenium para
                    revisar páginas dinámicas.
                  </span>
                </div>
              </form>
            </Panel>

            <Panel
              title="Monitores configurados"
              subtitle="Vista simulada de los trabajos que revisarían disponibilidad y enviarían alertas."
            >
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.16em] text-stone-500">
                      <th className="pb-2 pr-4">Trámite</th>
                      <th className="pb-2 pr-4">Entidad</th>
                      <th className="pb-2 pr-4">Ciudad</th>
                      <th className="pb-2 pr-4">Estado</th>
                      <th className="pb-2 pr-4">Disponibilidad</th>
                      <th className="pb-2 pr-4">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monitors.map((monitor) => (
                      <tr
                        key={monitor.id}
                        className="rounded-2xl bg-stone-50 shadow-sm"
                      >
                        <td className="rounded-l-2xl px-4 py-4 align-top">
                          <div className="font-medium text-stone-900">
                            {monitor.tramite}
                          </div>
                          <div className="mt-1 text-xs text-stone-500">
                            {monitor.frecuencia} · {monitor.canal}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-stone-700">
                          {monitor.entidad}
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-stone-700">
                          {monitor.ciudad}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              monitor.estado === "Activo"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-stone-200 text-stone-700"
                            }`}
                          >
                            {monitor.estado}
                          </span>
                          <div className="mt-2 text-xs text-stone-500">
                            {monitor.ultimaRevision}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${availabilityClasses(
                              monitor.disponibilidad,
                            )}`}
                          >
                            {monitor.disponibilidad}
                          </span>
                        </td>
                        <td className="rounded-r-2xl px-4 py-4 align-top">
                          <button
                            onClick={() => toggleMonitor(monitor.id)}
                            className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                          >
                            {monitor.estado === "Activo" ? "Pausar" : "Activar"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel
              title="Lector de términos y condiciones con IA"
              subtitle="Pega texto legal y detecta cláusulas potencialmente sensibles con análisis local."
            >
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Texto de términos y condiciones
              </label>
              <textarea
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                placeholder="Pega aquí los términos y condiciones..."
                rows={14}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
              />
              <div className="mt-4 rounded-2xl bg-stone-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-stone-500">
                      Puntaje estimado de riesgo
                    </p>
                    <p className="text-3xl font-semibold text-stone-950">
                      {normalizedRisk}%
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      normalizedRisk >= 70
                        ? "bg-rose-100 text-rose-700"
                        : normalizedRisk >= 35
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {normalizedRisk >= 70
                      ? "Riesgo alto"
                      : normalizedRisk >= 35
                        ? "Riesgo medio"
                        : "Riesgo bajo"}
                  </div>
                </div>
              </div>
              // Aquí se podrían mostrar los hallazgos específicos encontrados
              en el texto, con etiquetas de severidad y explicaciones.
              <div className="mt-5 space-y-3">
                {findings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-500">
                    Aún no se detectan patrones. Pega un texto que incluya
                    cláusulas de datos, arbitraje, cambios unilaterales o
                    licencias amplias.
                  </div>
                ) : (
                  findings.map((item, index) => (
                    <article
                      key={`${item.label}-${index}`}
                      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold text-stone-900">
                          {item.label}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${severityClasses(
                            item.severity,
                          )}`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        {item.reason}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </Panel>

            <Panel
              title="Arquitectura sugerida"
              subtitle="Cómo escalar esto a un proyecto completo."
            >
              <div className="space-y-4 text-sm leading-7 text-stone-600">
                <div className="rounded-2xl bg-stone-100 p-4">
                  <p className="font-medium text-stone-900">Frontend</p>
                  <p>
                    React, TypeScript y Tailwind para dashboard, formularios,
                    estados, tablas y resultados del análisis.
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-100 p-4">
                  <p className="font-medium text-stone-900">Backend</p>
                  <p>
                    Node.js con Playwright o Selenium para revisar portales de
                    citas que cargan contenido dinámico o requieren login.
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-100 p-4">
                  <p className="font-medium text-stone-900">Alertas</p>
                  <p>
                    Telegram, correo o WhatsApp cuando se detecte un cupo
                    disponible o cambie el estado del trámite.
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-100 p-4">
                  <p className="font-medium text-stone-900">IA real</p>
                  <p>
                    Un LLM puede resumir términos complejos, destacar riesgos y
                    traducir lenguaje legal a explicaciones simples para el
                    usuario.
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-stone-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-300">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </span>
      {children}
    </label>
  );
}
