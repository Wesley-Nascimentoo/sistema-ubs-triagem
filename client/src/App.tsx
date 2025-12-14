import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import PatientLogin from "./pages/PatientLogin";
import StaffLogin from "./pages/StaffLogin";
import PatientSymptoms from "./pages/PatientSymptoms";
import PatientQuestionnaire from "./pages/PatientQuestionnaire";
import PatientSuccess from "./pages/PatientSuccess";
import NoSlots from "./pages/NoSlots";
import NursePanel from "./pages/NursePanel";
import DoctorPanel from "./pages/DoctorPanel";
import QueuesDisplay from "./pages/QueuesDisplay";
import ManagerDashboard from "./pages/ManagerDashboard";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={PatientLogin} />
      <Route path="/patient/symptoms" component={PatientSymptoms} />
      <Route path="/patient/questionnaire" component={PatientQuestionnaire} />
      <Route path="/patient/success" component={PatientSuccess} />
      <Route path="/no-slots" component={NoSlots} />
      <Route path="/staff/login" component={StaffLogin} />
      <Route path="/nurse/panel" component={NursePanel} />
      <Route path="/doctor/panel" component={DoctorPanel} />
      <Route path="/queues" component={QueuesDisplay} />
      <Route path="/manager/dashboard" component={ManagerDashboard} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
