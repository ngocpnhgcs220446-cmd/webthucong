import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroCarousel({ images }) {
  const [items, setItems] = useState(images);

  useEffect(() => {
    setItems(images);
  }, [images]);

  useEffect(() => {
    const timer = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        const first = next.shift();
        next.push(first);
        return next;
      });
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(timer);
  }, []);

  // Show top 3 or 4 images to create the fanned deck effect
  const visibleItems = items.slice(0, 4);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <AnimatePresence mode="popLayout">
        {visibleItems.map((src, index) => {
          // Calculate dynamic rotations and positioning for the "fanned deck" look
          // The front card is index 0
          const isFront = index === 0;
          
          // Rotation pattern: 0 for front, then alternate left/right, increasing the angle
          const rotatePattern = [0, 8, -6, 12, -10]; 
          const rotation = rotatePattern[index] || 0;

          return (
            <motion.img
              key={src}
              src={src}
              layout
              initial={{ 
                opacity: 0, 
                scale: 0.8, 
                y: -50, 
                rotate: 0 
              }}
              animate={{
                opacity: 1 - index * 0.15,
                scale: 1 - index * 0.06,
                y: index * 24, // Shift down slightly
                x: index === 0 ? 0 : (index % 2 === 0 ? -15 : 15), // Shift left/right
                rotate: rotation,
                zIndex: 10 - index,
              }}
              exit={{
                opacity: 0,
                scale: 1.1,
                x: 200, // Fly off to the right
                rotate: 20,
                filter: "blur(8px)"
              }}
              transition={{
                duration: 0.8,
                ease: [0.32, 0.72, 0, 1] // Custom smooth easing
              }}
              style={{
                position: 'absolute',
                top: 0,
                width: '85%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '32px',
                boxShadow: '0 24px 64px rgba(4, 18, 14, 0.4)',
                border: '2px solid rgba(255,255,255,0.15)',
                transformOrigin: 'bottom center' // Fan from the bottom
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
