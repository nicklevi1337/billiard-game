import React, { useEffect, useRef, useState } from 'react';

const BilliardsGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string }>>([]);
  const [selectedBallIndex, setSelectedBallIndex] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawBall = (x: number, y: number, radius: number, color: string) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      balls.forEach(ball => drawBall(ball.x, ball.y, ball.radius, ball.color));
    };

    const update = () => {
      balls.forEach((ball, index) => {
        if (ball.vx !== 0 || ball.vy !== 0) { // Проверяем, движется ли шар
          ball.x += ball.vx;
          ball.y += ball.vy;

          if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            ball.vx *= -0.9;
          }
          if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.vy *= -0.9;
          }

          balls.forEach((otherBall, otherIndex) => {
            if (ball !== otherBall) {
              const dx = otherBall.x - ball.x;
              const dy = otherBall.y - ball.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const minDistance = ball.radius + otherBall.radius;

              if (distance < minDistance) {
                const angle = Math.atan2(dy, dx);
                const targetX = ball.x + Math.cos(angle) * minDistance;
                const targetY = ball.y + Math.sin(angle) * minDistance;
                const ax = (targetX - otherBall.x) * 0.1;
                const ay = (targetY - otherBall.y) * 0.1;
                ball.vx -= ax;
                ball.vy -= ay;
                ball.vx *= 0.9;
                ball.vy *= 0.9;
              }
            }
          });
        }
      });

      draw();
      requestAnimationFrame(update);
    };

    update();
  }, [balls]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const initialBalls = [
      { x: 100, y: 100, vx: 0, vy: 0, radius: 30, color: 'red' },
      { x: 200, y: 200, vx: 0, vy: 0, radius: 35, color: 'blue' },
      { x: 300, y: 300, vx: 0, vy: 0, radius: 40, color: 'green' },
      { x: 300, y: 150, vx: 0, vy: 0, radius: 50, color: 'yellow' },
    ];

    setBalls(initialBalls);
  }, []);

  const handleBallClick = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const mouseX = event.nativeEvent.offsetX;
    const mouseY = event.nativeEvent.offsetY;

    const clickedBallIndex = balls.findIndex(ball => {
      const dx = ball.x - mouseX;
      const dy = ball.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= ball.radius;
    });

    if (clickedBallIndex !== -1) {
      const newBalls = [...balls];
      newBalls[clickedBallIndex].vx = 0.5; // Устанавливаем начальную скорость по клику
      newBalls[clickedBallIndex].vy = 0.5;
      setBalls(newBalls);
      setSelectedBallIndex(clickedBallIndex);
      setMenuPosition({ x: mouseX, y: mouseY });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const mouseX = event.nativeEvent.offsetX;
    const mouseY = event.nativeEvent.offsetY;

    balls.forEach(ball => {
      const dx = mouseX - ball.x;
      const dy = mouseY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        ball.vx -= dx * 0.003;
        ball.vy -= dy * 0.003;
      }

      if (ball.x + ball.vx < ball.radius || ball.x + ball.vx > canvasRef.current!.width - ball.radius) {
        ball.vx *= -1;
      }
      if (ball.y + ball.vy < ball.radius || ball.y + ball.vy > canvasRef.current!.height - ball.radius) {
        ball.vy *= -1;
      }
    });
  };

  const handleColorChange = (color: string) => {
    if (selectedBallIndex !== null) {
      const newBalls = [...balls];
      newBalls[selectedBallIndex].color = color;
      setBalls(newBalls);
      setSelectedBallIndex(null);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black' }}
        width={800}
        height={600}
        onMouseDown={handleBallClick}
        onMouseMove={handleMouseMove}
      />
      {selectedBallIndex !== null && (
        <BallMenu
          onColorChange={handleColorChange}
          position={{ left: menuPosition.x, top: menuPosition.y }}
        />
      )}
    </div>
  );
};

const BallMenu: React.FC<{ onColorChange: (color: string) => void; position: { left: number; top: number } }> = ({ onColorChange, position }) => {
  const handleColorChange = (color: string) => {
    onColorChange(color);
  };

  return (
    <div style={{ position: 'absolute', left: position.left, top: position.top }}>
      <button onClick={() => handleColorChange('red')}>Red</button>
      <button onClick={() => handleColorChange('green')}>Green</button>
      <button onClick={() => handleColorChange('blue')}>Blue</button>
      <button onClick={() => handleColorChange('yellow')}>Yellow</button>
    </div>
  );
};

export default BilliardsGame;



