// Set up canvas
var PIXEL_RATIO = window.devicePixelRatio

createHiDPICanvas = function(w, h, ratio) {
    if (!ratio) { ratio = PIXEL_RATIO; }
    var can = document.createElement("canvas");
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    //can.style.border = "1px solid black"
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
}

scale = 2
//Create canvas with the device resolution.
let canvas = createHiDPICanvas(0.95*window.innerWidth, 0.95*window.innerHeight,scale); // width, height, pixel ratio
document.body.appendChild(canvas)

let ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
///

let gridSize = 11 // 11
const R = 30 // 30
const strokeWidth = R/10 // 2
const eps = strokeWidth/1.25 //buffer
const delta_y = R/2

const PI = Math.PI
const emptyFill = "#EAE7E7"
const activeFill = "#EAE7E7"

const emptyStroke = "#B8B6B6"
const activeStroke = "#000000"
const recentStroke = "#7870B3"
const recentStrokeWidth = strokeWidth*2

const p1Fill = "#FFD9D4"
const p2Fill = "#BAFFDD"
const p1Stroke = "#B37870"
const p2Stroke = "#5FB389"

let switchedThisTurn = null

p1Turn = 1

class Hexagon {
    constructor(x,y){
        this.centerx = x
        this.centery = y
        this.belongs = 0 // 1=p1, 2=p2
        
        // x1 = bottom left point
        // x2 = bottom right
        // Proceed counterclockwise
        this.x1 = x-R*Math.cos(PI/3)
        this.y1 = y+R*Math.sin(PI/3)
        this.x2 = this.x1+R
        this.y2 = this.y1
        this.x3 = this.x2+R*Math.cos(PI/3)
        this.y3 = this.y2-R*Math.sin(PI/3)
        this.x4 = this.x3-R*Math.cos(PI/3)
        this.y4 = this.y3-R*Math.sin(PI/3)
        this.x5 = this.x4-R
        this.y5 = this.y4
        this.x6 = this.x5-R*Math.cos(PI/3)
        this.y6 = this.y5+R*Math.sin(PI/3)
        
        this.xx = [this.x1,this.x2,this.x3,this.x4,this.x5,this.x6]
        this.yy = [this.y1,this.y2,this.y3,this.y4,this.y5,this.y6]
    }
    draw(isRecent){
        ctx.beginPath();
        ctx.moveTo(this.x1,this.y1);
        ctx.lineTo(this.x2,this.y2)
        ctx.lineTo(this.x3,this.y3)
        ctx.lineTo(this.x4,this.y4)
        ctx.lineTo(this.x5,this.y5)
        ctx.lineTo(this.x6,this.y6)
        ctx.closePath()
        
        ctx.strokeStyle = emptyStroke
        if (this.belongs==0){
            if (this.active) {
                ctx.strokeStyle = activeStroke
                ctx.fillStyle = activeFill
            }
            else {
                ctx.strokeStyle = emptyStroke
                ctx.fillStyle = emptyFill
            }
        }
        else if (this.belongs==1){
            ctx.strokeStyle = p1Stroke
            ctx.fillStyle = p1Fill
        }
        else if (this.belongs==2){
            ctx.strokeStyle = p2Stroke
            ctx.fillStyle = p2Fill
        }
        
        ctx.lineWidth = strokeWidth
        if (isRecent) {
            ctx.strokeStyle = recentStroke
            ctx.lineWidth = recentStrokeWidth
        }
        
        ctx.stroke()
        ctx.fill()
    }
    detectMouse(x,y){
        this.active = pnpoly(6,this.xx,this.yy,x,y)
    }
}


function pnpoly( nvert, vertx, verty, testx, testy ) {
    var i, j, c = false;
    for( i = 0, j = nvert-1; i < nvert; j = i++ ) {
        if( ( ( verty[i] > testy ) != ( verty[j] > testy ) ) &&
            ( testx < ( vertx[j] - vertx[i] ) * ( testy - verty[i] ) / ( verty[j] - verty[i] ) + vertx[i] ) ) {
                c = !c;
        }
    }
    return c;
}

function genGrid(n) {
    // calculate margin
    Rb= R + eps
    r = Rb*Math.cos(PI/6) // check wikipedia
    gridwidth = (3*n-1)*Rb
    leftMargin = (canvas.width/scale-gridwidth)/2
    
    x0 = leftMargin+Rb; //add leftmost margin
    y0 = canvas.height/scale/2.;
    grid = []
    for (i=0;i<n;i++){
        row = []
        xi =  x0 + (3/2)*Rb*i
        yi =  y0 + r*i
        for (j=0;j<n;j++) {
            xj = xi+2*r*Math.cos(PI/6)*j
            yj = yi-2*r*Math.sin(PI/6)*j
            row.push(new Hexagon(xj,yj));
        }
        grid.push(row)
    }
    return grid
}

