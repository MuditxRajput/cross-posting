import { CheckIcon } from 'lucide-react'

interface Step {
  id: number
  title: string
}

interface ProgressBarProps {
  steps: Step[]
  currentStep: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-[700px] max-w-3xl mx-auto mb-8">
      <div className="relative flex items-center justify-between">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white z-10 transition-all duration-300 ${
                index < currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : index === currentStep
                  ? 'border-primary text-primary'
                  : 'border-gray-300 text-gray-300'
              }`}
            >
              {index < currentStep ? (
                <CheckIcon className="w-6 h-6" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            <div
              className={`absolute top-12 text-sm whitespace-nowrap ${
                index <= currentStep ? 'text-primary font-medium' : 'text-gray-500'
              }`}
            >
              {step.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProgressBar

