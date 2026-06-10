import type { RecruitingStatus } from '../types/school';

type Props = {
  status: RecruitingStatus;
};

export const StatusBadge = ({ status }: Props) => {
  const className = `status-badge status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  return <span className={className}>{status}</span>;
};
