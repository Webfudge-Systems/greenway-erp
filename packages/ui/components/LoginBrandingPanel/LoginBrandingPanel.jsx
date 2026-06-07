'use client';

const LOGIN_LOGO_PATH = '/logo/icon 3 bg removed white.png';
const BRAND_NAME = 'Webfudge Systems';

function BrandLogo({ size = 'md' }) {
  const boxClass = size === 'sm' ? 'h-10 w-10' : 'h-10 w-10';
  const imgClass = size === 'sm' ? 'h-6 w-6' : 'h-6 w-6';

  return (
    <div className={`${boxClass} bg-white/20 rounded-xl flex items-center justify-center shrink-0`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGIN_LOGO_PATH}
        alt={BRAND_NAME}
        width={24}
        height={24}
        className={`${imgClass} object-contain`}
      />
    </div>
  );
}

/**
 * Left-side branding panel for app login pages (desktop).
 */
export function LoginBrandingPanel({ tagline, className = '' }) {
  return (
    <div
      className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-primary to-orange-600 flex-col justify-center px-16 py-20 ${className}`}
    >
      <div className="max-w-lg text-white">
        <div className="mb-6">
          <BrandLogo />
        </div>
        <h1 className="text-5xl font-bold mb-6">{BRAND_NAME}</h1>
        <p className="text-xl text-white/90 leading-relaxed">{tagline}</p>
      </div>
    </div>
  );
}

/**
 * Compact branding strip for login pages on mobile.
 */
export function LoginBrandingMobile({ tagline, className = '' }) {
  return (
    <div
      className={`border-b border-orange-100 bg-gradient-to-r from-brand-primary to-orange-600 px-6 py-5 lg:hidden ${className}`}
    >
      <div className="mx-auto flex max-w-md items-center gap-3 text-white">
        <BrandLogo size="sm" />
        <div className="min-w-0">
          <p className="text-lg font-bold">{BRAND_NAME}</p>
          <p className="text-sm text-white/85 truncate">{tagline}</p>
        </div>
      </div>
    </div>
  );
}

export default LoginBrandingPanel;
