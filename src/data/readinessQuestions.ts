import { ReadinessQuestion, DynamicFlag } from '../types';

export const DYNAMIC_FLAGS_REGISTRY: Record<string, DynamicFlag> = {
  flag_pre_decree_facts: {
    id: 'flag_pre_decree_facts',
    type: 'warning',
    title: 'Facts predating the current plan',
    description:
      'RCW 26.09.260(1) lets the court act on facts that arose since the prior decree or plan, OR on facts that were unknown to the court at the time it was entered. Facts that were already before the court are outside that window.',
    statutoryRef: 'RCW 26.09.260(1)',
    remedy:
      'If some of your facts were genuinely unknown to the court when the plan was entered, say so expressly and explain why they were unknown.',
  },
  flag_movant_circumstances: {
    id: 'flag_movant_circumstances',
    type: 'warning',
    title: 'Change is in the moving party’s circumstances',
    description:
      'RCW 26.09.260(1) requires a substantial change in the circumstances of the child or the NON-moving party. A change in the circumstances of the person asking for the modification does not, by itself, satisfy that element.',
    statutoryRef: 'RCW 26.09.260(1)',
    remedy:
      'Identify what changed for the child or for the other parent, separately from what changed for you.',
  },
  flag_major_gateway: {
    id: 'flag_major_gateway',
    type: 'info',
    title: 'Major modification gateway applies',
    description:
      'Changing the child’s primary residence is governed by the restrictive grounds in RCW 26.09.260(2) — agreement of the parties, integration into the moving party’s family with the other parent’s consent, present environment detrimental with the harm of change outweighed by its advantage, or the contempt/violation grounds in RCW 26.09.260(2)(d).',
    statutoryRef: 'RCW 26.09.260(2)',
    remedy: 'Read RCW 26.09.260(2) and identify which subsection you are proceeding under.',
  },
  flag_no_affidavit: {
    id: 'flag_no_affidavit',
    type: 'error',
    title: 'Adequate cause affidavit required',
    description:
      'RCW 26.09.270 requires the motion to be supported by an affidavit or declaration setting out the facts. The court denies the motion without a hearing unless it finds adequate cause from those affidavits.',
    statutoryRef: 'RCW 26.09.270',
    remedy: 'Complete the Fact Engine module and file a declaration with your motion.',
  },
};

export const READINESS_QUESTIONS: ReadinessQuestion[] = [
  {
    id: 'q1_plan_date',
    question: 'When did the facts supporting your modification request occur?',
    statutoryBasis: 'Statutory Basis: RCW 26.09.260(1)',
    explanation:
      'RCW 26.09.260(1) lets the court act on facts that arose since the prior decree or plan was entered, or on facts that existed then but were unknown to the court.',
    options: [
      {
        id: 'q1_after_decree',
        label: 'After the current final parenting plan was entered',
        subtext: 'Facts that arose since the court entered the order',
        scoreImpact: 20,
      },
      {
        id: 'q1_unknown_to_court',
        label: 'Before the plan was entered, but the court did not know about them',
        subtext: 'RCW 26.09.260(1) also reaches facts that were unknown to the court at the time',
        scoreImpact: 10,
      },
      {
        id: 'q1_before_decree',
        label: 'Before the plan was entered, and the court already knew about them',
        subtext: 'Outside the statutory window in RCW 26.09.260(1)',
        scoreImpact: -20,
        flagId: 'flag_pre_decree_facts',
      },
    ],
  },
  {
    id: 'q2_whose_circumstances',
    question: 'Whose circumstances changed substantially?',
    statutoryBasis: 'Statutory Basis: RCW 26.09.260(1)',
    explanation:
      'The statute names a substantial change in the circumstances of the child or the non-moving party. A change limited to the moving party is not the element the statute describes.',
    options: [
      {
        id: 'q2_child',
        label: 'The child’s circumstances',
        subtext: 'Squarely within RCW 26.09.260(1)',
        scoreImpact: 20,
      },
      {
        id: 'q2_other_parent',
        label: 'The other parent’s (non-moving party’s) circumstances',
        subtext: 'Squarely within RCW 26.09.260(1)',
        scoreImpact: 20,
      },
      {
        id: 'q2_movant',
        label: 'Mainly my own circumstances',
        subtext: 'Does not by itself meet the element in RCW 26.09.260(1)',
        scoreImpact: -15,
        flagId: 'flag_movant_circumstances',
      },
    ],
  },
  {
    id: 'q3_relief_scope',
    question: 'What specific change to the schedule are you requesting?',
    statutoryBasis: 'Statutory Basis: RCW 26.09.260(2) vs (5)',
    explanation:
      'Washington distinguishes major modifications, which change the child’s primary residence, from minor modifications, which under RCW 26.09.260(5)(a) do not exceed 24 full days in a calendar year.',
    options: [
      {
        id: 'q3_minor_schedule',
        label: 'Minor adjustment: 24 or fewer full days per year, primary residence unchanged',
        subtext: 'RCW 26.09.260(5)(a) pathway',
        scoreImpact: 20,
      },
      {
        id: 'q3_major_custody_switch',
        label: 'Major change: switching the child’s primary residence',
        subtext: 'Must fit one of the grounds in RCW 26.09.260(2)',
        scoreImpact: 10,
        flagId: 'flag_major_gateway',
      },
    ],
  },
  {
    id: 'q4_declaration',
    question: 'Do you have a written declaration setting out these facts?',
    statutoryBasis: 'Statutory Basis: RCW 26.09.270',
    explanation:
      'RCW 26.09.270 requires the motion to be supported by affidavit. The court denies the motion without a hearing unless the affidavits establish adequate cause.',
    options: [
      {
        id: 'q4_yes',
        label: 'Yes, or I am about to draft one',
        subtext: 'Required by RCW 26.09.270',
        scoreImpact: 15,
      },
      {
        id: 'q4_no',
        label: 'No',
        subtext: 'The motion cannot proceed without it',
        scoreImpact: -25,
        flagId: 'flag_no_affidavit',
      },
    ],
  },
];
