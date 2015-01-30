var canvas, stage;
var mouseTarget;
var dragStarted;
var offset;
var update = false, collision = false;
var marcador, gameover, reintentarlo;
var animation;
var arrBricks = [];
var espacio = 10;
var time = 0;
var bitmapY = 0;
var niveles = 9;

function init() {
    time = 0;
    canvas = document.getElementById("testCanvas");
    stage = new createjs.Stage(canvas);

    createjs.Touch.enable(stage);

    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true;

    marcador = new createjs.Text("0 sec.", "bold 20px Cursive", "#1FF38F");
    marcador.x = canvas.width - 100;
    marcador.y = 20;
    marcador.textBaseline = "alphabetic";

    gameover = new createjs.Text("GAME OVER", "40px Cursive", "#FF7700");
    gameover.x = canvas.width / 2 - 125;
    gameover.y = 40;
    gameover.scaleX = 0.1;
    gameover.scaleY = 0.1;
    gameover.visible = false;
    gameover.textBaseline = "alphabetic";

    var data = {
        images: ["sprite.png"],
        frames: {width: 149, height: 203},
        animations: {
            stand: {
                frames: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                speed: 0.1
            }
        }
    };

    var x = 500, y = 0;
    var contador = 0;
    for (var i = 0; i < 50; i++) {
        if (contador === 0) {
            x += 200;
            y = Math.floor((Math.random() * niveles)) * 32 - 32;
            do {
                y = Math.floor((Math.random() * niveles)) * 32 - 32;
            } while (!(i === 0) && arrBricks[i - 5].y === y);
            var bitmap_temp = new createjs.Bitmap("cactus_ini.png");
            contador++;
        } else if (contador === 4) {
            var bitmap_temp = new createjs.Bitmap("cactus_end.png");
            contador = 0;
        } else {
            var bitmap_temp = new createjs.Bitmap("cactus.png");
            contador++;
        }

        bitmap_temp.x = x;
        bitmap_temp.y = y;
        y += 32;
        stage.addChild(bitmap_temp);
        arrBricks[i] = bitmap_temp;
    }

    var spriteSheet = new createjs.SpriteSheet(data);
    animation = new createjs.Sprite(spriteSheet, "stand");
    animation.x = canvas.width / 2;
    animation.y = canvas.height / 2 - 50;
    animation.scaleX = 0.4;
    animation.scaleY = 0.4;
    animation.cursor = "pointer";
    stage.addChild(animation);

    animation.addEventListener("pressmove", function(evt) {
        var o = evt.target;
        o.x = evt.stageX + o.offset.x;
        o.y = evt.stageY + o.offset.y;
    });

    animation.addEventListener("mousedown", function(evt) {
        var o = evt.target;
        o.parent.addChild(o);
        o.offset = {x: o.x - evt.stageX, y: o.y - evt.stageY};
        update = true;
    });

    animation.addEventListener("pressup", function(evt) {
        update = false;
        boolSound = true;
    });
    var boolSound = true;
    animation.addEventListener("rollover", function(evt) {
        if (boolSound) {
            createjs.Sound.play("balloon");
        }
        var o = evt.target;
        o.scaleX = o.scaleY = 0.45;
        boolSound = false;
    });

    animation.addEventListener("rollout", function(evt) {
        var o = evt.target;
        o.scaleX = o.scaleY = 0.4;
    });

    stage.addChild(marcador);
    stage.addChild(gameover);

    reintentarlo = new createjs.Text("Volver a jugar", "30px Cursive", "#FFF");
    reintentarlo.x = canvas.width / 2 - reintentarlo.getMeasuredWidth() / 2;
    reintentarlo.y = canvas.height - 40;
    reintentarlo.visible = false;
    reintentarlo.textBaseline = "alphabetic";

    stage.addChild(reintentarlo);

    var hit = new createjs.Shape();
    hit.graphics.beginFill("#000000").drawRect(0, -1 * reintentarlo.getMeasuredHeight(), reintentarlo.getMeasuredWidth(), reintentarlo.getMeasuredHeight());
    hit.visible = false;
    reintentarlo.hitArea = hit;
    reintentarlo.on("click", init);
    //reintentarlo.on("rollover", playOverSound);
    reintentarlo.cursor = "pointer";

    createjs.Ticker.addEventListener("tick", demo1_tick);
}

function playOverSound() {
    createjs.Sound.play("controls");
}

function stop() {
    createjs.Ticker.removeEventListener("tick", demo1_tick);
}

function demo1_tick(event) {
    if (update) {
        stage.update(event);
        moveBricks();
        time++;
        marcador.text = (time / 10) + " sec.";
        if (time % 50 === 0) {
            espacio++;
        }
    }
    stage.update(event);
}

function moveBricks() {
    var one = true;
    for (var i = 0; i < arrBricks.length; i++) {
        collision = ndgmr.checkPixelCollision(animation, arrBricks[i], 1, true);
        if (collision && one) {
            animation.removeAllEventListeners();
            createjs.Sound.play("explosion");
            one = false;
            createjs.Tween.get(gameover).set({visible: true}).to({x: canvas.width / 2 - gameover.getMeasuredWidth() / 2, y: 40, scaleX: 1, scaleY: 1}, 1000);
            createjs.Tween.get(reintentarlo).set({visible: true}).to({scaleX: 1, scaleY: 1}, 1000);
            createjs.Tween.get(reintentarlo, {loop: true}).to({scaleX: 1.1, scaleY: 1.1}, 1000).to({scaleX: 1, scaleY: 1}, 1000);
            createjs.Tween.get(marcador).to({x: canvas.width / 2 - marcador.getMeasuredWidth() / 2 - 44, y: canvas.height / 2, scaleX: 2.3, scaleY: 2.3}, 2000, createjs.Ease.bounceOut);
            update = false;
        }
        if (i % 5 === 0) {
            if (!one) { //Es para que alcanze todos los bloques de una pared, antes de quebrar el for y dejar de consumir recursos.
                break;
            }
            do {
                bitmapY = Math.floor((Math.random() * niveles)) * 32 - 32;
            } while (!(i === 0) && arrBricks[i - 5].y === bitmapY);
        }
        arrBricks[i].x -= espacio;

        if (arrBricks[i].x < -20) {
            arrBricks[i].x += 2000;
            arrBricks[i].y = bitmapY;
        }
        bitmapY += 32;
    }
}

$(function() {
    init();
    loadSound();
    window.addEventListener('resize', resize, false);
    resize();
});

function loadSound() {
    createjs.Sound.registerSound("balloon.mp3", "balloon");
    createjs.Sound.registerSound("controls.mp3", "controls");
    createjs.Sound.registerSound("explosion.mp3", "explosion");
}

function resize() {
    $("#testCanvas").width($("#container").width());
}
