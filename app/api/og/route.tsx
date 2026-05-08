import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const title = searchParams.get('title') ?? 'PymesTools'
  const description =
    searchParams.get('description') ??
    'Comparativas y reviews de software para pymes'
  const type = searchParams.get('type') ?? ''

  const TYPE_LABELS: Record<string, string> = {
    review: 'Review',
    comparativa: 'Comparativa',
    guia: 'Guía',
    tutorial: 'Tutorial',
  }

  const typeLabel = TYPE_LABELS[type] ?? type

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#111111',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Brand name top-left */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <span
            style={{
              color: '#2563eb',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Pymes
          </span>
          <span
            style={{
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Tools
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            color: '#ffffff',
            fontSize: title.length > 60 ? '42px' : '52px',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          {title}
        </div>

        {/* Description */}
        {description && (
          <div
            style={{
              color: '#9ca3af',
              fontSize: '22px',
              lineHeight: 1.5,
              marginTop: '24px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </div>
        )}

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginTop: '40px',
          }}
        >
          {typeLabel && (
            <span
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
                padding: '6px 18px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {typeLabel}
            </span>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
