import React, { useState } from 'react';
import { AlertTriangle, Info, XCircle, ArrowLeft } from 'lucide-react';
import { READINESS_QUESTIONS, DYNAMIC_FLAGS_REGISTRY } from '../data/readinessQuestions';
import { getCountyName, getCountyInfo } from '../data/waCounties';
import type { DynamicFlag, ReadinessOption } from '../types';

interface Answer {
  questionId: string;
  option: ReadinessOption;
}

const FLAG_STYLE: Record<DynamicFlag['type'], { border: string; text: string; Icon: typeof Info }> = {
  error: { border: 'border-red-500/50', text: 'text-red-400', Icon: XCircle },
  warning: { border: 'border-yellow-500/50', text: 'text-yellow-400', Icon: AlertTriangle },
  info: { border: 'border-accent/40', text: 'text-accent', Icon: Info },
};

interface ReadinessCheckProps {
  onProceedToDeclaration?: () => void;
  selectedCounty?: string;
}

export const ReadinessCheck: React.FC<ReadinessCheckProps> = ({
  onProceedToDeclaration,
  selectedCounty = 'king',
}) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [finished, setFinished] = useState(false);

  const countyName = getCountyName(selectedCounty);
  const hasProfile = Boolean(getCountyInfo(selectedCounty));
  const currentQuestion = READINESS_QUESTIONS[answers.length];

  const select = (option: ReadinessOption) => {
    const next = [...answers, { questionId: currentQuestion.id, option }];
    setAnswers(next);
    if (next.length === READINESS_QUESTIONS.length) setFinished(true);
  };

  const back = () => {
    setFinished(false);
    setAnswers(answers.slice(0, -1));
  };

  const restart = () => {
    setAnswers([]);
    setFinished(false);
  };

  const flags = answers
    .map((a) => (a.option.flagId ? DYNAMIC_FLAGS_REGISTRY[a.option.flagId] : null))
    .filter((f): f is DynamicFlag => Boolean(f));

  const blocking = flags.filter((f) => f.type === 'error');
  const cautions = flags.filter((f) => f.type === 'warning');

  if (!finished && currentQuestion) {
    return (
      <div className="p-6 lg:p-10 max-w-4xl mx-auto font-inter text-white">
        <div className="font-mono text-xs uppercase text-accent mb-2">
          STEP {answers.length + 1} OF {READINESS_QUESTIONS.length} — {countyName}
        </div>
        <h2 className="text-3xl font-bold mb-3">{currentQuestion.question}</h2>
        <div className="font-mono text-[11px] uppercase text-ink-muted mb-2">{currentQuestion.statutoryBasis}</div>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">{currentQuestion.explanation}</p>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => select(option)}
              className="block w-full text-left bg-black/40 border border-slate-700 p-4 rounded hover:border-accent transition-colors cursor-pointer"
            >
              <div className="font-semibold">{option.label}</div>
              <div className="text-xs text-slate-400 mt-1">{option.subtext}</div>
            </button>
          ))}
        </div>

        {answers.length > 0 && (
          <button
            onClick={back}
            className="mt-6 font-mono text-[10px] uppercase text-ink-muted hover:text-accent flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto font-inter text-white space-y-6">
      <div>
        <div className="font-mono text-xs uppercase text-accent mb-2">Statutory checklist — {countyName}</div>
        <h2 className="text-3xl font-bold">What the statute asks, and what you told it</h2>
        <p className="text-slate-400 mt-3 leading-relaxed">
          This is a summary of your own answers against the elements named in RCW 26.09.260 and RCW 26.09.270.
          It is not an evaluation of your case, a prediction of what a commissioner will do, or advice about
          whether to file. Under GR 24 this tool cannot give you that, and it does not try to.
        </p>
      </div>

      <div className="border border-ink-faint bg-[#0d0d0e]">
        {answers.map((a) => {
          const q = READINESS_QUESTIONS.find((question) => question.id === a.questionId)!;
          return (
            <div key={a.questionId} className="p-4 border-b border-ink-faint last:border-b-0">
              <div className="font-mono text-[10px] uppercase text-ink-muted">{q.statutoryBasis}</div>
              <div className="text-sm text-white mt-1">{q.question}</div>
              <div className="text-sm text-accent mt-1">→ {a.option.label}</div>
            </div>
          );
        })}
      </div>

      {blocking.length > 0 || cautions.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-oswald text-lg uppercase tracking-wide text-white">Statutory elements to address</h3>
          {[...blocking, ...cautions, ...flags.filter((f) => f.type === 'info')].map((flag) => {
            const style = FLAG_STYLE[flag.type];
            return (
              <div key={flag.id} className={`border ${style.border} bg-[#111] p-4 flex gap-3`}>
                <style.Icon className={`w-4 h-4 shrink-0 mt-0.5 ${style.text}`} />
                <div>
                  <div className={`font-bold text-sm ${style.text}`}>{flag.title}</div>
                  <div className="font-mono text-[10px] text-ink-muted mt-0.5">{flag.statutoryRef}</div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{flag.description}</p>
                  {flag.remedy && (
                    <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                      <strong className="text-white">Next step:</strong> {flag.remedy}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-accent/40 bg-[#111] p-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Your answers did not raise any of the specific statutory gaps this checklist screens for. That is
            not a finding that adequate cause exists — only a judge or commissioner makes that finding, on the
            declarations actually filed.
          </p>
        </div>
      )}

      {!hasProfile && (
        <div className="border border-yellow-500/40 bg-[#111] p-4 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-xs text-ink-muted leading-relaxed">
            This build has no local rule data for {countyName}. Take filing deadlines and working-copy
            requirements from that county&apos;s own local rules.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-4 pt-2">
        <button
          onClick={() => onProceedToDeclaration?.()}
          className="bg-accent px-6 py-3 text-black font-bold text-sm cursor-pointer"
        >
          Draft My Declaration
        </button>
        <button
          onClick={restart}
          className="border border-ink-faint px-6 py-3 text-ink-muted hover:text-white font-mono text-xs uppercase cursor-pointer"
        >
          Start over
        </button>
      </div>

      <p className="text-[11px] text-ink-muted leading-relaxed border-t border-ink-faint pt-4">
        Your county&apos;s family law facilitator can review procedure with you at low or no cost, and cannot
        be replaced by this tool.
      </p>
    </div>
  );
};