function drawBoundary(n) {
    ctx.lineWidth = strokeWidth
    Rb= R + eps
    gridwidth = (3*n-1)*Rb    
    leftMargin = (canvas.width/scale-gridwidth)/2
        
    x0 = leftMargin; //add leftmost margin
    y0 = canvas.height/scale/2.;
    
    x = x0-eps*Math.cos(PI/3)
    y = y0+eps*Math.sin(PI/3)
    // Bottom left boundary
    ctx.beginPath()
    ctx.moveTo(x, y)
    
    for (i=0;i<2*n-1;i++){
        if (i%2==0){
            x = x + Rb * Math.cos(PI/3)
            y = y + Rb * Math.sin(PI/3)
        }
        else {
            x = x + Rb
        }
        ctx.lineTo(x,y)
    }
    
    x = x + Rb/2 - 1*eps*Math.cos(PI/3)
    ctx.lineTo(x,y)
    
    delta_x = (3/2)*n*Rb + Math.sqrt(3)*delta_y - gridwidth/2.
    ctx.lineTo(x,y+delta_y)
    ctx.lineTo(canvas.width/scale/2 - gridwidth/2.  - delta_x, canvas.height/scale/2+eps*Math.sin(PI/3))
    ctx.closePath()
    ctx.strokeStyle = p1Stroke
    ctx.stroke()
    ctx.fillStyle = p1Fill
    ctx.fill()
    
    
    // Bottom right boundary
    ctx.beginPath()
    x = x + 4*Math.cos(PI/3)*eps   
    ctx.moveTo(x, y)
    x = x + Rb/2 - 1*eps*Math.cos(PI/3)
    ctx.lineTo(x,y)
    
    for (i=0;i<2*n-1;i++){
        if (i%2==0){
            x = x + Rb * Math.cos(PI/3)
            y = y - Rb * Math.sin(PI/3)
        }
        else {
            x = x + Rb
        }
        ctx.lineTo(x,y)
    }
    ctx.lineTo(x+delta_x,y)
    ctx.lineTo(canvas.width/scale/2 + 2*eps*Math.cos(PI/3), canvas.height/scale/2 + n*Rb*Math.cos(PI/6) +delta_y + eps*Math.sin(PI/3) )
    ctx.closePath()
    ctx.strokeStyle = p2Stroke
    ctx.stroke()
    ctx.fillStyle = p2Fill
    ctx.fill()
    
    // Top right boundary
    ctx.beginPath()
    y = y-eps*2*Math.sin(PI/3)
    ctx.moveTo(x, y)
    
    for (i=0;i<2*n-1;i++){
        if (i%2==0){
            x = x - Rb * Math.cos(PI/3)
            y = y - Rb * Math.sin(PI/3)
        }
        else {
            x = x - Rb
        }
        ctx.lineTo(x,y)
    }
    x = x - (Rb/2) + eps*Math.cos(PI/3)
    ctx.lineTo(x,y)
    
    ctx.lineTo(x,y-delta_y)
    ctx.lineTo(canvas.width/scale/2 + gridwidth/2. + delta_x + eps*Math.cos(PI/3), canvas.height/scale/2 - eps*Math.sin(PI/3))
    ctx.closePath()
    ctx.strokeStyle = p1Stroke
    ctx.stroke()
    ctx.fillStyle = p1Fill
    ctx.fill()
    
    // Top left boundary
    ctx.beginPath()
    x = x - 4*eps*Math.cos(PI/3) 
    ctx.moveTo(x, y)
    x = x - Rb/2 + eps*Math.cos(PI/3)
    ctx.lineTo(x,y)
    
    for (i=0;i<2*n-1;i++){
        if (i%2==0){
            x = x - Rb * Math.cos(PI/3)
            y = y + Rb * Math.sin(PI/3)
        }
        else {
            x = x - Rb
        }
        ctx.lineTo(x,y)
    }
    ctx.lineTo(x-delta_x+eps*Math.cos(PI/3),y)
    ctx.lineTo(canvas.width/scale/2- 2*eps*Math.cos(PI/3), canvas.height/scale/2 - n*Rb*Math.cos(PI/6) - delta_y - eps*Math.sin(PI/3))
    ctx.closePath()
    
    ctx.strokeStyle = p2Stroke
    ctx.stroke()
    ctx.fillStyle = p2Fill
    ctx.fill()
} 

gameGrid = genGrid(gridSize)

function update(){
    ctx.clearRect(0,0,canvas.width/scale,canvas.height/scale)
    ctx.save()
    for (i=0;i<gameGrid.length;i++){
        for (j=0;j<gameGrid.length;j++){
            gameGrid[i][j].draw(false)
        }
    }
    if (switchedThisTurn) {
        switchedThisTurn.draw(true)
    }
    ctx.restore()
    drawBoundary(gameGrid.length)
    //ctx.beginPath()
    //ctx.moveTo(canvas.width/scale/2.,0)
    //ctx.lineTo(canvas.width/scale/2.,canvas.height/scale)
    //ctx.lineWidth = 0.1
    //ctx.stroke()
    window.requestAnimationFrame(update)
}

update()
canvas.addEventListener("mousemove",function(e){
    for (i=0;i<gameGrid.length;i++){
        for (j=0;j<gameGrid.length;j++){
            gameGrid[i][j].detectMouse(e.offsetX,e.offsetY)
        }
    }
})


canvas.addEventListener("mouseup",function(e){
    for (i=0;i<gameGrid.length;i++){
        for (j=0;j<gameGrid.length;j++){
            if (gameGrid[i][j].active && !gameGrid[i][j].belongs){
                if (p1Turn){
                    gameGrid[i][j].belongs = 1
                    switchedThisTurn = gameGrid[i][j]
                }
                else {
                    gameGrid[i][j].belongs = 2
                    switchedThisTurn = gameGrid[i][j]
                }
                p1Turn = !p1Turn
            }
        }
    }
})
