import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Seo from "./components/Seo";
import Chat from "./pages/Chat";
import Home, { GuestHome } from "./pages/Home";
import Login from "./pages/Login";
import ProjectView from "./pages/ProjectView";
import Signup from "./pages/Signup";
import { useAuthContext } from "./hooks/useAuthContext";

function App() {
  const { user } = useAuthContext();

  return (
    <div className="app bg-neutral-950 text-neutral-100 min-h-screen">
      <Seo />
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Home /> : <GuestHome />} />
        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/projects" element={user ? <ProjectView /> : <Navigate to="/login" />} />
        <Route path="/projects/:projectId" element={user ? <ProjectView /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
