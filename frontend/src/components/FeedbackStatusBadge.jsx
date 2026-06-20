const styles = {
  "New": "bg-sky-50 text-sky-700 ring-sky-200",
  "In Review": "bg-amber-50 text-amber-700 ring-amber-200",
  "Planned": "bg-violet-50 text-violet-700 ring-violet-200",
  "Resolved": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Closed": "bg-slate-100 text-slate-600 ring-slate-200"
};

export default function FeedbackStatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ring-1 ${styles[status] || styles.New}`}>{status}</span>;
}
