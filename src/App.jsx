import { ToastContainer } from "react-toastify"
import AppRouter from "./routes/AppRouter"






function App() {
  return (
    <>
    <AppRouter/>
    <ToastContainer
    position="top-center"
       style={{ zIndex: 9999 }}/>
      
    </>
  )
}

export default App
