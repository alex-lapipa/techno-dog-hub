import { useEffect, useRef } from 'react';

const ArticleParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: 'white' | 'green' | 'red';
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
      particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        const isBright = Math.random() < 0.25;
        const colorRoll = Math.random();
        let color: 'white' | 'green' | 'red';
        if (colorRoll < 0.4) {
          color = 'white';
        } else if (colorRoll < 0.75) {
          color = 'green';
        } else {
          color = 'red';
        }
        
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          size: isBright ? Math.random() * 1.2 + 0.4 : Math.random() * 0.8 + 0.15,
          opacity: isBright ? Math.random() * 0.35 + 0.2 : Math.random() * 0.25 + 0.05,
          color,
        });
      }
    };

    const getColor = (color: 'white' | 'green' | 'red', opacity: number) => {
      switch (color) {
        case 'white':
          return `rgba(255, 255, 255, ${opacity})`;
        case 'green':
          return `rgba(0, 255, 136, ${opacity})`;
        case 'red':
          return `rgba(220, 38, 38, ${opacity})`;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = getColor(particle.color, particle.opacity);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.7 }}
    />
  );
};

export default ArticleParticleBackground;
