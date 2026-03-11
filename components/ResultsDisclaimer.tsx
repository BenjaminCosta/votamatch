import Link from "next/link"
import { Info } from "lucide-react"

export function ResultsDisclaimer() {
  return (
    <div className="flex gap-3 items-start px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
      <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden />
      <p className="text-xs text-slate-500 leading-relaxed">
        Las posiciones de los partidos utilizadas en este cuestionario son inferidas a partir de
        documentos públicos. Los resultados son <strong className="font-medium text-slate-600">orientativos</strong> y no representan
        posturas oficiales.{" "}
        <Link
          href="/metodologia"
          className="underline underline-offset-2 hover:text-slate-700 transition-colors"
        >
          Ver metodología
        </Link>
        .
      </p>
    </div>
  )
}
