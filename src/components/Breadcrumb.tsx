import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  items: { label: string; to?: string }[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => (
  <nav className="breadcrumb" aria-label="Breadcrumb">
    {items.map((item, i) => (
      <span key={i}>
        {item.to ? <Link to={item.to}>{item.label}</Link> : item.label}
        {i < items.length - 1 && ' > '}
      </span>
    ))}
  </nav>
);

export default Breadcrumb;
