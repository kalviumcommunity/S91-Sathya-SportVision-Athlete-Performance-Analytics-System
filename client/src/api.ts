export async function getApiError(response: Response): Promise<string> {
  const status = `${response.status}${response.statusText ? ` ${response.statusText}` : ''}`
  let responseBody: string

  try {
    responseBody = await response.text()
  } catch {
    return `Request failed (${status}); the response body could not be read.`
  }

  if (!responseBody.trim()) {
    return `Request failed (${status}); the server returned an empty response.`
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    try {
      const body: unknown = JSON.parse(responseBody)
      if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
        return body.error
      }
    } catch {
      return `Request failed (${status}); the server returned invalid JSON.`
    }
    return `Request failed (${status}); the server returned an unexpected JSON response.`
  }

  if (response.headers.get('content-type')?.includes('text/html')) {
    return `Request failed (${status}); the server returned an HTML error page.`
  }

  const message = responseBody.trim().replace(/\s+/g, ' ')
  return `Request failed (${status}): ${message.slice(0, 240)}`
}
