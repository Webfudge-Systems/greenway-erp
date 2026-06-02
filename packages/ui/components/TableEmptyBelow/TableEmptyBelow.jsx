import { clsx } from 'clsx'

/**
 * CRM-style "Showing N results" line above a data table.
 */
export function TableResultsCount({ count, className }) {
  return (
    <div className={clsx('text-sm text-gray-600', className)}>
      Showing <span className="font-semibold text-gray-900">{count}</span> result
      {count !== 1 ? 's' : ''}
    </div>
  )
}

/**
 * Empty block below a `Table` (border-t), matching CRM list pages (e.g. lead companies).
 */
export function TableEmptyBelow({ icon: Icon, title, description, action, className }) {
  return (
    <div className={clsx('p-12 text-center bg-transparent', className)}>
      {Icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center text-gray-400">
          <Icon className="h-10 w-10 opacity-90" strokeWidth={1.25} />
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      )}
      {description && (
        <p className="mt-1.5 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
