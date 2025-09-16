import clsx from 'clsx';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return {
          colors: 'bg-warning-100 text-warning-800 border-warning-200',
          label: 'Submitted'
        };
      case 'triaged':
        return {
          colors: 'bg-primary-100 text-primary-800 border-primary-200',
          label: 'Triaged'
        };
      case 'assigned':
        return {
          colors: 'bg-secondary-100 text-secondary-800 border-secondary-200',
          label: 'Assigned'
        };
      case 'in_progress':
        return {
          colors: 'bg-primary-100 text-primary-800 border-primary-200',
          label: 'In Progress'
        };
      case 'resolved':
        return {
          colors: 'bg-success-100 text-success-800 border-success-200',
          label: 'Resolved'
        };
      case 'closed':
        return {
          colors: 'bg-secondary-100 text-secondary-800 border-secondary-200',
          label: 'Closed'
        };
      case 'duplicate':
        return {
          colors: 'bg-warning-100 text-warning-800 border-warning-200',
          label: 'Duplicate'
        };
      case 'rejected':
        return {
          colors: 'bg-danger-100 text-danger-800 border-danger-200',
          label: 'Rejected'
        };
      default:
        return {
          colors: 'bg-secondary-100 text-secondary-800 border-secondary-200',
          label: status
        };
    }
  };

  const { colors, label } = getStatusConfig(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium border',
        colors,
        sizeClasses[size]
      )}
    >
      {label}
    </span>
  );
}