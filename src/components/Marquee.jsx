export default function Marquee() {
  const text = "Cultural Heritage";
  const text2 = "Expert Artisans";
  const text3 = "Creative Workshops";
  
  const content = (
    <span className="marquee-part">
      {text} <span>✦</span> {text2} <span>✦</span> {text3} <span>✦</span>
      {text} <span>✦</span> {text2} <span>✦</span> {text3} <span>✦</span>
    </span>
  );

  return (
    <div className="marquee-container">
      <div className="marquee-track">
        {content}
        {content}
      </div>
    </div>
  );
}
