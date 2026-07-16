import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Users, Star, Flame, Heart, Award } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

// ─── HELPER DATA DISPLAY ──────────────────────────────────────────────────────
const PRIORITY_ORDER = [
  'Signature', 'Most booked', 'Client favorite', 'Best seller',
  'Recommended', 'New experience'
];

const getPriorityTag = (product) => {
  const tags = Array.isArray(product.priorityTags) ? product.priorityTags : [];
  for (const t of PRIORITY_ORDER) {
    if (tags.includes(t)) return t;
  }
  return tags[0] || null;
};

const getCategoryTag = (product) => product.category || "";

const getBookingTags = (product) => {
  return Array.isArray(product.bookingTags) ? product.bookingTags.slice(0, 2) : [];
};

const getImage = (product) => {
  if (product.image) return product.image;
  if (Array.isArray(product.gallery) && product.gallery.length > 0) return product.gallery[0];
  return null;
};

const getDescription = (product) => product.shortDescription || product.description || "";

const getPrice = (product) => {
  if (product.priceLabel) return product.priceLabel;
  if (product.price) return product.price;
  return "Contact for pricing";
};

const getMetaItems = (product) => {
  return [
    product.duration ? { icon: Clock, text: product.duration } : null,
    product.groupSize ? { icon: Users, text: product.groupSize } : null,
    product.location ? { icon: MapPin, text: product.location } : null
  ].filter(Boolean);
};

// ─── TAG COMPONENTS ──────────────────────────────────────────────────────────
function PriorityIcon({ tag }) {
  if (!tag) return null;
  const t = tag.toLowerCase();
  if (t.includes('signature')) return <Star size={12} fill="currentColor" />;
  if (t.includes('booked') || t.includes('hot')) return <Flame size={12} fill="currentColor" />;
  if (t.includes('favorite')) return <Heart size={12} fill="currentColor" />;
  if (t.includes('seller')) return <Award size={12} />;
  return null;
}

function PriorityTag({ tag }) {
  if (!tag) return null;
  return (
    <span className="featured-tag featured-tag--priority">
      <PriorityIcon tag={tag} />
      {tag}
    </span>
  );
}

function CategoryTag({ tag }) {
  if (!tag) return null;
  return <span className="featured-tag featured-tag--category">{tag}</span>;
}

function BookingTag({ tag }) {
  if (!tag) return null;
  return <span className="featured-tag featured-tag--booking">{tag}</span>;
}

// ─── IMAGE WRAPPER WITH FALLBACK ─────────────────────────────────────────────
function ImageWrap({ src, alt, className }) {
  if (!src) {
    return (
      <div className={`${className} featured-workshop-image fallback-image`}>
        <span>Workshop image</span>
      </div>
    );
  }
  return <img src={src} alt={alt || 'Workshop'} className={`${className} featured-workshop-image`} loading="lazy" />;
}

