import { ToastContainer } from "react-toastify"
import AppRouter from "./routes/AppRouter"
import { THEME_DARK, useTheme } from "./theme"






function App() {
  const { theme } = useTheme();
  return (
    <>
    <AppRouter/>
    <ToastContainer
    position="top-center"
       theme={theme === THEME_DARK ? "dark" : "light"}
       style={{ zIndex: 9999 }}/>
      
    </>
  )
}

export default App
