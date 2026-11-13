import React from 'react';

interface ConfusionMatrixProps {
  matrix?: number[][];
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ matrix }) => {
  // Default benchmark numbers if loading/empty
  // [Actual Legitimate, Actual Fraud] vs [Classified Legit, Classified Fraud]
  const data = matrix && matrix.length === 2 ? matrix : [
    [19544, 56],
    [60, 340],
  ];

  const tn = data[0][0]; // True Negatives (Legit classified Legit)
  const fp = data[0][1]; // False Positives (Legit classified Fraud)
  const fn = data[1][0]; // False Negatives (Fraud classified Legit)
  const tp = data[1][1]; // True Positives (Fraud classified Fraud)

  return (
    <div className="bg-surface border border-border rounded-xl p-5 select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <span className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">
          CONFUSION MATRIX HEATMAP (10-FOLD CV)
        </span>
        <span className="text-xs font-mono text-accent bg-accent/10 px-2.5 py-0.5 rounded border border-accent/40 font-semibold">
          RandomForest (50 Trees)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        {/* Header Row */}
        <div className="p-2 text-text-secondary font-semibold text-xs flex items-center justify-center">
          ACTUAL \ PRED
        </div>
        <div className="p-2 text-center text-text-secondary font-bold text-xs bg-surface-raised rounded border border-border">
          PRED: LEGIT
        </div>
        <div className="p-2 text-center text-text-secondary font-bold text-xs bg-surface-raised rounded border border-border">
          PRED: FRAUD
        </div>

        {/* Row 1: Actual Legit */}
        <div className="p-2 text-text-secondary font-bold text-xs bg-surface-raised rounded border border-border flex items-center">
          ACTUAL: LEGIT
        </div>
        <div className="p-4 rounded-lg bg-accent/15 border border-accent/40 text-center flex flex-col justify-center">
          <span className="text-xl font-bold text-accent tabular-nums">
            {tn.toLocaleString()}
          </span>
          <span className="text-xs text-text-secondary font-medium mt-0.5">True Negative (99.7%)</span>
        </div>
        <div className="p-4 rounded-lg bg-semantic-medium/15 border border-semantic-medium/40 text-center flex flex-col justify-center">
          <span className="text-xl font-bold text-semantic-medium tabular-nums">
            {fp.toLocaleString()}
          </span>
          <span className="text-xs text-text-secondary font-medium mt-0.5">False Positive (0.3%)</span>
        </div>

        {/* Row 2: Actual Fraud */}
        <div className="p-2 text-text-secondary font-bold text-xs bg-surface-raised rounded border border-border flex items-center">
          ACTUAL: FRAUD
        </div>
        <div className="p-4 rounded-lg bg-semantic-high/15 border border-semantic-high/40 text-center flex flex-col justify-center">
          <span className="text-xl font-bold text-semantic-high tabular-nums">
            {fn.toLocaleString()}
          </span>
          <span className="text-xs text-text-secondary font-medium mt-0.5">False Negative (15.0%)</span>
        </div>
        <div className="p-4 rounded-lg bg-accent/15 border border-accent/40 text-center flex flex-col justify-center">
          <span className="text-xl font-bold text-accent tabular-nums">
            {tp.toLocaleString()}
          </span>
          <span className="text-xs text-text-secondary font-medium mt-0.5">True Positive (85.0%)</span>
        </div>
      </div>
    </div>
  );
};
