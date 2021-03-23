//var c = document.getElementById("canvas");
//var ctx = c.getContext("2d");
function startGame() {
    myGameArea.start();
    myGamePiece = new sq(30, 30, "blue", 10, 120);
}

function sq(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedx = 2;
    this.speedy = 2;
    this.x = x;
    this.y = y;

    this.search = function() {};

    this.update = function() {
        // Set update locations from speed
        if (
            this.x + this.speedx > 0 &&
            this.x + this.speedx + this.width < myGameArea.canvas.width
        ) {
            this.x += this.speedx;
        }
        if (
            this.y + this.speedy > 0 &&
            this.y + this.speedy + this.height < myGameArea.canvas.height
        ) {
            this.y += this.speedy;
        }

        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
}

var mousePos;

function updateGameArea() {
    myGameArea.clear();
    myGamePiece.update();
}

var myGameArea = {
    canvas: document.getElementById("canvas"),
    start: function() {
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
        this.canvas.addEventListener("mousemove", function(evt) {
            mousePos = getMousePos(canvas, evt);
        });
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
};

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
    };
}