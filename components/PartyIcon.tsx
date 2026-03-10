"use client"

import { useState } from "react"
import { Building2 } from "lucide-react"
import { getPartyIconPath, type PartyIconInfo } from "@/lib/party-icons"
import React, { useEffect } from 'react';

interface PartyIconProps extends PartyIconInfo {
  name: string
  /** Width & height in pixels. Default: 40 */
  size?: number
  className?: string
}

/**
 * Displays a party logo from /public/parties/ using a single, pre-resolved URL.
 *
 * - If `iconFileName` is set in Firestore, uses it directly.
 * - Otherwise looks up the slug in the static PARTY_ICON_MAP.
 * - Zero 404 network probing: if the slug is unknown, renders a fallback
 *   icon immediately without making any image request.
 *
 * Styling: white background, rounded-2xl, padding, object-contain.
 */
export function PartyIcon({ slug, iconFileName, name, size = 40, className = "" }: PartyIconProps) {
  const src = getPartyIconPath({ slug, iconFileName })
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const wrapperStyle: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden p-1.5 ${className}`}
      style={wrapperStyle}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <Building2
          style={{ width: size * 0.45, height: size * 0.45 }}
          className="text-slate-300"
        />
      )}
    </div>
  )
}
