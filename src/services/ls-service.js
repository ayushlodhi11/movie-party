export const get = (key) => {
  const value = window.localStorage.getItem(key)
  return value
}

export const set = (key, value) => {
  window.localStorage.setItem(key, value)
}

export const remove = (key) => {
  localStorage.removeItem(key)
}
