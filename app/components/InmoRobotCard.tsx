export function InmoRobotCard() {
  return (
    <aside className="not-prose mt-12 rounded-2xl border border-blue-100 bg-blue-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
        Otro proyecto del mismo equipo
      </p>
      <p className="mt-2 text-lg font-bold text-gray-900">
        ¿Tienes una agencia inmobiliaria? Mira InmoRobot
      </p>
      <p className="mt-1 text-sm text-gray-700">
        Directorio y comparativas de herramientas de IA para agencias en España:
        virtual staging, valoración, CRM, chatbots y captación de leads.
      </p>
      <a
        href="https://www.inmorobot.com/?utm_source=pymestools&utm_medium=card&utm_campaign=inmobiliarias"
        target="_blank"
        rel="noopener"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-blue-700"
      >
        Ver herramientas de IA para inmobiliarias →
      </a>
    </aside>
  )
}
