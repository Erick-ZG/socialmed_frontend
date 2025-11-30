import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./components/AppShell";

import Home from "./pages/Home";
import MedCore from "./pages/MedCore";
import MedTools from "./pages/MedTools";
import Profile from "./pages/Profile";

import Onboarding from "./pages/Onboarding";
import MedMates from "./pages/MedMates";
import MedCoLab from "./pages/MedCoLab";
import StudyOrbit from "./pages/StudyOrbit";
import Reels from "./pages/Reels";

import useLocalStorageState from "./utils/useLocalStorageState";

type UserProfile = {
  handle: string;
  name: string;
  roleLine: string;
  locationLine: string;
  school: string;
  specialty: string;
  interests: string[];
  avatarUrl?: string;
  coverUrl?: string;
  about: string;
};

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const [user] = useLocalStorageState<UserProfile | null>("mv_user", null);
  const loc = useLocation();
  if (!user) return <Navigate to="/onboarding" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/medcore" element={<RequireOnboarding><MedCore /></RequireOnboarding>} />
        <Route path="/reels" element={<RequireOnboarding><Reels /></RequireOnboarding>} />
        <Route path="/medtools" element={<MedTools />} />

        <Route path="/medmates" element={<RequireOnboarding><MedMates /></RequireOnboarding>} />
        <Route path="/medcolab" element={<RequireOnboarding><MedCoLab /></RequireOnboarding>} />
        <Route path="/studyorbit" element={<RequireOnboarding><StudyOrbit /></RequireOnboarding>} />

        {/* perfiles */}
        <Route path="/profile/:handle" element={<Profile />} />
        <Route path="/profile" element={<Navigate to="/profile/me" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
