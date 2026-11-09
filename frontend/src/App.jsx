import { BrowserRouter, Routes, Route } from "react-router-dom";
import SweetyLandingPage from "./pages/SweetyLandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SweetyLandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;