import React, { useRef,useEffect, useState } from 'react'
import Point from './../class/Point'
import {getRandomArbitrary} from './../functions/functions'

import settings from './../settings'

function GridCanvas(props) {
  const canvasRef = useRef(null)
  const [points, setPoints] = useState({
    "point1": new Point("green", 0, 0),
    "point2": new Point("red", 0,0),
    "point3": new Point("blue", 0, 0)})

  const [goalPoint, setGoalPoint] = useState(new Point("black", 0, 0));

  const [squaresAroundList, setSquaresAroundList] = useState({});
  const [squareUnion, setSquareUnion] = useState([]);

  // Draws circles
  const draw = (ctx, color, x, y) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, props.dotSize, 0, 2*Math.PI)
    ctx.fill()
  }

  const drawSquare = (ctx, key, x, y) => {
    if(key === "point1")
      ctx.fillStyle = "#8bf38b";
    else if(key === "point2")
      ctx.fillStyle = "#ff8787";
    else if(key === "point3")
      ctx.fillStyle = "#6c96ff";
    else if(key === "intersect")
      ctx.fillStyle = "purple";

    ctx.fillRect(x*props.gridSize + 2, y*props.gridSize + 2, props.gridSize - 4, props.gridSize - 4);
  }

  // Moves a point
  const movePoint = (point, x, y) => {
    points[point].x = x;
    points[point].y = y;
    setPoints({...points});
  }

  // Calculate distance to goalpoint
  const calculateSquare = (x, y) => {
    return {
      "x": Math.floor(x/props.gridSize),
      "y": Math.floor(y/props.gridSize)
    }
  }

  const calculateDistanceSquare = (key) => {
    return Math.sqrt(
      Math.pow(calculateSquare(points[key].x, points[key].y).x - calculateSquare(goalPoint.x, goalPoint.y).x,2)
      +
      Math.pow(calculateSquare(points[key].x, points[key].y).y - calculateSquare(goalPoint.x, goalPoint.y).y,2)
    )
  }

  const calculateDistanceXY = (x, y) => {
    return Math.sqrt(Math.pow(x - goalPoint.x, 2) + Math.pow(y - goalPoint.y, 2))
  }

  const setPointInterval = (key, interval) => {
    points[key].interval = interval;
    setPoints({...points});
  }

  const clearPointInterval = (key) => {
    if(points[key].interval)
      clearInterval(points[key].interval);
    points[key].interval = null;
    setPoints({...points});
  }

  // Calculate point
  const calculatePoint = (key) => {
    if(calculateDistanceSquare(key) > props.gridDistance + 0.5){
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
        calculateGrid(key);
    }
  }

  const addToSquareList = (key, squareList) => {
    squaresAroundList[key] = squareList;
    setSquaresAroundList(squaresAroundList);
  }

  const calculateGrid = (key) => {
    let squarePos = calculateSquare(points[key].x, points[key].y);
    let squaresAround = [];

    // Top left point
    let startPos = {x: squarePos.x - props.gridDistance, y: squarePos.y - props.gridDistance}
    // Total rows & columns to check
    let toCheck = 3 + 2*(props.gridDistance-1);

    // Iterate through all squares around
    for(let x = 0; x < toCheck; x++){
      for(let y = 0; y < toCheck; y++){
        let addX = x + startPos.x;
        let addY = y + startPos.y;

        // skip negative values
        if(addX < 0 || addY < 0)
          continue;

        // Add to squaresAround
        squaresAround.push({x: addX, y: addY});
      }
    }
    addToSquareList(key, squaresAround);
    if(Object.keys(squaresAroundList).length === 3){
      calculateGridIntersection();
    }
  }

  const calculateGridIntersection = () => {
    var counts = {};
    squaresAroundList["point1"].forEach(function(x) { counts[JSON.stringify(x)] = (counts[JSON.stringify(x)] || 0)+1; });
    squaresAroundList["point2"].forEach(function(x) { counts[JSON.stringify(x)] = (counts[JSON.stringify(x)] || 0)+1; });
    squaresAroundList["point3"].forEach(function(x) { counts[JSON.stringify(x)] = (counts[JSON.stringify(x)] || 0)+1; });

    var result = [];

    for(const [key, item] of Object.entries(counts)){
      if(item === 3)
        result.push(JSON.parse(key));
    }

    let guessSquare = result[Math.floor(Math.random() * result.length)];

    let guessPos = {
      x: Math.floor(getRandomArbitrary(guessSquare.x*props.gridSize, (guessSquare.x + 1)*props.gridSize)),
      y: Math.floor(getRandomArbitrary(guessSquare.y*props.gridSize, (guessSquare.y + 1)*props.gridSize))
    }

    setSquareUnion(result);

    props.onAroundList(result);
    props.onGuessedPosition(guessPos);
    props.onGuessedSquare(guessSquare);
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
    props.onGuessedPosition({x: null, y: null});
    props.onGuessedSquare({x: null, y: null});
    props.onAroundList([]);


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

      setPointInterval(key, setInterval(() => {
        calculatePoint(key);
      }, props.speed))
    }

    // Unmount all
    return () => {
      clearPointInterval("point1");
      clearPointInterval("point2");
      clearPointInterval("point3");
    }
  }, []);

  const drawLineGrid = (ctx, x, y) => {
    ctx.strokeStyle = "black";
    // vertical lines
    if(y === 0){
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, settings.canvasHeight);
      ctx.stroke();
    }
    // horizontal lines
    else{
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(settings.canvasWidth, y);
      ctx.stroke();
    }
  }

  // USED FOR DRAWING
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Overwrite canvas
    context.canvas.width = settings.canvasWidth;
    context.canvas.height = settings.canvasHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for(let i = 0; i < Math.ceil((settings.canvasWidth)/props.gridSize); i++){
      drawLineGrid(context, i*props.gridSize, 0);
    }

    for(let i = 0; i < Math.ceil((settings.canvasHeight)/props.gridSize); i++){
      drawLineGrid(context, 0, i*props.gridSize);
    }

    // Draw squares
    for(const key of Object.keys(points)){
      if(squaresAroundList[key]){
        squaresAroundList[key].forEach((item) => {
          drawSquare(context, key, item.x, item.y);
        });
      }
    }

    if(squareUnion.length > 0){
      squareUnion.forEach((item) => {
        drawSquare(context, "intersect", item.x, item.y);
      });
    }

    // Draw markers
    for(const item of Object.values(points)){
      draw(context, item.color, item.x, item.y)
    }

    // Draw goal point
    draw(context, goalPoint.color, goalPoint.x, goalPoint.y)
  }, [points, squaresAroundList, squareUnion])

  return (
    <canvas ref={canvasRef}/>
  );
}

export default GridCanvas;
