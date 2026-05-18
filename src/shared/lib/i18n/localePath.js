const VI_PREFIX = '/vn'

export function getLanguageFromPath(pathname) {
    return pathname === VI_PREFIX || pathname.startsWith(`${VI_PREFIX}/`) ? 'vi' : 'en'
}

export function stripLocalePrefix(pathname) {
    if (pathname === VI_PREFIX) return '/'
    if (pathname.startsWith(`${VI_PREFIX}/`)) return pathname.slice(VI_PREFIX.length)
    return pathname || '/'
}

export function addLocalePrefix(pathname, language) {
    const cleanPath = stripLocalePrefix(pathname)

    if (language !== 'vi') {
        return cleanPath
    }

    return cleanPath === '/' ? VI_PREFIX : `${VI_PREFIX}${cleanPath}`
}

export function localizePath(pathname, language) {
    return addLocalePrefix(pathname, language)
}
