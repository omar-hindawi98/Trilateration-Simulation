function calculateThreeCircleIntersection(x0, y0, r0,
                                                x1, y1, r1,
                                                 x2, y2, r2){
    var a, dx, dy, d, h, rx, ry;
    var point2_x, point2_y;

    /* dx and dy are the vertical and horizontal distances between
    * the circle centers.
    */
    dx = x1 - x0;
    dy = y1 - y0;

    /* Determine the straight-line distance between the centers. */
    d = Math.sqrt((dy*dy) + (dx*dx));

    /* Check for solvability. */
    if (d > (r0 + r1))
    {
        /* no solution. circles do not intersect. */
        return false;
    }
    if (d < Math.floor(Math.abs(r0 - r1)))
    {
        /* no solution. one circle is contained in the other */
        return false;
    }

    /* 'point 2' is the point where the line through the circle
    * intersection points crosses the line between the circle
    * centers.
    */

    /* Determine the distance from point 0 to point 2. */
    a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

    /* Determine the coordinates of point 2. */
    point2_x = x0 + (dx * a/d);
    point2_y = y0 + (dy * a/d);

    /* Determine the distance from point 2 to either of the
    * intersection points.
    */
    h = Math.sqrt((r0*r0) - (a*a));

    /* Now determine the offsets of the intersection points from
    * point 2.
    */
    rx = -dy * (h/d);
    ry = dx * (h/d);

    /* Determine the absolute intersection points. */
    let intersectionPoint1_x = point2_x + rx;
    let intersectionPoint1_y = point2_y + ry;


    return {
        x: intersectionPoint1_x,
        y: intersectionPoint1_y
    };
}

function union_arrays (x, y) {
    let res = [];

    for(let i = 0; i < x.length; i++) {
        for (let j = 0; j < y.length; j++) {
            if (x[i].x === y[j].x && x[i].y === y[j].y || x[i].point) {
                res.push(x[i]);
                break;
            }
        }
    }

    return res;
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

module.exports = {
  calculateThreeCircleIntersection: calculateThreeCircleIntersection,
  getRandomArbitrary: getRandomArbitrary,
    union_arrays: union_arrays
};
