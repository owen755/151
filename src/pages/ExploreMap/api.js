// The one place that knows the server address.
// Team default is port 3000. A private .env.local file can override it.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
