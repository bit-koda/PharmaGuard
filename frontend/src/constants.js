/** Constants shared across the frontend */

export const SUPPORTED_DRUGS = [
  'CODEINE',
  'CLOPIDOGREL',
  'WARFARIN',
  'SIMVASTATIN',
  'AZATHIOPRINE',
  'CAPECITABINE',
  'FLUOROURACIL',
];

export const GENE_LIST = [
  'CYP2D6',
  'CYP2C19',
  'CYP2C9',
  'VKORC1',
  'SLCO1B1',
  'TPMT',
  'NUDT15',
  'DPYD',
];

export const DRUG_GENE_MAP = {
  CODEINE:      ['CYP2D6'],
  CLOPIDOGREL:  ['CYP2C19'],
  WARFARIN:     ['CYP2C9', 'VKORC1'],
  SIMVASTATIN:  ['SLCO1B1'],
  AZATHIOPRINE: ['TPMT', 'NUDT15'],
  CAPECITABINE: ['DPYD'],
  FLUOROURACIL: ['DPYD'],
};

export const METABOLIZER_TYPES = [
  'Poor Metabolizer',
  'Intermediate Metabolizer',
  'Normal Metabolizer',
  'Rapid Metabolizer',
  'Ultrarapid Metabolizer',
];

/** Map risk_label values from API to display colors */
const _green  = { bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-400',  border: 'border-green-300 dark:border-green-700',  hex: '#22c55e' };
const _amber  = { bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700 dark:text-amber-400',  border: 'border-amber-300 dark:border-amber-700',  hex: '#f59e0b' };
const _orange = { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700', hex: '#f97316' };
const _red    = { bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-700 dark:text-red-400',      border: 'border-red-300 dark:border-red-700',      hex: '#ef4444' };
const _gray   = { bg: 'bg-gray-100 dark:bg-gray-800',    text: 'text-gray-600 dark:text-gray-400',    border: 'border-gray-300 dark:border-gray-600',    hex: '#6b7280' };

export const RISK_LABEL_COLORS = {
  // Safe / standard
  'Safe':                  _green,
  'Standard Dose':         _green,
  // Moderate concern
  'Reduced Effect':        _amber,
  'Increased Effect':      _amber,
  'Moderate Sensitivity':  _amber,
  'Increased Risk':        _amber,
  'Moderate Toxicity Risk':_amber,
  'Adjust Dosage':         _amber,
  // High concern
  'Toxicity Risk':         _orange,
  'Reduced Efficacy':      _orange,
  'Bleeding Risk':         _orange,
  'High Sensitivity':      _red,
  'Myopathy Risk':         _red,
  'Ineffective':           _red,
  'Toxic':                 _red,
  'Severe Toxicity Risk':  _red,
  'Severe Toxicity':       _red,
  // Unknown
  'Unknown':               _gray,
};

/** Legacy severity-based mapping (fallback) */
export const RISK_COLORS = {
  HIGH:         { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300' },
  MODERATE:     { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  LOW:          { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  INFORMATIONAL:{ bg: 'bg-blue-100',  text: 'text-blue-700',  border: 'border-blue-300' },
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
