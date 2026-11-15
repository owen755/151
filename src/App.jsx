import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ExploreMap from './pages/ExploreMap/ExploreMap'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="/explore" element={<ExploreMap />} />
      </Routes>
    </BrowserRouter>
  )
}
