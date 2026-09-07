import { ReadinessQuestion, DynamicFlag } from '../types';

export const DYNAMIC_FLAGS_REGISTRY: Record<string, DynamicFlag> = {};

export const READINESS_QUESTIONS: ReadinessQuestion[] = [
  {
    id: 'q1_plan_date',
    question: 'When did the facts supporting your modification request occur?',
    statutoryBasis: 'Statutory Basis: RCW 26.09.260(1) Post-Decree Cutoff',
    explanation: 'Under Washington law, the court cannot reconsider facts that occurred prior to the entry of your current final parenting plan.',
    options: [
      {
        id: 'q1_after_decree',
        label: 'Strictly AFTER the current final parenting plan was signed by the judge',
        subtext: 'New facts that arose since the court entered the order',
        scoreImpact: 20
      },
      {
        id: 'q1_before_decree',
        label: 'Primarily issues that were already happening before the plan was entered',
        subtext: 'Subject to dismissal under res judicata / pre-decree cutoff',
        scoreImpact: -20,
        flagId: 'flag_pre_decree_facts'
      }
    ]
  },
  {
    id: 'q3_relief_scope',
    question: 'What specific change to the schedule are you requesting?',
    statutoryBasis: 'Statutory Basis: RCW 26.09.260(2) vs (5) Scope Routing',
    explanation: 'Washington distinguishes between major modifications (changing primary residential parent) and minor adjustments (under 24 days/year).',
    options: [
      {
        id: 'q3_minor_schedule',
        label: 'Minor adjustment: Shifting 24 or fewer days per year without changing primary parent',
        subtext: 'Fast-track statutory pathway under RCW 26.09.260(5)(a)',
        scoreImpact: 20
      },
      {
        id: 'q3_major_custody_switch',
        label: 'Major change: Switching the child’s primary home / majority residential custody',
        subtext: 'Requires satisfying restrictive RCW 26.09.260(2) gateway',
        scoreImpact: 10
      }
    ]
  }
];
