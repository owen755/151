// The one place that knows the server address.
// - On your laptop (npm run dev) the team's json-server is on port 3000.
//   A private .env.local file can change the port.
// - On the live site (GitHub Pages) there is no data server, so the address is
//   empty and the page uses the copy of db.json that is bundled with the app.
//   If the team hosts a server later, set VITE_API_URL when building.
export const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : '')
