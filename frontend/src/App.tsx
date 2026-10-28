import { Display } from "@/components/base/Display";
import { Keypad } from "@/components/Keypad";
import { Toaster } from "@/components/ui/sonner";
import { useCalculator } from "@/hooks/use-calculator";

function App() {
  const calculator = useCalculator();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-100">
      <Toaster position="top-center" />
      <div className="flex min-h-dvh w-full max-w-sm flex-col gap-4 bg-neutral-50 p-4 sm:min-h-0 sm:rounded-2xl sm:shadow-lg">
        <header>
          <h1 className="text-lg font-semibold">Calculator</h1>
        </header>

        <main className="flex flex-col gap-4">
          <Display
            expression={calculator.expression}
            value={calculator.value}
            announcement=""
          />
          <Keypad calculator={calculator} />
        </main>

        <footer className="mt-auto text-center text-xs text-neutral-500">
          Calculations are performed by the backend service.
        </footer>
      </div>
    </div>
  );
}

export default App;
