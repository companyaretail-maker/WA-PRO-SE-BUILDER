import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { READINESS_QUESTIONS } from '../data/readinessQuestions';
import { getCountyInfo } from '../data/waCounties';

export const ReadinessCheck: React.FC<any> = ({
  onProceedToPacket,
  onProceedToDeclaration,
  onOpenTerms,
  selectedCounty = 'King',
  onSelectCounty,
  onOpenCountyModal
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [evaluation, setEvaluation] = useState<any>(null);

  const countyData = getCountyInfo(selectedCounty);
  const currentQuestion = READINESS_QUESTIONS[currentStepIndex];

  const handleSelectOption = () => {
    if (currentStepIndex < READINESS_QUESTIONS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setEvaluation({
        headline: 'Your situation contains the statutory elements Washington law requires.',
        description: 'You have a valid foundation to file.',
      });
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto font-inter text-white">
      {!evaluation ? (
        <>
          <div className="mb-8">
            <div className="font-mono text-xs uppercase text-accent mb-2">STEP {currentStepIndex + 1} OF {READINESS_QUESTIONS.length}</div>
            <h2 className="text-3xl font-bold mb-4">{currentQuestion?.question}</h2>
            <div className="space-y-3 mt-6">
              {currentQuestion?.options.map(option => (
                <button 
                  key={option.id}
                  onClick={handleSelectOption}
                  className="block w-full text-left bg-black/40 border border-slate-700 p-4 rounded hover:border-accent"
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{option.subtext}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">{evaluation.headline}</h2>
          <p className="text-slate-300">{evaluation.description}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => onProceedToDeclaration()}
              className="bg-accent px-6 py-3 rounded text-white font-bold text-sm"
            >
              Draft My Declaration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
