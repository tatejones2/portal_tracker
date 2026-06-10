import type { ReactNode } from 'react';

type Props = {
  label: string;
  value: ReactNode;
  detail?: string;
};

export const DashboardCard = ({ label, value, detail }: Props) => (
  <article className="metric-card">
    <span>{label}</span>
    <strong>{value}</strong>
    {detail ? <small>{detail}</small> : null}
  </article>
);
