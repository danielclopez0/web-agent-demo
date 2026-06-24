export const DEMOCORP_USER_STORAGE_KEY = 'democorp:user'
export const TESTTRACK_OVERRIDES_STORAGE_KEY = 'testtrack:overrides:v1'
export const RESET_DEMO_PARAM = 'resetDemo'
export const FRESH_LOGIN_PARAM = 'freshLogin'

export function resetTestTrackState() {
  localStorage.removeItem(TESTTRACK_OVERRIDES_STORAGE_KEY)
}

export function resetDemoState() {
  localStorage.removeItem(DEMOCORP_USER_STORAGE_KEY)
  resetTestTrackState()
}

export function consumeDemoResetFromUrl(resetState = resetDemoState) {
  const url = new URL(window.location.href)
  const shouldReset = url.searchParams.has(RESET_DEMO_PARAM) || url.searchParams.has(FRESH_LOGIN_PARAM)
  if (!shouldReset) return false

  resetState()
  url.searchParams.delete(RESET_DEMO_PARAM)
  url.searchParams.delete(FRESH_LOGIN_PARAM)
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  return true
}
