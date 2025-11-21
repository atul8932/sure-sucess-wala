import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * TrueFocus (JSX)
 * Props (all optional):
 *  - sentence (string) default: "True Focus"
 *  - separator (string) default: " "
 *  - manualMode (bool) default: false
 *  - blurAmount (number, px) default: 6
 *  - borderColor (string) default: '#60a5fa'
 *  - glowColor (string) default: 'rgba(96,165,250,0.18)'
 *  - animationDuration (number, seconds) default: 0.45
 *  - pauseBetweenAnimations (number, seconds) default: 0.9
 *  - className (string) optional additional class
 */
export default function TrueFocus({
  sentence = 'True Focus',
  separator = ' ',
  manualMode = false,
  blurAmount = 6,
  borderColor = '#60a5fa',
  glowColor = 'rgba(96,165,250,0.18)',
  animationDuration = 0.45,
  pauseBetweenAnimations = 0.9,
  className = ''
}) {
  const words = String(sentence).split(separator);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(null);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // auto-cycle unless manualMode
  useEffect(() => {
    if (manualMode) return;
    const t = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % words.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);
    return () => clearInterval(t);
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  // update frame position when index changes
  useEffect(() => {
    if (!containerRef.current) return;
    const el = wordRefs.current[currentIndex];
    if (!el) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setFocusRect({
      x: rect.left - parentRect.left,
      y: rect.top - parentRect.top,
      width: Math.max(2, rect.width),
      height: Math.max(2, rect.height)
    });
  }, [currentIndex, words.length]);

  const handleEnter = (i) => {
    if (!manualMode) return;
    setLastIndex(i);
    setCurrentIndex(i);
  };
  const handleLeave = () => {
    if (!manualMode) return;
    setCurrentIndex(lastIndex ?? 0);
  };

  // CSS variables for colors
  const styleVars = { '--tf-border': borderColor, '--tf-glow': glowColor };

  return (
    <div ref={containerRef} className={`tf-container ${className}`} style={styleVars}>
      {words.map((w, i) => {
        const active = i === currentIndex;
        return (
          <span
            key={i}
            ref={(el) => (wordRefs.current[i] = el)}
            className={`tf-word ${active ? 'tf-active' : ''}`}
            onMouseEnter={() => handleEnter(i)}
            onMouseLeave={handleLeave}
            style={{
              filter: active ? 'blur(0px)' : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s ease`
            }}
          >
            {w}
            {i !== words.length - 1 ? separator : ''}
          </span>
        );
      })}

      <motion.div
        className="tf-frame"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: 1
        }}
        transition={{ duration: animationDuration }}
        style={{ position: 'absolute' }}
      >
        <span className="corner top-left" />
        <span className="corner top-right" />
        <span className="corner bottom-left" />
        <span className="corner bottom-right" />
      </motion.div>

      <style>{`
        .tf-container {
          display: inline-block;
          position: relative;
          font-weight: 700;
          color: #e6eef8;
          --tf-border: ${borderColor};
          --tf-glow: ${glowColor};
        }

        .tf-word {
          display: inline-block;
          margin-right: 6px;
          font-size: 1.25rem;
          cursor: default;
          user-select: none;
        }

        .tf-active { filter: blur(0px) !important; }

        .tf-frame {
          position: absolute;
          border: 1.6px solid var(--tf-border);
          border-radius: 8px;
          pointer-events: none;
          box-shadow: 0 10px 36px var(--tf-glow);
          z-index: 20;
          transform-origin: 0 0;
        }

        .corner {
          position: absolute;
          width: 12px;
          height: 12px;
          box-sizing: border-box;
          border-style: solid;
          border-color: var(--tf-border);
          border-width: 2px;
          background: transparent;
        }
        .top-left { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
        .top-right { top: -1px; right: -1px; border-left: 0; border-bottom: 0; }
        .bottom-left { bottom: -1px; left: -1px; border-right: 0; border-top: 0; }
        .bottom-right { bottom: -1px; right: -1px; border-left: 0; border-top: 0; }

        @media (max-width: 700px) {
          .tf-word { font-size: 1.05rem; margin-right: 4px; }
          .tf-frame { border-radius: 6px; }
        }
      `}</style>
    </div>
  );
}
