import { get } from '../services/ls-service'
import * as appConfigs from '../consts/app-config'

const fetchConfig = (method, load, isMultipart, token) => {
  const url = `${appConfigs.SERVER_URL}:${appConfigs.SERVER_PORT}`
  const headers = new Headers()
  if (isMultipart) {
    // headers.append('Content-Type', 'multipart/form-data');
  } else {
    headers.append('Content-Type', 'application/json')
  }
  // some new text added want to add more, need more testing
  headers.append('Accept', 'application/json')
  headers.append('Access-Control-Allow-Origin', url)

  let authToken = get(appConfigs.TOKEN_NAME)
  if (token) {
    authToken = token
  }
  if (authToken) {
    headers.append(appConfigs.TOKEN_NAME, authToken)
  }

  const config = {
    method: method,
    // credentials: 'include',
    headers: headers
  }
  if (method === 'post' || method === 'put' || method === 'delete') {
    if (!isMultipart) {
      const payload = JSON.stringify(load)
      config.body = payload
    } else {
      const payload = new FormData()
      Object.keys(load).forEach((key) => {
        payload.append(key, load[key])
      })
      config.body = payload
    }
  }

  return Object.assign({}, config)
}

export default fetchConfig
