export function SectionHeader({ eyebrow, title, description, align = 'left', className = '' }) {
  return (
    <div className={`section-header ${align === 'center' ? 'center' : ''} ${className}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
