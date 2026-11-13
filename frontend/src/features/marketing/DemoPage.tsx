import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { submitDemoRequest } from '../../api/demo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { BRAND } from '../../config/brand';

const demoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  businessEmail: z.string().email('Please enter a valid business email'),
  company: z.string().min(2, 'Company name is required'),
  interest: z.string().min(1, 'Please select your primary interest'),
  message: z.string().optional(),
});

type DemoFormData = z.infer<typeof demoSchema>;

const INTEREST_OPTIONS = [
  { label: 'Select your evaluation interest...', value: '' },
  { label: 'Real-Time Transaction Scoring', value: 'TRANSACTION_SCORING' },
  { label: 'Impossible Travel & Geodesic Velocity', value: 'IMPOSSIBLE_TRAVEL' },
  { label: 'Dynamic Behavioral Profiling', value: 'BEHAVIORAL_PROFILING' },
  { label: 'Custom Enterprise Integration & Rules', value: 'CUSTOM_RULES' },
];

export const DemoPage: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      interest: '',
    },
  });

  const onSubmit = async (data: DemoFormData) => {
    setServerError(null);
    try {
      await submitDemoRequest(data);
      setIsSuccess(true);
      toast.success('Demo request submitted successfully.');
      reset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit demo request.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <>
      <Helmet>
        <title>{BRAND.name} // Request Enterprise Security Demo</title>
        <meta
          name="description"
          content="Request a live interactive demonstration of SentinelX hybrid fraud scoring and impossible travel defense."
        />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Headline & Sample Scenario Card */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-mono mb-6 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Interactive Architecture Briefing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text-primary leading-tight mb-6">
              Fraud detection.{' '}
              <span className="bg-gradient-to-r from-accent via-accent-hover to-accent-teal bg-clip-text text-transparent">
                Explained.
              </span>{' '}
              In real time.
            </h1>

            <p className="text-base text-text-secondary leading-relaxed mb-8">
              Experience the SentinelX hybrid scoring engine on your transaction workloads. Speak directly with security engineers who build the models.
            </p>

            {/* Quote-style "Sample Scenario" Card */}
            <div className="w-full bg-surface-raised border border-border-strong rounded-xl p-6 relative">
              <div className="text-xs font-mono text-accent-teal uppercase tracking-widest mb-3 font-semibold">
                // Sample Incident Evaluation
              </div>
              <blockquote className="text-sm text-text-secondary italic leading-relaxed mb-4">
                "When an automated botnet launched distributed micro-charges across multiple European capitals, the impossible-travel rule and rolling standard deviation cut through the noise in 3.2 milliseconds."
              </blockquote>
              <div className="flex items-center justify-between text-xs font-mono text-text-secondary border-t border-border pt-3">
                <span>Autonomous Threat Mitigation</span>
                <span className="text-accent font-bold">&gt;99% Verified Precision</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Zero obligation, 30-minute technical evaluation walkthrough</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Synthetic adversarial dataset injection test included</span>
              </div>
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="lg:col-span-6 w-full">
            <div className="bg-surface border border-border rounded-2xl p-8 sm:p-10 shadow-2xl relative">
              {isSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent text-accent flex items-center justify-center mx-auto shadow-glow-green">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">Request Received</h3>
                  <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
                    Thank you. A security specialist has received your request and will provide access credentials within 1 business hour.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setIsSuccess(false)}>
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="border-b border-border pb-4 mb-2">
                    <h3 className="text-lg font-bold text-text-primary">Schedule Technical Briefing</h3>
                    <p className="text-sm text-text-secondary mt-0.5">
                      Enter your organizational details to test drive the live environment.
                    </p>
                  </div>

                  {serverError && (
                    <div className="p-3 rounded-lg bg-semantic-high/15 border border-semantic-high/40 text-semantic-high text-xs flex items-center gap-2 font-mono font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      placeholder="Jane"
                      error={errors.firstName?.message}
                      {...register('firstName')}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      error={errors.lastName?.message}
                      {...register('lastName')}
                    />
                  </div>

                  <Input
                    label="Business Email"
                    type="email"
                    placeholder="jane.doe@enterprise.com"
                    error={errors.businessEmail?.message}
                    {...register('businessEmail')}
                  />

                  <Input
                    label="Company Name"
                    placeholder="Acme Financial"
                    error={errors.company?.message}
                    {...register('company')}
                  />

                  <Select
                    label="Primary Evaluation Interest"
                    options={INTEREST_OPTIONS}
                    error={errors.interest?.message}
                    {...register('interest')}
                  />

                  <div>
                    <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-1.5 font-semibold">
                      Message / Custom Workload Details (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe your payment volume, current false positive rate, or integration requirements..."
                      className="w-full bg-surface-raised border border-border rounded-lg text-sm text-text-primary px-3 py-2 transition-all placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 hover:border-border-strong font-mono"
                      {...register('message')}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    className="w-full mt-2"
                  >
                    Submit Technical Request &rarr;
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
