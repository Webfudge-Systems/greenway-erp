'use client';

/** Keep in sync with WEBFUDGE_BRAND.loginLogoPath in @greenways/config */
const LOGIN_LOGO_PATH = '/logo/icon 3 bg removed white.png';
const BRAND_NAME = 'Webfudge Systems';

function BrandIcon({ src, size = 'md', className = '' }) {
  const boxClass = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const imgClass = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size === 'sm' ? 32 : 40}
      height={size === 'sm' ? 32 : 40}
      className={`${imgClass} shrink-0 rounded-xl object-contain ${className}`.trim()}
    />
  );
}

/** Webfudge Systems icon + name — top-left on login branding panels. */
export function LoginBrandCorner({
  brandIconPath = LOGIN_LOGO_PATH,
  brandName = BRAND_NAME,
  className = '',
}) {
  return (
    <div
      className={`absolute top-8 left-8 z-10 flex items-center gap-3 ${className}`.trim()}
    >
      <BrandIcon src={brandIconPath} />
      <span className="text-xl font-bold tracking-tight text-white">{brandName}</span>
    </div>
  );
}

/** Product name + creator line — text only, no icon. */
export function LoginProductCredit({
  productName,
  creatorLine,
  className = '',
  tone = 'on-orange',
}) {
  const onOrange = tone === 'on-orange';

  return (
    <div className={`mb-8 ${className}`.trim()}>
      <p
        className={`font-bold leading-tight ${
          onOrange ? 'text-lg text-white' : 'text-base text-brand-dark'
        }`}
      >
        {productName}
      </p>
      {creatorLine ? (
        <p className={`mt-0.5 text-xs ${onOrange ? 'text-white/70' : 'text-gray-500'}`}>
          {creatorLine}
        </p>
      ) : null}
    </div>
  );
}

function LoginUsageCards({ cards, className = '' }) {
  if (!cards?.length) return null;

  return (
    <div className={`mt-12 grid grid-cols-3 gap-6 ${className}`.trim()}>
      {cards.map((item) => (
        <div key={item.label} className="rounded-xl bg-white/10 p-4 text-center">
          <p className="text-sm font-semibold text-white">{item.value}</p>
          <p className="mt-1 text-xs text-white/70">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Left-side branding panel for app login pages (desktop).
 */
export function LoginBrandingPanel({
  productName,
  brandName = BRAND_NAME,
  brandIconPath = LOGIN_LOGO_PATH,
  creatorLine = 'by Webfudge Systems',
  headline = 'Welcome back',
  summary,
  description,
  usageCards = [],
  className = '',
}) {
  return (
    <div
      className={`relative hidden flex-col justify-center bg-gradient-to-br from-brand-primary to-orange-600 px-16 py-20 lg:flex lg:w-1/2 ${className}`}
    >
      <LoginBrandCorner brandIconPath={brandIconPath} brandName={brandName} />
      <div className="max-w-lg text-white">
        <LoginProductCredit
          productName={productName}
          creatorLine={creatorLine}
          tone="on-orange"
        />
        <h1 className="mb-6 text-5xl font-bold">{headline}</h1>
        {summary ? <p className="mb-4 text-xl text-white/90">{summary}</p> : null}
        {description ? <p className="leading-relaxed text-white/80">{description}</p> : null}
        <LoginUsageCards cards={usageCards} />
      </div>
    </div>
  );
}

/**
 * Compact branding strip for login pages on mobile.
 */
export function LoginBrandingMobile({
  productName,
  brandName = BRAND_NAME,
  brandIconPath = LOGIN_LOGO_PATH,
  summary,
  className = '',
}) {
  return (
    <div
      className={`border-b border-orange-100 bg-gradient-to-r from-brand-primary to-orange-600 px-6 py-5 lg:hidden ${className}`}
    >
      <div className="mx-auto flex max-w-md items-center gap-3 text-white">
        <BrandIcon src={brandIconPath} size="sm" />
        <div className="min-w-0">
          <p className="text-lg font-bold">{brandName}</p>
          <p className="truncate text-sm text-white/85">
            {productName}
            {summary ? ` — ${summary}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Mobile login form column — brand header + product credit. */
export function LoginMobileBrandHeader({
  brandIconPath = LOGIN_LOGO_PATH,
  brandName = BRAND_NAME,
  productName,
  creatorLine = 'by Webfudge Systems',
}) {
  return (
    <div className="mb-8 lg:hidden">
      <div className="mb-4 flex items-center gap-2.5">
        <BrandIcon src={brandIconPath} size="sm" className="rounded-lg" />
        <span className="text-lg font-bold tracking-tight text-brand-dark">{brandName}</span>
      </div>
      {productName ? (
        <LoginProductCredit
          productName={productName}
          creatorLine={creatorLine}
          tone="light"
          className="mb-0"
        />
      ) : null}
    </div>
  );
}

export default LoginBrandingPanel;
