import { Calculator } from "lucide-react";
import { Display } from "@/components/base/Display";
import { Keypad } from "@/components/Keypad";
import { Toaster } from "@/components/ui/sonner";
import { useCalculator } from "@/hooks/use-calculator";

function App() {
  const calculator = useCalculator();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink bg-page-backdrop bg-size-[100%_100%,110px_110px,110px_110px] bg-position-[center_top] xs:p-6">
      <Toaster position="top-center" />
      <div className="flex min-h-dvh w-full flex-col xs:max-w-sm gap-5 bg-ink bg-panel-glow p-5 xs:min-h-0 xs:rounded-panel xs:p-6 xs:shadow-panel xs:ring-1 xs:ring-lavender/10">
        <header className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-cta">
            <Calculator aria-hidden="true" className="size-5" />
          </span>
          <h1 className="text-xl font-bold tracking-tight text-lavender">
            Calculator
          </h1>
        </header>

        <main className="flex flex-col gap-5">
          <Display
            expression={calculator.expression}
            value={calculator.value}
            announcement=""
          />
          <Keypad calculator={calculator} />
        </main>

        <footer className="mt-auto text-center text-xs text-lavender/50">
          Calculations are performed by the backend service.
        </footer>
      </div>
    </div>
  );
}

export default App;
