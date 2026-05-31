const LOCALE_PREFIX = '/vn'

export function getLanguageFromPath(pathname) {
  return pathname === LOCALE_PREFIX || pathname.startsWith(`${LOCALE_PREFIX}/`) ? 'vi' : 'en'
}

export function stripLocalePrefix(pathname) {
  if (pathname === LOCALE_PREFIX) return '/'
  if (pathname.startsWith(`${LOCALE_PREFIX}/`)) {
    return pathname.slice(LOCALE_PREFIX.length) || '/'
  }
  return pathname
}

export function addLocalePrefix(pathname) {
  if (pathname === '/' || pathname === '') return LOCALE_PREFIX
  return pathname.startsWith('/') ? `${LOCALE_PREFIX}${pathname}` : `${LOCALE_PREFIX}/${pathname}`
}

export function localizePath(pathname, language) {
  const basePath = stripLocalePrefix(pathname)
  return language === 'vi' ? addLocalePrefix(basePath) : basePath
}