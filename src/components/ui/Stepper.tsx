'use client';

interface Step {
  id: string;
  label: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  canNavigateToStep?: (index: number) => boolean;
}

export function Stepper({ steps, currentStepIndex, onStepClick, canNavigateToStep }: StepperProps) {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full rounded-full" />
        <div
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isClickable = canNavigateToStep ? canNavigateToStep(index) : false;

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={`
                flex flex-col items-center group relative
                ${isClickable ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              {/* Step Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-semibold transition-all duration-300
                  ${isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-110 shadow-lg shadow-indigo-200' : ''}
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400 border-2 border-gray-200' : ''}
                  ${isClickable && !isActive ? 'group-hover:border-indigo-300 group-hover:text-indigo-500' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center">
                <div
                  className={`
                    text-sm font-medium transition-colors duration-200
                    ${isActive ? 'text-indigo-600' : ''}
                    ${isCompleted ? 'text-green-600' : ''}
                    ${!isActive && !isCompleted ? 'text-gray-400' : ''}
                  `}
                >
                  {step.label}
                </div>
                <div
                  className={`
                    text-xs mt-0.5 hidden sm:block transition-colors duration-200
                    ${isActive ? 'text-indigo-400' : 'text-gray-400'}
                  `}
                >
                  {step.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
