import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

function HomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to BlogExpress</h1>
      <p className="mb-4">This is a test version of our blog system.</p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-white p-8">
        <h1 className="text-3xl font-bold text-center mb-8">BlogExpress</h1>
        <div className="max-w-4xl mx-auto">
          <HomePage />
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