/*
import React, { useRef, useEffect, useState } from 'react';

interface CanvasProps {
  width: number;
  height: number;
}

interface Ball {
  x: number;
  y: number;
  radius: number;
  color: string;
  dx: number;
  dy: number;
}

const BallMenu: React.FC<{ onSelectColor: (color: string) => void }> = ({ onSelectColor }) => {
  const colors = ['red', 'blue', 'green', 'yellow']; // Список цветов
  return (
    <div style={{ position: 'absolute', top: '4px', left: '-32px' }}>
      {colors.map((color, index) => (
        <div key={index} style={{ backgroundColor: color, width: '20px', height: '20px', margin: '5px', cursor: 'pointer' }} onClick={() => onSelectColor(color)}></div>
      ))}
    </div>
  );
};

const Canvas: React.FC<CanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([
    { x: 100, y: 100, radius: 10, color: 'red', dx: 0, dy: 0 },
    { x: 200, y: 200, radius: 15, color: 'blue', dx: 0, dy: 0 },
    { x: 300, y: 300, radius: 20, color: 'green', dx: 0, dy: 0 },
    { x: 400, y: 400, radius: 25, color: 'yellow', dx: 0, dy: 0 },
  ]);
  const [selectedBallIndex, setSelectedBallIndex] = useState<number | null>(null);
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  

  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const animate = () => {
        context.clearRect(0, 0, width, height);
      

        balls.forEach((ball, index) => {
          context.beginPath();
          context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
          context.fillStyle = ball.color;
          context.fill();
          context.closePath();
      
          if (selectedBallIndex === index) {
            // Обновляем позиции шаров
            ball.x += ball.dx;
            ball.y += ball.dy;

      
            // Проверяем столкновения со стенами холста
            if (ball.x + ball.dx > width - ball.radius || ball.x + ball.dx < ball.radius) {
              ball.dx = -ball.dx;
              ball.dx *= 0.9;
            }
            if (ball.y + ball.dy > height - ball.radius || ball.y + ball.dy < ball.radius) {
              ball.dy = -ball.dy;
              ball.dy *= 0.9;
            }
      
            // Проверяем столкновения с другими шарами
            balls.forEach((otherBall, otherIndex) => {
              if (index !== otherIndex) {
                const dx = otherBall.x - ball.x;
                const dy = otherBall.y - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = ball.radius + otherBall.radius;
      
                if (distance < minDistance) {
                  // Рассчитываем угол и направление столкновения
                  const angle = Math.atan2(dy, dx);
                  const targetX = ball.x + Math.cos(angle) * minDistance;
                  const targetY = ball.y + Math.sin(angle) * minDistance;
                  const ax = (targetX - otherBall.x) * 0.1;
                  const ay = (targetY - otherBall.y) * 0.1;
      
                  // Обновляем скорости шаров для учета столкновения
                  ball.dx -= ax;
                  ball.dy -= ay;
                  otherBall.dx += ax;
                  otherBall.dy += ay;

                  ball.dx *= 0.9;
                  ball.dy *= 0.9;
                  otherBall.dx *= 0.9;
                  otherBall.dy *= 0.9;
                }
              }
            });
          }
        });
      
        requestAnimationFrame(animate);
      };
  
      animate();
    }, [width, height, balls, selectedBallIndex]);
  
  

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        setMouseDown(true);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        setMousePosition({ x: clickX, y: clickY });
    
        let clickedBallIndex = -1;
        balls.forEach((ball, index) => {
          const dx = clickX - ball.x;
          const dy = clickY - ball.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < ball.radius) {
            clickedBallIndex = index;
          }
        });
    
        setSelectedBallIndex(clickedBallIndex !== -1 ? clickedBallIndex : null);
        setMenuVisible(clickedBallIndex !== -1);
    
      };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!mouseDown || selectedBallIndex === null) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const dx = clickX - mousePosition.x;
    const dy = clickY - mousePosition.y;

    // Устанавливаем скорость выбранного шара в направлении движения мыши
    const speed = 5; // Скорость движения
    balls[selectedBallIndex].dx = dx / speed;
    balls[selectedBallIndex].dy = dy / speed;
}


  const handleMouseUp = () => {
    setMouseDown(false);
    setSelectedBallIndex(null);
 };

 const handleMenuSelectColor = (color: string) => {
  if (selectedBallIndex !== null) {
    const updatedBalls = [...balls];
    updatedBalls[selectedBallIndex].color = color;
    setBalls(updatedBalls);

  }
  setMenuVisible(false);
};

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: '5px solid black' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
 />
 {menuVisible && <BallMenu onSelectColor={handleMenuSelectColor} />}
</div>
  );
};


export default Canvas;




*/