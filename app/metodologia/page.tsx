import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Info, HelpCircle, Calculator, FileText, AlertTriangle, Shield, Mail } from "lucide-react"

export const metadata = {
  title: "Metodología · Votamatch Perú 2026",
  description:
    "Cómo funciona VOTAMATCH: cuestionario, cálculo de coincidencia, fuentes y limitaciones.",
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
      <div className="text-sm text-slate-600 leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 mt-1">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5B8FCB] shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
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
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span
        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${color} shrink-0 min-w-15 text-center mt-0.5`}
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
            Cómo funciona VOTAMATCH y cómo se calculan los resultados.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">

          {/* 1 — Qué es */}
          <Section icon={<Info className="w-5 h-5" />} title="¿Qué es VOTAMATCH?">
            <p>
              VOTAMATCH es una herramienta digital que permite a las y los ciudadanos comparar sus
              posiciones sobre temas relevantes de política pública con las posiciones atribuidas a
              los partidos políticos que participan en las elecciones.
            </p>
            <p>
              El objetivo de VOTAMATCH es facilitar la orientación política del electorado,
              promoviendo el acceso a información estructurada sobre las posiciones programáticas de
              los partidos.
            </p>
            <p className="text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
              Los resultados que ofrece la herramienta son{" "}
              <strong className="font-semibold text-slate-600">orientativos</strong> y no
              constituyen una recomendación de voto.
            </p>
          </Section>

          {/* 2 — Cómo funciona */}
          <Section icon={<HelpCircle className="w-5 h-5" />} title="¿Cómo funciona el cuestionario?">
            <p>
              El usuario responde un cuestionario compuesto por{" "}
              <strong className="font-semibold text-slate-800">33 afirmaciones</strong> relacionadas
              con temas de política pública relevantes para el país.
            </p>
            <p>Para cada afirmación, el usuario puede indicar su posición seleccionando:</p>
            <div className="mt-1 space-y-0 rounded-xl border border-slate-100 overflow-hidden">
              <ScoreRow
                label="Sí"
                score="Sí"
                description="El usuario apoya o está de acuerdo con la afirmación."
                color="bg-emerald-50 text-emerald-700 border-emerald-200"
              />
              <ScoreRow
                label="Neutral"
                score="Neutral"
                description="El usuario no tiene una posición definida."
                color="bg-slate-100 text-slate-500 border-slate-200"
              />
              <ScoreRow
                label="No"
                score="No"
                description="El usuario se opone o no está de acuerdo con la afirmación."
                color="bg-red-50 text-red-600 border-red-200"
              />
            </div>
            <p>
              Adicionalmente, el usuario puede marcar determinadas preguntas como{" "}
              <strong className="font-semibold text-amber-700">más importantes</strong>, lo que
              incrementa el peso de esas preguntas en el cálculo final de coincidencia.
            </p>
          </Section>

          {/* 3 — Cálculo */}
          <Section icon={<Calculator className="w-5 h-5" />} title="Cálculo de coincidencia">
            <p>
              El sistema compara las respuestas del usuario con las posiciones atribuidas a cada
              partido político. El grado de coincidencia para cada afirmación se calcula así:
            </p>
            <div className="mt-1 space-y-0 rounded-xl border border-slate-100 overflow-hidden">
              <ScoreRow
                label="Coincidencia exacta (misma respuesta)"
                score="100 %"
                description="Ambas partes responden igual, p. ej. Sí / Sí."
                color="bg-emerald-50 text-emerald-700 border-emerald-200"
              />
              <ScoreRow
                label="Neutral frente a Sí o No"
                score="50 %"
                description="Una de las partes no tiene posición definida."
                color="bg-amber-50 text-amber-700 border-amber-200"
              />
              <ScoreRow
                label="Posiciones opuestas (Sí frente a No)"
                score="0 %"
                description="Las respuestas son contradictorias."
                color="bg-red-50 text-red-600 border-red-200"
              />
            </div>
            <p>
              Cuando el usuario marca una pregunta como{" "}
              <strong className="font-semibold text-amber-700">más importante</strong>, esa pregunta
              recibe un peso mayor en el cálculo final. El resultado se expresa como un{" "}
              <strong className="font-semibold text-slate-800">porcentaje de coincidencia</strong>{" "}
              que indica el grado de afinidad entre las respuestas del usuario y las posiciones del
              partido.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs text-slate-600 text-center">
              % coincidencia = (puntos obtenidos / puntos máximos posibles) × 100
            </div>
          </Section>

          {/* 4 — Fuentes */}
          <Section icon={<FileText className="w-5 h-5" />} title="Fuentes de las posiciones de los partidos">
            <p>
              Las posiciones atribuidas a los partidos políticos se han inferido a partir de
              información pública, incluyendo:
            </p>
            <BulletList
              items={[
                "planes de gobierno",
                "idearios partidarios",
                "documentos programáticos",
                "declaraciones públicas de dirigentes y candidatos",
                "propuestas legislativas u otros documentos oficiales",
              ]}
            />
            <p className="text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
              Estas posiciones representan{" "}
              <strong className="font-semibold">interpretaciones basadas en fuentes públicas</strong>{" "}
              y no necesariamente constituyen declaraciones oficiales de los partidos.
            </p>
          </Section>

          {/* 5 — Limitaciones */}
          <Section icon={<AlertTriangle className="w-5 h-5" />} title="Limitaciones">
            <p>
              VOTAMATCH simplifica posiciones políticas complejas en respuestas discretas (Sí,
              Neutral o No). Por esta razón:
            </p>
            <BulletList
              items={[
                "el resultado no refleja necesariamente todas las dimensiones programáticas de un partido",
                "la coincidencia porcentual no debe interpretarse como una evaluación completa de la proximidad política entre el usuario y un partido",
              ]}
            />
            <p>
              El objetivo de la herramienta es facilitar la comparación de posiciones, no sustituir
              el análisis político individual.
            </p>
          </Section>

          {/* 6 — Independencia */}
          <Section icon={<Shield className="w-5 h-5" />} title="Independencia">
            <p>
              VOTAMATCH es una iniciativa{" "}
              <strong className="font-semibold text-slate-800">independiente</strong> y no está
              afiliada a ningún partido político ni organización electoral.
            </p>
            <p>
              El proyecto busca contribuir a mejorar el acceso a información política estructurada y
              promover un voto informado.
            </p>
          </Section>

          {/* 7 — Contacto */}
          <Section icon={<Mail className="w-5 h-5" />} title="Contacto">
            <p>
              Si deseas realizar comentarios, sugerencias o señalar posibles correcciones en las
              posiciones atribuidas a los partidos, puedes escribir a:
            </p>
            <a
              href="mailto:contacto@votamatch.pe"
              className="inline-flex items-center gap-2 mt-1 text-[#5B8FCB] font-medium hover:text-[#4A7DB8] transition-colors"
            >
              <Mail className="w-4 h-4" />
              contacto@votamatch.pe
            </a>
          </Section>

        </div>

        {/* Footer */}
        <div className="mt-10 text-center space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B8FCB] text-white text-sm font-medium hover:bg-[#4A7DB8] transition-colors shadow-sm"
          >
            Hacer el cuestionario
          </Link>
          <p className="text-xs text-slate-400">
            © 2026 VOTAMATCH – Plataforma ciudadana independiente
          </p>
        </div>
      </div>
    </main>
  )
}
