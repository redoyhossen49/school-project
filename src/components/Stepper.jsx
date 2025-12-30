export default function Stepper({ activeStep = 0 }) {
  const steps = ["Register", "School", "Guardian", "Student"];
    const progress = (activeStep / (steps.length - 1)) * 100;

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="relative flex justify-between items-center">
        {/* background line */}
        <div className="absolute left-8 right-8 top-[24px] md:left-16 md:right-16 h-[2px] bg-gray-300 -translate-y-1/2"    />

 
        {steps.map((label, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;

          return (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center w-1/4"
            >
              {/* circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold hover:bg-sky-400 hover:scale-105 transition-all duration-300 
                ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-blue-600 text-white scale-110"
                      : "bg-gray-300 text-gray-600"
                  }`}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              {/* label */}
              <span
                className={`mt-2 text-xs font-medium
                ${
                    isActive
                      ? "text-blue-600"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
    
  );
}
