import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

import { queryClient } from "./lib/queryClient";
import LandingPage from "./pages/Landing";
import Gallery from "./pages/Gallery";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import PageNotFound from "./pages/PageNotFound";
import PreviewPage from "./pages/Preview";
import GlobalStyles from "./styles/GlobalStyles";
import AppLayout from "./ui/AppLayout";
import ProtectedRoute from "./ui/ProtectedRoute";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Gallery />} />
          <Route path="/dashboard/:page" element={<Gallery />} />
          <Route path="/preview/*" element={<PreviewPage />} />
          <Route
            path="/gallery"
            element={<Navigate replace to="/dashboard" />}
          />

          {/* <Route path="/pricing" element={<Pricing />} /> */}
        </Route>
      </Route>

      {/* <Route path="/admin" element={<Admin />} /> */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />

      {/* <AuthProvider> */}
      {/* <TooltipProvider> */}
      {/* <ErrorToastProvider> */}
      {/* <PdfProcessingProvider> */}
      {/* <QuoteUploadProvider> */}
      {/* <OfflineIndicator /> */}
      <GlobalStyles />
      <BrowserRouter>
        {/* <ErrorBoundary section="Application"> */}
        <Router />
        {/* </ErrorBoundary> */}
      </BrowserRouter>
      {/* <PdfProcessingBanner /> */}
      {/* <GlobalQuoteUpload /> */}
      {/* <SupportButton /> */}
      {/* </QuoteUploadProvider> */}
      {/* </PdfProcessingProvider> */}
      {/* </ErrorToastProvider> */}
      {/* </TooltipProvider> */}
      {/* </AuthProvider> */}

      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
