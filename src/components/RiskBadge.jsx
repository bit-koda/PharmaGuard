import { RISK_LABEL_COLORS } from '../constants';
import { AlertTriangle, CheckCircle, ShieldAlert, ShieldX, AlertOctagon, HeartPulse, Activity, CircleMinus } from 'lucide-react';

const LABEL_ICONS = {
  'Safe':                  CheckCircle,
  'Standard Dose':         CheckCircle,
  'Reduced Effect':        AlertTriangle,
  'Increased Effect':      AlertTriangle,
  'Moderate Sensitivity':  AlertTriangle,
  'Increased Risk':        AlertTriangle,
  'Moderate Toxicity Risk':AlertTriangle,
  'Adjust Dosage':         AlertTriangle,
  'Toxicity Risk':         AlertOctagon,
  'Reduced Efficacy':      ShieldX,
  'Bleeding Risk':         HeartPulse,
  'High Sensitivity':      ShieldAlert,
  'Myopathy Risk':         Activity,
  'Ineffective':           ShieldX,
  'Toxic':                 ShieldAlert,
  'Severe Toxicity Risk':  ShieldAlert,
  'Severe Toxicity':       ShieldAlert,
  'Unknown':               CircleMinus,
};

export default function RiskBadge({ level }) {
  const label = level || 'Unknown';
  const colors = RISK_LABEL_COLORS[label] || RISK_LABEL_COLORS['Unknown'];
  const Icon = LABEL_ICONS[label] || CircleMinus;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold
                  ${colors.bg} ${colors.text} ${colors.border} border`}
      role="status"
      aria-label={`Risk level: ${label}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
}
