const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5281/api';

export async function request(endpoint, options = {}) {
  let url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    let response;
    try {
      response = await fetch(url, config);
    } catch (fetchErr) {
      // If 5281 fails, attempt fallback to port 5000
      if (BASE_URL.includes('5281')) {
        const fallbackUrl = `http://localhost:5000/api${endpoint}`;
        response = await fetch(fallbackUrl, config);
      } else {
        throw fetchErr;
      }
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(
        typeof data === 'object' && data?.error 
          ? data.error 
          : (typeof data === 'object' && data?.message ? data.message : `Request failed with status ${response.status}`)
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}
