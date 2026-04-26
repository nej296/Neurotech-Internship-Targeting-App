"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  className?: string;
}

export default function RadialOrbitalTimeline({
  timelineData,
  className = "",
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const centerViewOnNode = (nodeId: number) => {
    if (!nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key, 10) !== id) {
          newState[parseInt(key, 10)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: NodeJS.Timeout;

    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.3) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 168;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.45,
      Math.min(1, 0.45 + 0.55 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, zIndex, opacity };
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "border-emerald-300/60 bg-emerald-300 text-black";
      case "in-progress":
        return "border-cyan-300/70 bg-cyan-300 text-black";
      case "pending":
        return "border-white/20 bg-white/10 text-white/70";
      default:
        return "border-white/20 bg-white/10 text-white/70";
    }
  };

  return (
    <div
      className={`relative min-h-[560px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black ${className}`}
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-40" />

      <div className="relative flex h-full min-h-[560px] w-full items-center justify-center">
        <div
          className="absolute flex h-full w-full items-center justify-center"
          ref={orbitRef}
          style={{ perspective: "1000px" }}
        >
          <div className="absolute z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-cyan-300 to-blue-500 shadow-[0_0_40px_rgba(34,211,238,0.35)] animate-pulse">
            <div className="absolute h-20 w-20 rounded-full border border-white/20 opacity-70 animate-ping" />
            <div
              className="absolute h-24 w-24 rounded-full border border-white/10 opacity-50 animate-ping"
              style={{ animationDelay: "0.5s" }}
            />
            <div className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-md" />
          </div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${(position.x - 20).toFixed(3)}px, ${(position.y - 20).toFixed(3)}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : Number(position.opacity.toFixed(3)),
            };

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className="absolute cursor-pointer transition-all duration-700"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={`absolute -inset-1 rounded-full ${
                    isPulsing ? "animate-pulse duration-1000" : ""
                  }`}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(34,211,238,0.24) 0%, rgba(34,211,238,0) 70%)",
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                />

                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300
                    ${
                      isExpanded
                        ? "scale-150 border-cyan-200 bg-white text-black shadow-lg shadow-cyan-300/30"
                        : isRelated
                          ? "border-cyan-200 bg-cyan-100/80 text-black animate-pulse"
                          : "border-white/40 bg-black text-white"
                    }
                  `}
                >
                  <Icon size={16} />
                </div>

                <div
                  className={`
                    absolute top-12 whitespace-nowrap text-xs font-semibold tracking-[0.18em] transition-all duration-300
                    ${isExpanded ? "scale-125 text-white" : "text-white/70"}
                  `}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card className="absolute left-1/2 top-20 w-72 -translate-x-1/2 overflow-visible border-white/20 bg-black/90 text-white shadow-xl shadow-cyan-300/10 backdrop-blur-lg">
                    <div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-white/50" />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          className={`px-2 text-xs ${getStatusStyles(
                            item.status
                          )}`}
                        >
                          {item.status === "completed"
                            ? "COMPLETE"
                            : item.status === "in-progress"
                              ? "IN PROGRESS"
                              : "PENDING"}
                        </Badge>
                        <span className="font-mono text-xs text-white/50">
                          {item.date}
                        </span>
                      </div>
                      <CardTitle className="mt-2 text-sm text-white">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-white/80">
                      <p>{item.content}</p>

                      <div className="mt-4 border-t border-white/10 pt-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="flex items-center">
                            <Zap size={10} className="mr-1" />
                            Signal Strength
                          </span>
                          <span className="font-mono">{item.energy}%</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-300 to-cyan-300"
                            style={{ width: `${item.energy}%` }}
                          />
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 border-t border-white/10 pt-3">
                          <div className="mb-2 flex items-center">
                            <Link size={10} className="mr-1 text-white/70" />
                            <h4 className="text-xs font-medium uppercase tracking-wider text-white/70">
                              Connected Nodes
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find(
                                (i) => i.id === relatedId
                              );
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="flex h-6 items-center rounded-none border-white/20 bg-transparent px-2 py-0 text-xs text-white/80 transition-all hover:bg-white/10 hover:text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight
                                    size={8}
                                    className="ml-1 text-white/60"
                                  />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
