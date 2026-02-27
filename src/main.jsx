import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LandingPage from './LandingPage/LandingPage.jsx'
import SignUp from './SignUp/SignUp.jsx'
import Login from './Login/Login.jsx'

function App() {
  const [view, setView] = useState('landing')

  const getViewFromPath = (path) => {
    if (path === '/signup') return 'signup'
    if (path === '/login') return 'login'
    return 'landing'
  }

  useEffect(() => {
    setView(getViewFromPath(window.location.pathname))

    const handlePopState = () => {
      setView(getViewFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextView) => {
    setView(nextView)
    const path =
      nextView === 'signup' ? '/signup' : nextView === 'login' ? '/login' : '/'
    window.history.pushState({}, '', path)
  }

  if (view === 'signup') {
    return <SignUp onBack={() => navigate('landing')} />
  }

  if (view === 'login') {
    return (
      <Login
        onBack={() => navigate('landing')}
        onGoToSignUp={() => navigate('signup')}
      />
    )
  }

  return (
    <LandingPage
      onSignUp={() => navigate('signup')}
      onLogin={() => navigate('login')}
    />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