// ─── HERO CARD (Card 1) ──────────────────────────────────────────────────────
function HeroCard({ product }) {
  const pTag = getPriorityTag(product);
  const cTag = getCategoryTag(product);
  const bTags = getBookingTags(product);
  const img = getImage(product);
  const desc = getDescription(product);
  const price = getPrice(product);
  const meta = getMetaItems(product);

  return (
    <Link to={`/services/${product.slug}`} className="featured-workshop-card featured-workshop-card--hero">
      <div className="featured-workshop-imageWrap" style={{ height: '100%' }}>
        <ImageWrap src={img} alt={product.title} />
        <div className="hero-overlay" />
      </div>

      <div className="featured-hero-content">
        {/* Tags */}
        <div className="featured-tags-row">
          {pTag && <PriorityTag tag={pTag} />}
          {cTag && <CategoryTag tag={cTag} />}
          {bTags.map((bt, i) => <BookingTag key={i} tag={bt} />)}
        </div>

        {/* Text */}
        <h2 className="featured-hero-title line-clamp-2">{product.title}</h2>
        {desc && <p className="featured-hero-desc line-clamp-2">{desc}</p>}

        {/* Meta */}
        {meta.length > 0 && (
          <div className="featured-hero-meta">
            {meta.map((m, i) => (
              <span key={i} className="featured-meta-item line-clamp-1">
                <m.icon size={14} strokeWidth={2.5} />
                {m.text}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="featured-hero-footer">
          <div className="featured-price">
            {!price.toLowerCase().includes('from') && !price.toLowerCase().includes('contact') && <span className="featured-price-label">From</span>}
            <span className="featured-price-value">{price}</span>
          </div>
          <span className="featured-cta-btn">
            Explore workshop <ArrowRight size={16} className="featured-cta-arrow" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── MEDIUM CARD (Card 2) ────────────────────────────────────────────────────
function MediumCard({ product }) {
  const pTag = getPriorityTag(product);
  const cTag = getCategoryTag(product);
  const img = getImage(product);
  const price = getPrice(product);
  const duration = product.duration || product.location;

  const displayTag = pTag || cTag;

  return (
    <Link to={`/services/${product.slug}`} className="featured-workshop-card featured-workshop-card--medium">
      <div className="featured-workshop-imageWrap featured-medium-img">
        <ImageWrap src={img} alt={product.title} />
        {displayTag && (
          <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
            {pTag ? <PriorityTag tag={pTag} /> : <CategoryTag tag={cTag} />}
          </div>
        )}
      </div>

      <div className="featured-medium-content">
        <h3 className="featured-medium-title line-clamp-2">{product.title}</h3>

        <div className="featured-medium-footer">
          {duration && (
            <span className="featured-meta-item dark">
              <Clock size={14} strokeWidth={2.5} />
              <span className="line-clamp-1">{duration}</span>
            </span>
          )}
          <div className="featured-medium-bottom">
            <span className="featured-price-value dark">{price}</span>
            <div className="featured-icon-circle">
              <ArrowRight size={15} className="featured-cta-arrow" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── COMPACT CARD (Card 3 & 4) ───────────────────────────────────────────────
function CompactCard({ product }) {
  const img = getImage(product);
  const price = getPrice(product);
  const pTag = getPriorityTag(product);
  const cTag = getCategoryTag(product);

  const displayTag = pTag || cTag;

  return (
    <Link to={`/services/${product.slug}`} className="featured-workshop-card featured-workshop-card--compact">
      <div className="featured-workshop-imageWrap featured-compact-img">
        <ImageWrap src={img} alt={product.title} />
        {displayTag && (
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
            {pTag ? <PriorityTag tag={pTag} /> : <CategoryTag tag={cTag} />}
          </div>
        )}
      </div>

      <div className="featured-compact-content">
        <h4 className="featured-compact-title line-clamp-2">{product.title}</h4>

        <div className="featured-compact-footer">
          <span className="featured-price-value dark small">{price}</span>
          <ArrowRight size={16} className="featured-cta-arrow dark" />
        </div>
      </div>
    </Link>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
function EmptyState({ isAdmin }) {
  return (
    <div style={{
      textAlign: 'center', padding: '80px 24px',
      background: 'rgba(255,255,255,0.7)', borderRadius: 32,
      border: '1px dashed #cbd5e1',
    }}>
      <p style={{ fontSize: 18, color: '#334155', fontWeight: 600, marginBottom: 8 }}>
        Featured workshops are coming soon.
      </p>
      {isAdmin && (
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Go to <Link to="/admin/services" style={{ color: '#0f172a', fontWeight: 600 }}>Admin → Products</Link> and mark products as Featured.
        </p>
      )}
    </div>
  );
}

// ─── MAIN SECTION ────────────────────────────────────────────────────────────
export default function FeaturedWorkshopsSection({ products = [], title, description, isAdmin = false }) {
  const items = products.filter(p => p.featured && p.active).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).slice(0, 4);
  const hero = items[0] || null;
  const medium = items[1] || null;
  const compacts = items.slice(2, 4);

  return (
    <>
      <style>{`
        /* ── SECTION BĂ CẢNH ── */
        .featured-workshops {
          padding: 96px 0;
          background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
        }
        .featured-workshops__container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ── UTILITIES ── */
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── HEADER ── */
        .featured-workshops__header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .featured-eyebrow {
          display: inline-block;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9a3412;
          margin-bottom: 12px;
        }
        .featured-title {
          font-size: clamp(32px, 4vw, 44px);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 12px;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .featured-desc {
          font-size: 16px;
          color: #475569;
          margin: 0;
          max-width: 620px;
          line-height: 1.6;
        }
        .featured-view-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          text-decoration: none;
          padding: 12px 24px;
          border: 1px solid #cbd5e1;
          border-radius: 999px;
          transition: all 0.2s ease;
          background: #fff;
          white-space: nowrap;
        }
        .featured-view-all:hover {
          border-color: #0f172a;
          background: #0f172a;
          color: #fff;
        }
        .featured-view-all:hover .featured-cta-arrow {
          transform: translateX(4px);
        }

        /* ── LAYOUT MOSAIC GRID ── */
        .featured-showcase-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
          gap: 24px;
          align-items: stretch;
        }
        .featured-showcase-side {
          display: grid;
          grid-template-rows: 1fr 0.82fr;
          gap: 24px;
        }
        .featured-showcase-smallGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: 1fr;
          gap: 24px;
        }

        /* ── SHARED CARD & IMAGE STYLES ── */
        .featured-workshop-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          background: #fff;
          border-radius: 28px;
          position: relative;
          transition: transform 300ms ease, box-shadow 300ms ease;
          height: 100%;
        }
        .featured-workshop-imageWrap {
          position: relative;
          overflow: hidden;
          border-radius: inherit;
          background: linear-gradient(135deg, #f7eadc, #fdf8f1);
          flex-shrink: 0;
        }
        .featured-workshop-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 300ms ease;
        }
        .fallback-image {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
        }
        .featured-workshop-card:hover {
          transform: translateY(-4px);
        }
        .featured-workshop-card:hover .featured-workshop-image {
          transform: scale(1.04);
        }
        .featured-cta-arrow {
          transition: transform 300ms ease;
        }
        .featured-workshop-card:hover .featured-cta-arrow {
          transform: translateX(4px);
        }

        /* ── TAGS ── */
        .featured-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .featured-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.2;
          white-space: nowrap;
          backdrop-filter: blur(4px);
        }
        .featured-tag--priority {
          background: rgba(255, 255, 255, 0.95);
          color: #92400e;
        }
        .featured-tag--category {
          background: rgba(15, 23, 42, 0.65);
          color: #fff;
        }
        .featured-tag--booking {
          background: rgba(255, 247, 237, 0.9);
          color: #9a3412;
        }
        .featured-medium-img .featured-tag--category,
        .featured-compact-img .featured-tag--category {
          background: rgba(255,255,255,0.9);
          color: #334155;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        /* ── HERO CARD (Card 1) ── */
        .featured-workshop-card--hero {
          min-height: 520px;
          border-radius: 32px;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
          justify-content: flex-end;
          border: none;
        }
        .featured-workshop-card--hero:hover {
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.72) 100%);
          pointer-events: none;
        }
        .featured-hero-content {
          position: absolute;
          left: 32px;
          right: 32px;
          bottom: 32px;
          color: white;
          z-index: 10;
        }
        .featured-hero-title {
          font-size: clamp(28px, 3.5vw, 36px);
          font-weight: 800;
          color: #fff;
          margin: 0 0 12px;
          line-height: 1.2;
          text-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .featured-hero-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.9);
          margin: 0 0 20px;
          line-height: 1.6;
          max-width: 85%;
        }
        .featured-hero-meta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .featured-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.9);
        }
        .featured-meta-item.dark {
          color: #64748b;
        }
        .featured-hero-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.25);
          gap: 16px;
          flex-wrap: wrap;
        }
        .featured-price {
          display: flex;
          flex-direction: column;
        }
        .featured-price-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255,255,255,0.7);
          margin-bottom: 2px;
        }
        .featured-price-value {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
        }
        .featured-price-value.dark {
          color: #0f172a;
          font-size: 18px;
        }
        .featured-price-value.small {
          font-size: 16px;
        }
        .featured-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.4);
          padding: 10px 20px;
          border-radius: 999px;
          backdrop-filter: blur(8px);
          transition: background 300ms ease;
        }
        .featured-workshop-card--hero:hover .featured-cta-btn {
          background: rgba(255,255,255,0.3);
        }

        /* ── MEDIUM CARD (Card 2) ── */
        .featured-workshop-card--medium {
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border-radius: 28px;
        }
        .featured-workshop-card--medium:hover {
          border-color: #cbd5e1;
          box-shadow: 0 12px 30px rgba(0,0,0,0.06);
        }
        .featured-medium-img {
          aspect-ratio: 16 / 9;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        .featured-medium-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .featured-medium-title {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 16px;
          line-height: 1.3;
        }
        .featured-medium-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .featured-medium-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }
        .featured-icon-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          transition: background 300ms, color 300ms;
        }
        .featured-workshop-card--medium:hover .featured-icon-circle {
          background: #0f172a;
          color: #fff;
        }

        /* ── COMPACT CARD (Card 3 & 4) ── */
        .featured-workshop-card--compact {
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          border-radius: 24px;
        }
        .featured-workshop-card--compact:hover {
          border-color: #cbd5e1;
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
        }
        .featured-compact-img {
          aspect-ratio: 4 / 3;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        .featured-compact-content {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .featured-compact-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 12px;
          line-height: 1.4;
        }
        .featured-compact-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .featured-cta-arrow.dark {
          color: #94a3b8;
        }
        .featured-workshop-card--compact:hover .featured-cta-arrow.dark {
          color: #0f172a;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 980px) {
          .featured-showcase-grid {
            grid-template-columns: 1fr;
          }
          .featured-workshop-card--hero {
            min-height: 480px;
          }
          .featured-showcase-side {
            grid-template-rows: auto auto;
          }
          .featured-hero-content {
            left: 24px; right: 24px; bottom: 24px;
          }
        }

        @media (max-width: 640px) {
          .featured-workshops {
            padding: 64px 0;
          }
          .featured-workshops__header {
            margin-bottom: 32px;
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .featured-workshop-card--hero {
            min-height: 440px;
            border-radius: 24px;
          }
          .featured-hero-content {
            padding: 20px;
            left: 0; right: 0; bottom: 0;
          }
          .featured-hero-title {
            font-size: 24px;
          }
          .featured-hero-desc {
            display: none;
          }
          .featured-showcase-smallGrid {
            grid-template-columns: 1fr;
          }
          .featured-compact-img {
            aspect-ratio: 16 / 9;
          }
        }
      `}</style>

      <section className="featured-workshops">
        <div className="featured-workshops__container">
          {/* Header */}
          <ScrollReveal>
            <div className="featured-workshops__header">
              <div>
                <span className="featured-eyebrow">Curated workshops</span>
                <h2 className="featured-title">{title || 'Featured Workshops'}</h2>
                {description && <p className="featured-desc">{description}</p>}
              </div>
              <Link to="/services" className="featured-view-all">
                View all workshops <ArrowRight size={16} className="featured-cta-arrow" style={{ marginLeft: 4 }} />
              </Link>
            </div>
          </ScrollReveal>

          {!hero ? (
            <EmptyState isAdmin={isAdmin} />
          ) : (
            <div className={items.length > 1 ? "featured-showcase-grid" : ""}>

              {/* Card 1: Hero */}
              <ScrollReveal style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <HeroCard product={hero} />
              </ScrollReveal>

              {/* Cards 2, 3, 4 */}
              {items.length > 1 && (
                <div className="featured-showcase-side">

                  {/* Card 2: Medium */}
                  {medium && (
                    <ScrollReveal delay={0.1} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <MediumCard product={medium} />
                    </ScrollReveal>
                  )}

                  {/* Card 3 & 4: Compacts */}
                  {compacts.length > 0 && (
                    <div className="featured-showcase-smallGrid">
                      {compacts.map((p, i) => (
                        <ScrollReveal key={p.id} delay={0.2 + i * 0.1} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CompactCard product={p} />
                        </ScrollReveal>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
