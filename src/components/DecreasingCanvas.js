import React, { useRef,useEffect, useState } from 'react'
import Point from './../class/Point'
import {calculateThreeCircleIntersection, getRandomArbitrary} from './../functions/functions'

import settings from './../settings'

function DecreasingCanvas(props) {
  const canvasRef = useRef(null)
  const [points, setPoints] = useState({
    "point1": new Point("green", 0, 0),
    "point2": new Point("red", 0,0),
    "point3": new Point("blue", 0, 0)})

  const [goalPoint, setGoalPoint] = useState(new Point("black", 0, 0));

  // Draws circles
  const draw = (ctx, color, x, y) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, props.dotSize, 0, 2*Math.PI)
    ctx.fill()
  }

  const drawOuter = (ctx, key) => {
    ctx.beginPath()
    ctx.arc(points[key].x, points[key].y, points[key].radius, 0, 2*Math.PI);
    ctx.strokeStyle = points[key].color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Moves a point
  const movePoint = (point, x, y) => {
    points[point].x = x;
    points[point].y = y;
    setPoints({...points});
  }

  // Calculate distance to goalpoint
  const calculateDistance = (key) => {
    return Math.sqrt(Math.pow(points[key].x - goalPoint.x, 2) + Math.pow(points[key].y - goalPoint.y, 2))
  }

  const calculateDistanceXY = (x, y) => {
    return Math.sqrt(Math.pow(x - goalPoint.x, 2) + Math.pow(y - goalPoint.y, 2))
  }

  const drawOuterPoint = (key) => {
    points[key].drawOuter = true;
    setPoints({...points});
  }

  const setPointInterval = (key, interval) => {
    points[key].interval = interval;
    setPoints({...points});
  }

  const setRadius = (key, radius) => {
    points[key].radius = radius;
    setPoints({...points})
  }

  const setOuterInterval = (key, interval) => {
    points[key].drawOuterinterval = interval;
    setPoints({...points});
  }

  const clearPointInterval = (key) => {
    if(points[key].interval)
      clearInterval(points[key].interval);
    points[key].interval = null;
    setPoints({...points});
  }

  const clearOuterInterval = (key) => {
    if(points[key].drawOuterinterval)
      clearInterval(points[key].drawOuterinterval);
    points[key].drawOuterinterval = null;
    setPoints({...points});
  }

  const allFinished = () => {
    let finished = true;
    for(const item of Object.values(points)){
      finished = finished && (item.interval === null);
    }
    return finished;
  }

  // Calculate point
  const calculatePoint = (key) => {
    if(calculateDistance(key) > getRandomArbitrary(props.maxDistance - props.errorMargin,props.maxDistance)){
      switch(getDirection(key)){
        case "RIGHT":
          movePoint(key, points[key].x + 1, points[key].y + 1);
          break;
        case "LEFT":
          movePoint(key, points[key].x - 1, points[key].y + 1);
          break;
        case "UP":
          movePoint(key, points[key].x + 1, points[key].y - 1);
          break;
        case "DOWN":
          movePoint(key, points[key].x - 1, points[key].y - 1);
          break;
        default:
          break;
      }
    }
    // In range
    else{
        clearPointInterval(key);
        drawOuterPoint(key);

        // Decrease until intersection of all points
        setOuterInterval(key, setInterval(() => {
            if(points[key].radius > calculateDistance(key)
              && allFinished()) // If all finished
              setRadius(key, points[key].radius - 1);

              if(points[key].radius <= calculateDistance(key))
                clearOuterInterval(key);

              if(allFinished() && key === "point1"){
                let res = calculateThreeCircleIntersection(points["point1"].x, points["point1"].y, points["point1"].radius,
                    points["point2"].x, points["point2"].y, points["point2"].radius,
                    points["point3"].x, points["point3"].y, points["point3"].radius);
                  props.onGuessedPosition(Math.floor(res.x), Math.floor(res.y));
              }
          }, props.radiusSpeed)
        )
    }
  }

  // Get direction
  const getDirection = (key) => {
    // is on left side
    if(calculateDistanceXY(points[key].x + 1, points[key].y + 1) < calculateDistanceXY(points[key].x, points[key].y))
      return "RIGHT";
    else if(calculateDistanceXY(points[key].x - 1, points[key].y + 1) < calculateDistanceXY(points[key].x, points[key].y))
      return "LEFT";
    else if(calculateDistanceXY(points[key].x + 1, points[key].y - 1) < calculateDistanceXY(points[key].x, points[key].y))
      return "UP";
    else if(calculateDistanceXY(points[key].x - 1, points[key].y - 1) < calculateDistanceXY(points[key].x, points[key].y))
      return "DOWN";
  }

  // INITIALIZES
  useEffect(() => {
    props.onGuessedPosition(null, null);

    // Randomize Goal point || fixed dot
    if(props.fixedDot){
      goalPoint.x = settings.canvasWidth/2;
      goalPoint.y = settings.canvasHeight/2;
    }
    else{
      goalPoint.x = getRandomArbitrary(settings.boarder, settings.canvasWidth - settings.boarder);
      goalPoint.y = getRandomArbitrary(settings.boarder, settings.canvasHeight - settings.boarder);
    }

    setGoalPoint(goalPoint);

    props.onGoalPosition(goalPoint.x, goalPoint.y);

    // Randomize all points && Start
    var calculatedPoints = {
      "point1": {"x": 0, "y": 0},
      "point2": {"x": 0, "y": 0},
      "point3": {"x": 0, "y": 0},
    };

    // Calculate point for each
    //// Point 1 random
    calculatedPoints["point1"].x = getRandomArbitrary(settings.boarder, settings.canvasWidth - settings.boarder)
    calculatedPoints["point1"].y = getRandomArbitrary(settings.boarder, settings.canvasHeight - settings.boarder)

    //// Point 2 on opposite X side
    if(calculatedPoints["point1"].x > goalPoint.x)
      calculatedPoints["point2"].x = getRandomArbitrary(settings.boarder, goalPoint.x - settings.boarder)
    else
      calculatedPoints["point2"].x = getRandomArbitrary(goalPoint.x, settings.canvasWidth - settings.boarder)
    if(calculatedPoints["point1"].y > goalPoint.y)
      calculatedPoints["point2"].y = getRandomArbitrary(goalPoint.y, settings.canvasHeight - settings.boarder)
    else
      calculatedPoints["point2"].y = getRandomArbitrary(settings.boarder, goalPoint.y - settings.boarder)

    //// Point 3 on opposite Y side
    if(calculatedPoints["point1"].y > goalPoint.y)
      calculatedPoints["point3"].y = getRandomArbitrary(settings.boarder , goalPoint.y - settings.boarder)
    else
      calculatedPoints["point3"].y = getRandomArbitrary(goalPoint.y, settings.canvasHeight - settings.boarder)
    if(calculatedPoints["point1"].x > goalPoint.x)
      calculatedPoints["point3"].x = getRandomArbitrary(settings.boarder, goalPoint.x - settings.boarder)
    else
      calculatedPoints["point3"].x = getRandomArbitrary(goalPoint.x, settings.canvasWidth - settings.boarder)

    for(const key of Object.keys(points)){
      movePoint(key, calculatedPoints[key].x, calculatedPoints[key].y)
      setRadius(key, props.maxDistance)

      setPointInterval(key, setInterval(() => {
        calculatePoint(key);
      }, props.speed))
    }

    // Unmount all
    return () => {
      clearPointInterval("point1");
      clearPointInterval("point2");
      clearPointInterval("point3");

      clearOuterInterval("point1");
      clearOuterInterval("point2");
      clearOuterInterval("point3");
    }
  }, []);

  // USED FOR DRAWING
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    // Overwrite canvas
    context.canvas.width = settings.canvasWidth;
    context.canvas.height = settings.canvasHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw markers
    for(const [key, item] of Object.entries(points)){
      draw(context, item.color, item.x, item.y)

      if(points[key].drawOuter){
        drawOuter(context, key);
      }
    }

    // Draw goal point
    draw(context, goalPoint.color, goalPoint.x, goalPoint.y)
  }, [points])

  return (
      <canvas ref={canvasRef}/>
  );
}

export default DecreasingCanvas;
