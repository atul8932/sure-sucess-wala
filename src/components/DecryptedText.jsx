import { useEffect, useState, useRef } from "react";

export default function DecryptedText({
  text,
  speed = 10,
  maxIterations = 10,
  animateOn = "hover", // "hover", "view", or "both"
  revealDirection = "start", // "start" | "end" | "center"
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef(null);

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()";

  // Intersection Observer (if animateOn = "view")
  useEffect(() => {
    if (animateOn !== "view" && animateOn !== "both") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsAnimating(true);
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.4 }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [animateOn, hasAnimated]);

  // Scramble logic
  useEffect(() => {
    if (!isAnimating) return;

    let iteration = 0;
    const original = text;
    const scrambleInterval = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split("")
          .map((char, i) => {
            if (iteration > maxIterations) return original[i];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      iteration++;
      if (iteration > maxIterations) {
        clearInterval(scrambleInterval);
        setDisplayText(original);
        setIsAnimating(false);
      }
    }, speed);

    return () => clearInterval(scrambleInterval);
  }, [isAnimating, speed, maxIterations, text]);

  return (
    <span
      ref={containerRef}
      onMouseEnter={() =>
        animateOn === "hover" || animateOn === "both"
          ? setIsAnimating(true)
          : null
      }
      style={{ display: "inline-block", cursor: "default" }}
    >
      {displayText}
    </span>
  );
}
