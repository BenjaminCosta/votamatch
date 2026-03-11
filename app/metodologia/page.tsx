import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, FileText, Code2, Calculator, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Metodología · Votamatch Perú 2026",
  description:
    "Cómo se infieren las posiciones de los partidos y cómo se calcula la afinidad en Votamatch.",
}

interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#5B8FCB]/10 flex items-center justify-center shrink-0 text-[#5B8FCB]">
          {icon}
        </div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>
      <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

function ScoreRow({
  label,
  score,
  description,
  color,
}: {
  label: string
  score: string
  description: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span
        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${color} shrink-0 min-w-15 text-center`}
      >
        {score}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  )
}

export default function MetodologiaPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-sky-50 py-10 px-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5B8FCB]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#EF4444]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/logo_votamatch.png"
              alt="Votamatch Perú 2026"
              width={130}
              height={65}
              className="mx-auto"
            />
          </Link>
        </div>

        {/* Page header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Metodología</h1>
          <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto">
            Cómo inferimos las posiciones de los partidos y cómo calculamos tu afinidad con ellos.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {/* 1 — Fuentes */}
          <Section icon={<FileText className="w-5 h-5" />} title="1. Fuentes de información">
            <p>
              Las posiciones que se atribuyen a cada partido <strong>no son declaradas ni
              verificadas directamente por los partidos</strong>. Fueron inferidas por el equipo de
              Votamatch a partir de documentos públicos disponibles, que pueden incluir:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-500 mt-2">
              <li>Planes de gobierno presentados ante el JNE</li>
              <li>Declaraciones públicas de candidatos</li>
              <li>Posiciones históricas documentadas del partido</li>
              <li>Votaciones y proyectos en el Congreso</li>
            </ul>
            <p className="mt-2 text-slate-500 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              ⚠ La disponibilidad y calidad de los documentos varía por partido. Donde no hay
              información suficiente, la posición se deja como <em>Neutral</em>.
            </p>
          </Section>

          {/* 2 — Codificación */}
          <Section icon={<Code2 className="w-5 h-5" />} title="2. Codificación de respuestas">
            <p>
              Cada posición —tanto la del usuario como la inferida del partido— se codifica con uno
              de tres valores:
            </p>
            <div className="mt-3 space-y-0 rounded-xl border border-slate-100 overflow-hidden">
              <ScoreRow
                label="Sí / A favor"
                score="Sí"
                description="El partido apoya o promueve activamente la medida."
                color="bg-emerald-50 text-emerald-700 border-emerald-200"
              />
              <ScoreRow
                label="No / En contra"
                score="No"
                description="El partido se opone o rechaza la medida."
                color="bg-red-50 text-red-600 border-red-200"
              />
              <ScoreRow
                label="Neutral / Sin posición"
                score="Neutral"
                description="No hay evidencia suficiente o la posición es ambigua."
                color="bg-slate-100 text-slate-500 border-slate-200"
              />
            </div>
          </Section>

          {/* 3 — Cálculo */}
          <Section icon={<Calculator className="w-5 h-5" />} title="3. Cálculo de afinidad">
            <p>
              Para cada partido se compara tu respuesta con la posición inferida en cada pregunta.
              El puntaje de cada pregunta depende del tipo de coincidencia y si marcaste la pregunta
              como <em>importante</em>:
            </p>
            <div className="mt-3 space-y-0 rounded-xl border border-slate-100 overflow-hidden">
              <ScoreRow
                label="Coincidencia exacta"
                score="1 pt"
                description='Ambos responden igual (ej: Sí / Sí). Vale 2 pt si marcaste "Importante".'
                color="bg-emerald-50 text-emerald-700 border-emerald-200"
              />
              <ScoreRow
                label="Coincidencia parcial"
                score="0.5 pt"
                description='Una de las partes responde Neutral. Vale 1 pt si marcaste "Importante".'
                color="bg-amber-50 text-amber-700 border-amber-200"
              />
              <ScoreRow
                label="Sin coincidencia"
                score="0 pt"
                description="Las respuestas son opuestas (Sí vs No)."
                color="bg-red-50 text-red-600 border-red-200"
              />
            </div>
            <p className="mt-3">
              El porcentaje final se calcula dividiendo los puntos obtenidos entre el máximo
              posible:
            </p>
            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs text-slate-600 text-center">
              % afinidad = (puntos obtenidos / puntos máximos posibles) × 100
            </div>
          </Section>

          {/* 4 — Advertencia */}
          <Section icon={<AlertCircle className="w-5 h-5" />} title="4. Limitaciones y uso responsable">
            <p>
              Los resultados de Votamatch son <strong>estrictamente orientativos</strong> y tienen
              como único objetivo facilitar la reflexión ciudadana sobre afinidades programáticas.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-500 mt-2">
              <li>No representan posturas oficiales de ningún partido.</li>
              <li>
                La inferencia de posiciones puede contener errores o estar desactualizada.
              </li>
              <li>
                El porcentaje de afinidad no indica que un partido sea &quot;mejor&quot; o
                &quot;peor&quot; que otro.
              </li>
              <li>El voto es una decisión personal que va más allá de la afinidad programática.</li>
            </ul>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B8FCB] text-white text-sm font-medium hover:bg-[#4A7DB8] transition-colors shadow-sm"
          >
            Hacer el cuestionario
          </Link>
          <p className="text-xs text-slate-400 mt-4">
            ¿Tienes preguntas o detectaste un error?{" "}
            <a
              href="mailto:contacto@votamatch.pe"
              className="underline underline-offset-2 hover:text-slate-600 transition-colors"
            >
              Contáctanos
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  )
}
