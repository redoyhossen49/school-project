export default function Stepper({ activeStep = 0 }) {
  const steps = ["Register", "School", "Guardian", "Student"];

  return (
    <div className="mb-6 w-full relative">
      {/* Background line */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300 z-0"></div>

      {/* Step circles */}
      <div className="relative flex justify-between w-full z-10">
        {steps.map((label, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;

          return (
            <div key={index} className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={` w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 hover:bg-blue-600
                ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-xs font-medium ${
                  isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
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
