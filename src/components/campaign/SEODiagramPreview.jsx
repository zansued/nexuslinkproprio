import React from "react";

export default function SEODiagramPreview({ diagram, size = "medium" }) {
  const sizes = {
    small: { width: 200, height: 150 },
    medium: { width: 400, height: 300 },
    large: { width: 600, height: 450 }
  };

  const { width, height } = sizes[size];

  const renderDiversityPower = () => (
    <svg width={width} height={height} viewBox="0 0 400 300">
      {/* Money Site Central */}
      <circle cx="200" cy="150" r="20" fill="#fbbf24" stroke="#00ffae" strokeWidth="2" />
      <text x="200" y="155" textAnchor="middle" fill="#050505" fontSize="10" fontWeight="bold">SITE</text>
      
      {/* Tier 1 - Círculo interno (8 nós) */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45 - 90) * Math.PI / 180;
        const x = 200 + 80 * Math.cos(angle);
        const y = 150 + 80 * Math.sin(angle);
        return (
          <g key={`t1-${i}`}>
            <line x1="200" y1="150" x2={x} y2={y} stroke="#00ffae" strokeWidth="1.5" opacity="0.6" />
            <circle cx={x} cy={y} r="12" fill="#0f0f0f" stroke="#00ffae" strokeWidth="1.5" />
            <text x={x} y={y + 3} textAnchor="middle" fill="#00ffae" fontSize="8">T1</text>
          </g>
        );
      })}
      
      {/* Tier 2 - Círculo externo (16 nós) */}
      {[...Array(16)].map((_, i) => {
        const angle = (i * 22.5 - 90) * Math.PI / 180;
        const x = 200 + 140 * Math.cos(angle);
        const y = 150 + 140 * Math.sin(angle);
        const t1Angle = Math.floor(i / 2) * 45;
        const t1X = 200 + 80 * Math.cos((t1Angle - 90) * Math.PI / 180);
        const t1Y = 150 + 80 * Math.sin((t1Angle - 90) * Math.PI / 180);
        return (
          <g key={`t2-${i}`}>
            <line x1={t1X} y1={t1Y} x2={x} y2={y} stroke="#10e6f6" strokeWidth="1" opacity="0.4" />
            <circle cx={x} cy={y} r="8" fill="#0f0f0f" stroke="#10e6f6" strokeWidth="1" />
            <text x={x} y={y + 2} textAnchor="middle" fill="#10e6f6" fontSize="6">T2</text>
          </g>
        );
      })}
    </svg>
  );

  const renderDiamondStar = () => (
    <svg width={width} height={height} viewBox="0 0 400 300">
      {/* Money Site */}
      <circle cx="200" cy="150" r="25" fill="#fbbf24" stroke="#00ffae" strokeWidth="2" />
      <text x="200" y="155" textAnchor="middle" fill="#050505" fontSize="12" fontWeight="bold">SITE</text>
      
      {/* High DA nodes (Diamond points) */}
      {[
        { x: 200, y: 50, label: "DA 70+" },
        { x: 300, y: 150, label: "DA 60+" },
        { x: 200, y: 250, label: "DA 65+" },
        { x: 100, y: 150, label: "DA 70+" }
      ].map((node, i) => (
        <g key={i}>
          <line x1="200" y1="150" x2={node.x} y2={node.y} stroke="#00ffae" strokeWidth="2" opacity="0.8" />
          <circle cx={node.x} cy={node.y} r="18" fill="#0f0f0f" stroke="#00ffae" strokeWidth="2" />
          <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#00ffae" fontSize="9" fontWeight="bold">
            {node.label}
          </text>
        </g>
      ))}
      
      {/* Secondary quality links */}
      {[
        { x: 150, y: 80 }, { x: 250, y: 80 },
        { x: 280, y: 180 }, { x: 280, y: 120 },
        { x: 150, y: 220 }, { x: 250, y: 220 },
        { x: 120, y: 180 }, { x: 120, y: 120 }
      ].map((node, i) => (
        <g key={`sec-${i}`}>
          <line 
            x1="200" 
            y1="150" 
            x2={node.x} 
            y2={node.y} 
            stroke="#10e6f6" 
            strokeWidth="1" 
            opacity="0.5" 
            strokeDasharray="2,2"
          />
          <circle cx={node.x} cy={node.y} r="10" fill="#0f0f0f" stroke="#10e6f6" strokeWidth="1" />
          <text x={node.x} y={node.y + 3} textAnchor="middle" fill="#10e6f6" fontSize="7">DA40</text>
        </g>
      ))}
    </svg>
  );

  const renderPyramidScheme = () => (
    <svg width={width} height={height} viewBox="0 0 400 300">
      {/* Money Site (Top) */}
      <circle cx="200" cy="40" r="20" fill="#fbbf24" stroke="#00ffae" strokeWidth="2" />
      <text x="200" y="45" textAnchor="middle" fill="#050505" fontSize="10" fontWeight="bold">SITE</text>
      
      {/* Tier 1 (5 nodes) */}
      {[...Array(5)].map((_, i) => {
        const x = 100 + i * 50;
        const y = 110;
        return (
          <g key={`t1-${i}`}>
            <line x1="200" y1="40" x2={x} y2={y} stroke="#00ffae" strokeWidth="2" opacity="0.7" />
            <circle cx={x} cy={y} r="15" fill="#0f0f0f" stroke="#00ffae" strokeWidth="1.5" />
            <text x={x} y={y + 4} textAnchor="middle" fill="#00ffae" fontSize="9" fontWeight="bold">T1</text>
          </g>
        );
      })}
      
      {/* Tier 2 (10 nodes) */}
      {[...Array(10)].map((_, i) => {
        const x = 50 + i * 33;
        const y = 180;
        const t1Index = Math.floor(i / 2);
        const t1X = 100 + t1Index * 50;
        const t1Y = 110;
        return (
          <g key={`t2-${i}`}>
            <line x1={t1X} y1={t1Y} x2={x} y2={y} stroke="#10e6f6" strokeWidth="1" opacity="0.5" />
            <circle cx={x} cy={y} r="10" fill="#0f0f0f" stroke="#10e6f6" strokeWidth="1" />
            <text x={x} y={y + 3} textAnchor="middle" fill="#10e6f6" fontSize="7">T2</text>
          </g>
        );
      })}
      
      {/* Tier 3 (15 nodes) */}
      {[...Array(15)].map((_, i) => {
        const x = 30 + i * 25;
        const y = 250;
        const t2Index = Math.floor(i / 1.5);
        const t2X = 50 + Math.min(t2Index, 9) * 33;
        const t2Y = 180;
        return (
          <g key={`t3-${i}`}>
            <line x1={t2X} y1={t2Y} x2={x} y2={y} stroke="#666" strokeWidth="0.5" opacity="0.3" />
            <circle cx={x} cy={y} r="6" fill="#0f0f0f" stroke="#666" strokeWidth="0.5" />
            <text x={x} y={y + 2} textAnchor="middle" fill="#666" fontSize="5">T3</text>
          </g>
        );
      })}
    </svg>
  );

  const renderWheelLink = () => (
    <svg width={width} height={height} viewBox="0 0 400 300">
      {/* Money Site Central */}
      <circle cx="200" cy="150" r="20" fill="#fbbf24" stroke="#00ffae" strokeWidth="2" />
      <text x="200" y="155" textAnchor="middle" fill="#050505" fontSize="10" fontWeight="bold">SITE</text>
      
      {/* Wheel nodes (8) */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45 - 90) * Math.PI / 180;
        const x = 200 + 100 * Math.cos(angle);
        const y = 150 + 100 * Math.sin(angle);
        const nextAngle = ((i + 1) * 45 - 90) * Math.PI / 180;
        const nextX = 200 + 100 * Math.cos(nextAngle);
        const nextY = 150 + 100 * Math.sin(nextAngle);
        
        return (
          <g key={i}>
            {/* Link to center */}
            <line x1="200" y1="150" x2={x} y2={y} stroke="#00ffae" strokeWidth="1.5" opacity="0.6" />
            {/* Link to next node (wheel effect) */}
            <line x1={x} y1={y} x2={nextX} y2={nextY} stroke="#10e6f6" strokeWidth="1" opacity="0.5" />
            <circle cx={x} cy={y} r="15" fill="#0f0f0f" stroke="#00ffae" strokeWidth="1.5" />
            <text x={x} y={y + 4} textAnchor="middle" fill="#00ffae" fontSize="9">W{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );

  const renderStarLink = () => (
    <svg width={width} height={height} viewBox="0 0 400 300">
      {/* Money Site Central */}
      <circle cx="200" cy="150" r="25" fill="#fbbf24" stroke="#00ffae" strokeWidth="2" />
      <text x="200" y="155" textAnchor="middle" fill="#050505" fontSize="12" fontWeight="bold">SITE</text>
      
      {/* Star rays (12 directions) */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const x = 200 + 120 * Math.cos(angle);
        const y = 150 + 120 * Math.sin(angle);
        
        return (
          <g key={i}>
            <line x1="200" y1="150" x2={x} y2={y} stroke="#00ffae" strokeWidth="2" opacity="0.7" />
            <circle cx={x} cy={y} r="12" fill="#0f0f0f" stroke="#00ffae" strokeWidth="1.5" />
            <text x={x} y={y + 3} textAnchor="middle" fill="#00ffae" fontSize="7">BL</text>
          </g>
        );
      })}
    </svg>
  );

  const renderDiagram = () => {
    switch (diagram) {
      case "diversity_power":
        return renderDiversityPower();
      case "diamond_star":
        return renderDiamondStar();
      case "pyramid_scheme":
        return renderPyramidScheme();
      case "wheel_link":
        return renderWheelLink();
      case "star_link":
        return renderStarLink();
      default:
        return renderDiversityPower();
    }
  };

  return (
    <div className="flex justify-center items-center bg-[#050505] border border-[#1f1f1f] rounded-lg p-4">
      {renderDiagram()}
    </div>
  );
}
