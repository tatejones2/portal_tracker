import type { ReactNode } from 'react';

type Props = {
  title: string;
  body: string;
  action?: ReactNode;
};

export const EmptyState = ({ title, body, action }: Props) => (
  <div className="empty-state">
    <div className="empty-mark" aria-hidden="true" />
    <h2>{title}</h2>
    <p>{body}</p>
    {action}
  </div>
);
