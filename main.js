//var c = document.getElementById("canvas");

//const { sha } = require("hash.js");

//var ctx = c.getContext("2d");

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
            .register("./serviceWorker.js")
            .then((res) => console.log("service worker registered"))
            .catch((err) => console.log("service worker not registered", err));
    });
}

var time = true;
var clearScreen = false;
var mouseGrav = false;
var centerGrav = 1;
var timeSpeed = 1;

function startGame() {
    myGameArea.start();
    myGamePieces = [];
    myGamePieces = [
        new entity(20, "blue", 10, 120, 0.5),
        new entity(20, "red", 500, 120, 2),
        new entity(20, "green", 400, 120, 1),
        new entity(20, "orange", 500, 150, 1),
    ];
}

function averagemovements() {
    var totalspeedvector = new Vector(0, 0);
    array.forEach((a) => {
        totalspeedvector = totalspeedvector.add(a);
    });
    totalspeedvector.multiply((1 / myGamePieces.count) * -1);
    array.forEach((a) => {
        a.speed = a.speed.add(totalspeedvector);
    });
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    dotProduct(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    get direction() {
        return Math.atan2(this.x, this.y);
    }
}

function entity(radius, color, x, y, speedMod) {
    this.speedMod = speedMod;
    this.radius = radius;
    this.speed = new Vector(0, 0);
    this.pos = new Vector(x, y);
    this.search = function() {
        var tmpmouse = mousePos;
        if (!mouseGrav) {
            tmpmouse = new Vector(
                myGameArea.canvas.width / 2,
                myGameArea.canvas.height / 2
            );
        }
        this.speed = this.speed.add(
            tmpmouse
            .subtract(this.pos)
            .add(tmpmouse.subtract(this.pos))
            .multiply(0.0005)
            .multiply(speedMod)
        );

        //make sure pieces try to avoid eachother;
        myGamePieces.forEach((a) => {
            if (a.pos != this.pos) {
                this.speed = this.speed.add(
                    a.pos
                    .subtract(this.pos)
                    .multiply(
                        (a.speedMod * this.speedMod) /
                        this.pos.subtract(a.pos).magnitude /
                        4
                    )
                );
                if (a.pos.subtract(this.pos).magnitude < 50)
                    this.speed = this.speed.add(
                        a.pos
                        .subtract(this.pos)
                        .multiply(
                            ((a.speedMod * this.speedMod) /
                                this.pos.subtract(a.pos).magnitude) *
                            -4
                        )
                    );
            }
        });
        this.speed = this.speed.multiply(timeSpeed).multiply(time);
    };

    this.update = function() {
        // Set update locations from speed

        if (
            this.pos.x + this.speed.x > 0 &&
            this.pos.x + this.speed.x + this.radius < myGameArea.canvas.width &&
            time
        ) {
            this.pos.x += this.speed.x;
        }
        if (
            this.pos.y + this.speed.y > 0 &&
            this.pos.y + this.speed.y + this.radius < myGameArea.canvas.height &&
            time
        ) {
            this.pos.y += this.speed.y;
        }

        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    };

    this.contains = function(vector) {
        return this.pos.subtract(vector).magnitude < this.radius;
    };
}

var mousePos = new Vector(0, 0);

function updateGameArea() {
    if (clearScreen) myGameArea.clear();
    myGamePieces.forEach((a) => {
        if (time) {
            a.search();
        }
        averagemovements;

        a.update();
    });
}

var myGameArea = {
    canvas: document.getElementById("canvas"),
    start: function() {
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 10);
        this.canvas.addEventListener("mousemove", function(evt) {
            mousePos = getMousePos(canvas, evt);
        });
        this.canvas.addEventListener("click", function(evt) {
            addItemOnClick();
        });
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
};

document.body.onkeydown = function(e) {
    if (e.keyCode == 32) {
        //spacebar
        fliptime();
    }
    if (e.keyCode == 13) {
        //enter
        flipgrav();
    }
};

function fliptime() {
    time = !time;
}

function flipgrav() {
    mouseGrav = !mouseGrav;
}

function checkclearer() {
    clearScreen = !clearScreen;
}

document
    .getElementById("timeSlider")
    .addEventListener("change", function(evt) {
        timeSpeed = document.getElementById("timeSlider").value / 100;
    });

function addItemOnClick() {
    var size = document.getElementById("sizeSlider").value;
    var speed = document.getElementById("speedSlider").value / 10;
    var color = document.getElementById("color").value;
    var clickedOnSomething = false;
    myGamePieces.forEach(function(item, index, object) {
        if (item.contains(mousePos)) {
            object.splice(index, 1);
            clickedOnSomething = true;
        }
    });
    if (!clickedOnSomething)
        myGamePieces.push(new entity(size, color, mousePos.x, mousePos.y, speed));
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return new Vector(evt.clientX - rect.left, evt.clientY - rect.top);
}