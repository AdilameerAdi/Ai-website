import AppRouter from "./router/AppRouter"
import { AuthProvider } from "./contexts/AuthContext"
import ErrorBoundary from "./components/ErrorBoundary"
import { ToastProvider } from "./components/Toast"
import "./styles/responsive.css"

export default function App(){
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}