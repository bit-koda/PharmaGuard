import { Gauge } from 'lucide-react';
import { RISK_LABEL_COLORS } from '../constants';

function worstLabel(labels) {
  const priority = [
    'Severe Toxicity', 'Severe Toxicity Risk', 'Toxic',
    'Myopathy Risk', 'High Sensitivity', 'Bleeding Risk',
    'Reduced Efficacy', 'Ineffective', 'Toxicity Risk',
    'Moderate Toxicity Risk', 'Increased Risk', 'Moderate Sensitivity',
    'Increased Effect', 'Reduced Effect', 'Adjust Dosage',
    'Unknown', 'Standard Dose', 'Safe',
  ];
  for (const p of priority) if (labels.includes(p)) return p;
  return 'Unknown';
}

export default function CompatibilityScore({ result }) {
  // Handle array (multi-drug) or single object
  const isArray = Array.isArray(result);
  const drugs = isArray ? result : [result].filter(Boolean);
  
  const risk = drugs.length > 0
    ? worstLabel(drugs.map(r => r['risk assessment']?.['risk label'] || 'Unknown'))
    : 'Unknown';
  
  const drugsAnalyzed = drugs.length;

  const scoreMap = {
    Safe: 95, 'Standard Dose': 95,
    'Reduced Effect': 65, 'Increased Effect': 65, 'Moderate Sensitivity': 60, 'Increased Risk': 55, 'Moderate Toxicity Risk': 50, 'Adjust Dosage': 60,
    'Toxicity Risk': 35, 'Reduced Efficacy': 30, 'Bleeding Risk': 30,
    'High Sensitivity': 20, 'Myopathy Risk': 20, Ineffective: 20, Toxic: 15, 'Severe Toxicity Risk': 10, 'Severe Toxicity': 10,
    Unknown: 50,
  };
  const score = scoreMap[risk] ?? 50;

  const _green = 'text-green-500', _amber = 'text-amber-500', _orange = 'text-orange-500', _red = 'text-red-500', _gray = 'text-gray-400';
  const ringColorMap = {
    Safe: _green, 'Standard Dose': _green,
    'Reduced Effect': _amber, 'Increased Effect': _amber, 'Moderate Sensitivity': _amber, 'Increased Risk': _amber, 'Moderate Toxicity Risk': _amber, 'Adjust Dosage': _amber,
    'Toxicity Risk': _orange, 'Reduced Efficacy': _orange, 'Bleeding Risk': _orange,
    'High Sensitivity': _red, 'Myopathy Risk': _red, Ineffective: _red, Toxic: _red, 'Severe Toxicity Risk': _red, 'Severe Toxicity': _red,
    Unknown: _gray,
  };
  const ringColor = ringColorMap[risk] || _gray;

  const circumference = 2 * Math.PI * 54; // radius = 54
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 p-6 sm:p-8 rounded-2xl glass-card">
      <h2 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
      </h2>

      {/* SVG ring */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="currentColor"
            className={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{score}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
        </div>
      </div>

      {/* Stats */}
      <div className="w-full text-center">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{drugsAnalyzed}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Drugs Analyzed</p>
        </div>
      </div>
    </div>
  );
}
