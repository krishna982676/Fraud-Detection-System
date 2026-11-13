import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, BrainCircuit, CheckCircle2, Download, FileUp, Loader2, UploadCloud } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { analyzeDataset, datasetExportUrl, uploadDataset, type DatasetProfile } from '../../api/datasets';
import { BRAND } from '../../config/brand';

export const DatasetIntelligencePage: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError('');
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are supported.');
      return;
    }
    setBusy(true);
    try { setProfile(await uploadDataset(file)); } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed'); } finally { setBusy(false); }
  };

  const analyze = async () => {
    if (!profile) return;
    setBusy(true);
    setError('');
    try { setProfile(await analyzeDataset(profile.datasetId)); } catch (e) { setError(e instanceof Error ? e.message : 'Analysis failed'); } finally { setBusy(false); }
  };

  const isComplete = profile?.status === 'COMPLETED';
  return (
    <>
      <Helmet><title>{BRAND.name} // Dataset Intelligence</title></Helmet>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest"><BrainCircuit className="w-4 h-4" /> Dataset Intelligence</div>
          <h1 className="text-2xl font-bold font-mono mt-2">Upload & detect fraud</h1>
          <p className="text-sm text-text-secondary mt-1">Upload any transaction CSV. SentinelX profiles the schema, maps common fields, and scores every row with the active detection engine.</p>
        </div>

        {!profile && (
          <Card className={`border-dashed text-center py-16 ${dragging ? 'border-accent bg-accent/5' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); void handleFile(e.dataTransfer.files[0]); }}>
            <UploadCloud className="mx-auto w-12 h-12 text-accent mb-4" />
            <h2 className="font-mono font-bold text-lg">Drop your CSV dataset here</h2>
            <p className="text-text-secondary text-sm mt-2">Maximum 25 MB · Headers are detected automatically</p>
            <Button className="mt-6" onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileUp className="w-4 h-4 mr-2" />} Browse CSV
            </Button>
            <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => void handleFile(e.target.files?.[0])} />
          </Card>
        )}

        {error && <div className="rounded-lg border border-semantic-high/50 bg-semantic-high/10 p-4 text-sm text-semantic-high flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}

        {profile && (
          <>
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><p className="text-xs text-text-secondary font-mono uppercase">Dataset loaded</p><h2 className="text-lg font-bold font-mono mt-1">{profile.name}</h2></div>
                <div className="flex gap-2">
                  {!isComplete && <Button onClick={() => void analyze()} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 mr-2" />} Analyse Dataset</Button>}
                  {isComplete && <a className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-xs font-mono hover:border-accent" href={datasetExportUrl(profile.datasetId)}><Download className="w-4 h-4 mr-2" /> Download CSV</a>}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                {[
                  ['Rows', profile.rows], ['Columns', profile.columns], ['Missing', profile.missingValues],
                  ['Duplicates', profile.duplicateRecords], ['Mode', profile.mode === 'SUPERVISED' ? 'Labelled' : 'Anomaly'],
                ].map(([label, value]) => <div key={label} className="bg-surface-raised rounded-lg p-3"><p className="text-[11px] text-text-secondary font-mono">{label}</p><p className="font-bold mt-1">{value}</p></div>)}
              </div>
            </Card>

            <Card>
              <h3 className="font-mono font-bold mb-3">Detected schema</h3>
              <div className="flex flex-wrap gap-2">{profile.columnNames.map((column) => <span key={column} className="px-2 py-1 rounded bg-surface-raised border border-border text-xs font-mono">{column}</span>)}</div>
              <p className="text-xs text-text-secondary mt-4">{profile.targetColumn ? `Label column detected: ${profile.targetColumn}.` : 'No fraud label detected. Results are anomaly scores, not confirmed fraud.'}</p>
            </Card>

            {isComplete && (
              <Card>
                <div className="flex items-center gap-2 mb-4"><CheckCircle2 className="w-5 h-5 text-accent" /><h3 className="font-mono font-bold">Analysis complete</h3></div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div><p className="text-xs text-text-secondary">High risk</p><p className="text-2xl font-bold text-semantic-high">{profile.suspicious}</p></div>
                  <div><p className="text-xs text-text-secondary">Review</p><p className="text-2xl font-bold text-semantic-medium">{profile.review}</p></div>
                  <div><p className="text-xs text-text-secondary">Normal</p><p className="text-2xl font-bold text-accent">{profile.normal}</p></div>
                </div>
                <div className="overflow-x-auto"><table className="w-full text-left text-xs font-mono"><thead><tr className="border-b border-border text-text-secondary"><th className="p-2">Transaction</th><th className="p-2">Amount</th><th className="p-2">Probability</th><th className="p-2">Risk</th><th className="p-2">Reasons</th></tr></thead><tbody>{profile.results?.slice(0, 100).map((row) => <tr key={row.transactionId} className="border-b border-border/50"><td className="p-2">{row.transactionId}</td><td className="p-2">{row.amount.toFixed(2)}</td><td className="p-2">{(row.fraudProbability * 100).toFixed(1)}%</td><td className={`p-2 ${row.riskLevel === 'HIGH' ? 'text-semantic-high' : row.riskLevel === 'MEDIUM' ? 'text-semantic-medium' : 'text-accent'}`}>{row.riskLevel}</td><td className="p-2 text-text-secondary">{row.reasons.join(' · ') || 'No elevated factors'}</td></tr>)}</tbody></table></div>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
};
