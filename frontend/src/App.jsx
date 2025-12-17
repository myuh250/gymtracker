import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import WorkoutPage from "./pages/WorkoutPage";
import AIChat from "./components/AIChat";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="workout" element={<WorkoutPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AIChat />
    </>
  );
}

export default App;
