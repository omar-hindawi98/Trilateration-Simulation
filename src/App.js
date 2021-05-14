import './App.css';

import React, {  useState } from 'react'

import DecreasingCanvas from './components/DecreasingCanvas'
import GridCanvas from './components/GridCanvas'
import AreaCanvas from './components/AreaCanvas'

import {Button, Container,Form, Row, Col} from 'react-bootstrap'
import RangeSlider from 'react-bootstrap-range-slider';
import {ArrowRepeat} from 'react-bootstrap-icons'

function App() {
  const [canvasSet, setCanvasSet] = useState("DECREASING");

  // SPEED FOR ANIMATION
  const [speed, setSpeed] = useState(10);
  const [radiusSpeed, setRadiusSpeed] = useState(30);

  const [dotSize, setDotsize] = useState(5);
  const [fixedDot, setFixedDot] = useState(false);

  // MAX DISTANCE & ERROR MARGIN
  const [maxDistance, setMaxDistance] = useState(100);
  const [errorMargin, setErrorMargin] = useState(200);

  // GRID VALUES
  const [gridDistance, setGridDistance] = useState(1);
  const [gridSize, setGridSize] = useState(60);

  // Result
  const [goalPoint, setGoalPoint] = useState({x: null, y: null});
  const [guessedPosition, setGuessedPosition] = useState({x: null, y: null});
  const [guessedSquare, setGuessedSquare] = useState({x: null, y: null});
  const [allPositions2, setAllPositions2] = useState([]);
  const [totalRuns, setTotalruns] = useState(0);
  const [aroundList, setAroundList] = useState([]);

  const downloadPositions = () => {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allPositions2, null, "\t"));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download",  "data.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  const reload = () => {
    let savedState = canvasSet;
    setCanvasSet("RELOAD");
    setTimeout(() => {
      setCanvasSet(savedState);
    }, 5);
  };

  // RENDER CANVAS
  var renderCanvas;

  if (canvasSet === "DECREASING"){
    renderCanvas = <div>
      <h1>Intersection Point</h1>
      <i>This method calculates the exact position by decreasing the radius of each point until an intersection of all circles is found.</i>
      <DecreasingCanvas  speed={speed}
                         radiusSpeed={radiusSpeed}
                         maxDistance={maxDistance}
                         errorMargin={errorMargin}
                         dotSize={dotSize}
                         fixedDot={fixedDot}
                         onGoalPosition={(x, y) => setGoalPoint({x: x, y: y})}
                         onGuessedPosition={(x,y) => setGuessedPosition({x: x, y: y})}/>
    </div>
  }
  else if(canvasSet === "AREA"){
    renderCanvas = <div>
      <h1>Intersection Area</h1>
      <i>This method randomly guesses a position that is inside of the intersection area of all circles.</i>
      <AreaCanvas  speed={speed}
                                radiusSpeed={radiusSpeed}
                                maxDistance={maxDistance}
                                errorMargin={errorMargin}
                                dotSize={dotSize}
                                fixedDot={fixedDot}
                                onGoalPosition={(x, y) => setGoalPoint({x: x, y: y})}
                                onAllPositions={(list) => setAllPositions2(list)}
                                onGuessedPosition={(pos) => setGuessedPosition(pos)}
                                onTotalRuns={(runs) => setTotalruns(runs)}/>
    </div>
  }
  else if(canvasSet === "GRID"){
    renderCanvas = <div>
      <h1>Grid Intersection</h1>
      <i>This method finds the grid that the goal point is located in. It tries to guess the position of the goal point inside this grid.</i>
      <GridCanvas  speed={speed}
                                errorMargin={errorMargin}
                                gridSize={gridSize}
                                gridDistance={gridDistance}
                                dotSize={dotSize}
                                fixedDot={fixedDot}
                                onAroundList={(list) => setAroundList(list)}
                                onGuessedSquare={(sq) => setGuessedSquare(sq)}
                                onGoalPosition={(x, y) => setGoalPoint({x: x, y: y})}
                                onGuessedPosition={(sq) => setGuessedPosition(sq)}/>
    </div>
  }

  // RENDER INFO FROM CANVAS
  var renderInfo;
  if (canvasSet === "DECREASING"){
    renderInfo = <div>
      <Container>
        <Row>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>
                Goal Position
              </Form.Label>
              <Form.Control value={"(" + goalPoint.x + ", " + goalPoint.y + ")"} disabled />
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>
                Guessed Position
              </Form.Label>
              <Form.Control value={"(" + guessedPosition.x + ", " + guessedPosition.y + ")"} disabled />
            </Form.Group>
          </Col>
        </Row>
      </Container>
    </div>
  }
  else if(canvasSet === "AREA"){
    renderInfo = <div>
      <Container>
        <Row>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>
                Goal Position
              </Form.Label>
              <Form.Control value={"(" + goalPoint.x + ", " + goalPoint.y + ")"} disabled />
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>
                Guessed Position
              </Form.Label>
              <Form.Control value={"(" + guessedPosition.x + ", " + guessedPosition.y + ")"} disabled />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>
                Total Possible Positions
              </Form.Label>
              <Form.Control value={allPositions2.length} disabled />
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>
                Rate of guessing right
              </Form.Label>
              <Form.Control value={((allPositions2.length) ? (1/allPositions2.length*100).toFixed(3) : 100) + "%"} disabled />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>
                Distance from goal
              </Form.Label>
              <Form.Control value={(allPositions2.length) ? Math.floor(Math.sqrt(Math.pow(guessedPosition.x - goalPoint.x,2) + Math.pow(guessedPosition.y - goalPoint.y,2))): ""} disabled />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>
                Total runs
              </Form.Label>
              <Form.Control value={(totalRuns <= 1) ? totalRuns : totalRuns-1} disabled />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <Form.Group>
              <Form.Label>
                All Points
              </Form.Label><br/>
              <Button block onClick={downloadPositions}>Download</Button>
            </Form.Group>
          </Col>
        </Row>
      </Container>
    </div>
  }
  else if(canvasSet === "GRID"){
    renderInfo = <div>
      <Container>
        <Row>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>
                Goal Position
              </Form.Label>
              <Form.Control value={"(" + goalPoint.x + ", " + goalPoint.y + ")"} disabled />
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>
                Guessed Position
              </Form.Label>
              <Form.Control value={"(" + guessedPosition.x + ", " + guessedPosition.y + ")"} disabled />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>
                Rate of guessing right
              </Form.Label>
              <Form.Control value={((aroundList.length) ? 1/(aroundList.length*gridSize*gridSize)*100 : 100).toFixed(3) + "%" }disabled />
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>
                Guessed square
              </Form.Label>
              <Form.Control value={"(" + guessedSquare.x + ", " + guessedSquare.y + ")"} disabled />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <Form.Group>
              <Form.Label>
                Distance
              </Form.Label>
              <Form.Control value={(guessedSquare.x != null) ? Math.floor(Math.sqrt(Math.pow(guessedPosition.x - goalPoint.x,2) + Math.pow(guessedPosition.y - goalPoint.y,2))): ""} disabled />
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label>Possible Grid Squares</Form.Label>
              <Form.Control as="textarea" value={aroundList.map(e => "(" + e.x + ", " + e.y + ")").join('\r\n')} rows={3} disabled/>
            </Form.Group>
          </Col>
        </Row>
      </Container>
    </div>
  }

  return (
    <div className="App">
      <div className="mt-2 mb-3">
        <h2>Trilateration Simulation</h2>
        <Button
            onClick={() => setCanvasSet("DECREASING")}
        >Intersection Point</Button>
        <Button
            onClick={() => setCanvasSet("AREA")}
        >Intersection Area</Button>
        <Button
            onClick={() => setCanvasSet("GRID")}
        >Grid intersection</Button>
        <Button
            onClick={() => (reload())}
        ><ArrowRepeat size={22} className="ArrowRepeat" /></Button>
      </div>
      <Container className="no">
        <Row>
          <Col>
            {renderCanvas}
          </Col>
          <Col>
            <h2>Data</h2>
            {renderInfo}

            <h2 className="mt-5">Settings</h2>
            <Container>
              <Row>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>
                      Speed
                    </Form.Label>
                    <RangeSlider
                        value={speed}
                        onChange={e => setSpeed(e.target.value)}
                        min={1}
                        max={50}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>
                      Radius Decrease Speed
                    </Form.Label>
                    <RangeSlider
                        value={radiusSpeed}
                        onChange={e => setRadiusSpeed(e.target.value)}
                        min={10}
                        max={100}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>
                      Max Distance
                    </Form.Label>
                    <RangeSlider
                        value={maxDistance}
                        onChange={e => setMaxDistance(e.target.value)}
                        min={10}
                        max={200}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>
                      Error Margin
                    </Form.Label>
                    <RangeSlider
                        value={errorMargin}
                        onChange={e => setErrorMargin(e.target.value)}
                        min={0}
                        max={300}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>
                      Grid Size
                    </Form.Label>
                    <RangeSlider
                        value={gridSize}
                        onChange={e => setGridSize(e.target.value)}
                        min={10}
                        max={300}
                        step={30}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>
                      Grid Max Distance
                    </Form.Label>
                    <RangeSlider
                        value={gridDistance}
                        onChange={e => setGridDistance(e.target.value)}
                        min={1}
                        max={3}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>
                      Dot Size
                    </Form.Label>
                    <RangeSlider
                        value={dotSize}
                        onChange={e => setDotsize(e.target.value)}
                        min={1}
                        max={5}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mt-4">
                    <Form.Check type="checkbox" label="Fixed dot" onChange={e => (setFixedDot(e.target.checked))} />
                  </Form.Group>
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
