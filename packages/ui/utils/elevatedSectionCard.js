/**
 * Full-width elevated section cards for add/edit/detail form pages.
 * Reference: apps/pm/app/projects/add/page.js, platform org create.
 */
export const ELEVATED_SECTION_CARD_CLASS = 'w-full rounded-xl'

/** Icon badge used in Card section titles (project add, org create, etc.) */
export function SectionCardTitleContent({ icon: Icon, label, iconClassName = 'bg-orange-500' }) {
  if (!Icon) return label
  return (
    <span className="inline-flex items-center gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
      >
        <Icon className="h-4 w-4 text-white" aria-hidden />
      </span>
      <span>{label}</span>
    </span>
  )
}
