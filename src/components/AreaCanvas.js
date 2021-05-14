import React, { useRef,useEffect, useState } from 'react'
import Point from './../class/Point'
import {getRandomArbitrary, union_arrays} from './../functions/functions'

import settings from './../settings'
import {Button} from "react-bootstrap";

function AreaCanvas(props) {
  const canvasRef = useRef(null);
  const [reRun, setRerun] = useState(false);
  const [points, setPoints] = useState({
    "point1": new Point("green", 0, 0),
    "point2": new Point("red", 0,0),
    "point3": new Point("blue", 0, 0)})

  const [goalPoint, setGoalPoint] = useState(new Point("#070707", 0, 0));
  const [allPositions, setAllPositions] = useState({list: []});
  const [totalRuns, setTotalruns] = useState({val: 0});

  // Draws circles
  const draw = (ctx, color, x, y) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, props.dotSize, 0, 2*Math.PI)
    ctx.fill()
  }

  const drawCircle = (ctx, point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "purple";
    ctx.fill();
  };


  var canvas1, ctx1;

  const drawIntersect = (ctx) => {
    if(ctx1){
      ctx1.clearRect(0, 0, settings.canvasWidth, settings.canvasHeight);

      ctx1.save()

      drawCircle(ctx1, points["point1"], "purple");
      ctx1.globalCompositeOperation = "source-in";
      drawCircle(ctx1, points["point2"], "purple");
      drawCircle(ctx1, points["point3"], "purple");
      ctx1.globalCompositeOperation = 'destination-out';

      ctx1.restore();

      if(ctx){
        ctx.drawImage(canvas1, 0, 0);
      }
    }

  };

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

  const clearPointInterval = (key) => {
    if(points[key].interval)
      clearInterval(points[key].interval);
    points[key].interval = null;
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
        drawIntersect();

        if(allFinished()){
          calculateArea()
        }
    }
  };

  const calculateArea = () => {
      if(!canvasRef.current)
        return;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      var imgd = context.getImageData(0, 0 , canvas.width, canvas.height);
      var pix = imgd.data;

      // Loop over each pixel and invert the color.
      let all_positions = [];
      for (var i = 0; i < pix.length; i += 4) {
        // Add area
        if(pix[i] === 128 && pix[i+2] === 128){
            all_positions.push({
              x: (i / 4) % canvas.width,
              y: Math.floor((i / 4) / canvas.width),
              point: false
            })
        }
        // Add black point
        else if(pix[i] === 7 && pix[i+1] === 7 && pix[i+2] === 7){
          all_positions.push({
            x: (i / 4) % canvas.width,
            y: Math.floor((i / 4) / canvas.width),
            point: true
          })
        }
      }

    if(totalRuns.val > 1){
      // Keep the union
      all_positions = union_arrays(allPositions.list, all_positions);

      allPositions.list = all_positions;
    }

    // check if in list already
    if(all_positions.length > 0)
      props.onGuessedPosition(all_positions[Math.floor(Math.random() * (all_positions.length))]);
    else
      props.onGuessedPosition({x: null, y: null});

    props.onAllPositions(all_positions);
    setAllPositions({ list: [...all_positions]});

    if(reRun)
      runAgain();
  };

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
    // Reset
    runAgain()

    // Unmount all
    return () => {
      clearPointInterval("point1");
      clearPointInterval("point2");
      clearPointInterval("point3");
    }
  }, []);

  const simulateRerun = () => {
    setRerun(true);
    runAgain();
  };

  // USED FOR DRAWING
  useEffect(() => {
    canvas1 = document.getElementById('canvas');
    ctx1 = canvas1.getContext('2d');

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Overwrite canvas
    context.canvas.width = settings.canvasWidth;
    context.canvas.height = settings.canvasHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);

    if(points["point1"].drawOuter){
      drawIntersect(context);
    }

    // Draw markers
    for(const [key, item] of Object.entries(points)){
      draw(context, item.color, item.x, item.y)

      if(points[key].drawOuter){
        drawOuter(context, key);
      }
    }

    // Draw goal point
    draw(context, goalPoint.color, goalPoint.x, goalPoint.y)
  }, [points]);

  const runAgain = () => {
    if(!reRun) {
      props.onGuessedPosition({x: null, y: null});
      props.onAllPositions([]);

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
    }

    // Randomize all points && Start
    var calculatedPoints = {
      "point1": {"x": 0, "y": 0},
      "point2": {"x": 0, "y": 0},
      "point3": {"x": 0, "y": 0},
    }

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

    if(totalRuns.val > 1){
      totalRuns.val = totalRuns.val + 1;
    }
    else{
      setTotalruns({val: totalRuns.val + 1});
    }

    props.onTotalRuns(totalRuns.val);
  };

  return (
      <div>
        <canvas id="canvas" ref={canvasRef}/>
        <Button onClick={simulateRerun}>Simulate rerun of approximation</Button>
      </div>
  );
}

export default AreaCanvas;
