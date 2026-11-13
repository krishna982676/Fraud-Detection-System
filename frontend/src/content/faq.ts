export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_CONTENT: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How is the SentinelX machine learning model trained and updated?',
    answer:
      'The core model uses a 50-tree Random Forest with depth limiting. During initialization, it trains over 20,000 synthetic transaction records with class-balance resampling. As analysts review or dismiss live alerts in the console, feedback labels are stored in the database, allowing one-click continuous retraining without service interruption.',
  },
  {
    id: 'faq-2',
    question: 'What datasets and feature inputs are utilized for decision making?',
    answer:
      'The engine evaluates multi-dimensional vectors comprising: normalized transaction amount, user historical spending mean and standard deviation, merchant category codes, transaction hour, Haversine physical distance between consecutive transactions, 24-hour velocity counters, and international cross-border indicators.',
  },
  {
    id: 'faq-3',
    question: 'How does the hybrid scoring model prevent false positives?',
    answer:
      'Pure machine learning models can produce unexpected false positives on benign spending outliers. SentinelX blends 70% ML probability with 30% deterministic rule scores. If a high amount transaction matches the user’s historical baseline variance and occurs in their home city, the deterministic layer dampens the alert threshold.',
  },
  {
    id: 'faq-4',
    question: 'Can decision thresholds be adjusted for different risk appetites?',
    answer:
      'Yes. Through the Model Lab console, security teams can perform dynamic threshold sweeping. Sliding the decision threshold between 0.10 and 0.90 reveals real-time precision and recall curves, allowing teams to balance fraud loss avoidance against analyst triage queue capacity.',
  },
  {
    id: 'faq-5',
    question: 'How does impossible-travel velocity detection work?',
    answer:
      'When a user transacts, SentinelX retrieves the GPS coordinates and timestamp of their most recent prior transaction. It calculates the great-circle geodesic distance using the spherical Haversine formula and computes physical transit speed. If the required travel velocity exceeds 900 km/h (commercial jet speed), a high-severity alert is instantly triggered.',
  },
  {
    id: 'faq-6',
    question: 'How does SentinelX handle alert storms during high-frequency attacks?',
    answer:
      'SentinelX implements intelligent 5-minute deduplication windows. Repeated suspicious transactions from the same account are aggregated into a single open alert record, incrementing event counters and aggregating total exposed capital, keeping analyst queues clean and actionable.',
  },
];

