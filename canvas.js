var ship = new Image(),
    plume = new Image();

var plumes = {},
    can = document.getElementById('canvas1'),
    legend = document.getElementById('legend'),
    ctx, lgd,
    plumeRate = 0;

var rocket, x, y, accel, vel;

var tickCount, secondCount = 0;

function setup(){
  setDefaults();
  ship.src = "/Users/Alex/Work/lab/pid-canvas-ship/rocket-ship.svg";
  plume.src = "/Users/Alex/Work/lab/pid-canvas-ship/cloud.svg";
  window.requestAnimationFrame(loop);
}

function setDefaults(){
  rocket = 'undefined';
  x = can.width/2-100;
  y = can.height-210;
  mass = weight(100); // kg
  // accel = speed(0); // m/s_2
  accel = vector(speed(0), speed(0));
  // grav = speed(9.8);  // m/s_2
  grav = vector(speed(0), speed(9.8));
  // vel = speed(0); // m/s
  vel = vector(speed(0), speed(0)); // m/s
  r   = Math.PI/180 * 0;
  thrust = vector(0, 0); // kgm/s_2
  tickCount = 0;
  secondCount = 0;
}

function loop(){
  //ALL
  ctx = can.getContext('2d');

  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0, 0, can.width, can.height); // clear canvas





  //ROCKET
  if(rocket === 'undefined'){
    rocket = new Rocket(200, 200);
  }

  ctx.save();

  // ctx.drawImage(ship, rocket.x(), rocket.y(), rocket.width, rocket.height);

  drawRotatedImage(ship, rocket.x(), rocket.y(), rocket.width, rocket.height, rocket.r(), ctx);

  //PLUME
  if(Math.floor(tickCount/plumeRate) === tickCount/plumeRate && (thrust.y > 0 || thrust.x != 0)){
    var newPlume = new Plume(80, 80);
    plumes[newPlume.id] = newPlume;
  }

  for(var p in plumes){
    var exPlume = plumes[p];
    ctx.drawImage(plume, exPlume.x, exPlume.y, exPlume.width, exPlume.height);
  }





  //LEGEND
  legend.width = legend.width;
  legend.height = legend.height
  lgd = legend.getContext('2d');

  lgd.globalCompositeOperation = 'destination-over';
  lgd.clearRect(0, 0, lgd.width, lgd.height); // clear canvas

  var velStartY = legend.height/2,
      velStartX = legend.width/2,
      velYVector = velStartY - (vel.y * 30),
      velXVector = velStartX - (vel.x * -30);

  vectorVelocityArrow(lgd, velStartX, velStartY, velXVector, velYVector);

  var thrustStartY = legend.height/2 - 100,
      thrustStartX = legend.width/2 + 40,
      thrustYVector = thrustStartY - (thrust.y * -30000),
      thrustXVector = thrustStartX - (thrust.x * -30000);

  vectorThrustArrow(lgd, thrustStartX, thrustStartY, thrustXVector, thrustYVector);





  //PID

  //0.5 - 2 seconds
  if(tickCount <= 120){
    thrust = vector(force(0), force(100));
  }

  //2 seconds - 5 seconds
  if(tickCount >= 120 && tickCount <= 300){

  }

  //5 seconds - 10 seconds
  if(tickCount >= 300 && tickCount <= 600){

  }


  if(rocket.y() >= can.height){
    setDefaults();
  }





  //ALL
  tickCount++;

  accel = vector((thrust.x / mass/2), (thrust.y / mass) - grav.y);
  vel = vector(vel.x + accel.x, (vel.y + accel.y) < 0 - 5.4 ? 0 - 5.4 : vel.y + accel.y);

  plumeRate = Math.round(20 - vel.y * 3);

  window.requestAnimationFrame(loop);

  log();
}

function reset(){
  setDefaults();
}

function weight(val){
  return val * 0.001;
}

function speed(val){
  return val * 0.001;
}

function force(val){
  return val * 0.00001;
}

function vector(x, y){
  return {
    x: x,
    y: y
  }
}

function Rocket(width, height){
  var rocket = {};

  rocket.x = function(curr){
    var newX = (rocket._x || x) + vel.x;
    rocket._x = newX;
    return newX;
  };

  rocket.y = function(curr){
    var newY = (rocket._y || y) - Math.round(vel.y * 100) / 100;

    rocket._y = newY;
    return newY;
  };

  rocket.r = function(curr){
    var newR = (rocket._r || r) + vel.x;

    rocket._r = newR;
    // console.log(newR);
    return newR;
  }

  rocket.width = rocket.width || width;
  rocket.height = rocket.height || height;
  rocket.center = rocket.height / 2;

  return rocket;
}

function Plume(width, height){
  var plume = {},
      randScale = Math.random();

  if(randScale < 0.4){
    randScale = 0.4;
  }
  if(randScale > 0.6){
    randScale = 0.6;
  }

  plume.time   = 10;
  plume.width  = width * randScale;
  plume.height = height * randScale;
  plume.x      = (rocket.x() + 67) + 10* (1.8 - randScale) + rocket.r() * -2;
  plume.y      = rocket.y() + 110 + (Math.abs(rocket.r()) * -1);
  plume.id     = "PLUME-" + Math.ceil(Math.random() * 100000);

  plume.int = setInterval(function(){
    plume.width  -= 0.1;
    plume.height -= 0.1;
    plume.x      -= 0.075;
    plume.y      += 0.5;

    if(plume.width < 0.2){
      clearInterval(plume.int);
      delete plumes[plume.id];
    }
  }, plume.time);

  return plume;
}

function drawRotatedImage(image, x, y, w, h, angle, context){
    // save the current co-ordinate system
    // before we screw with it
    context.save();

    // move to the middle of where we want to draw our image
    context.translate(x + image.width/2, y);

    // rotate around that point, converting our
    // angle from degrees to radians
    context.rotate(angle * (Math.PI/180));

    // draw it up and to the left by half the width
    // and height of the image
    context.drawImage(image, -(image.width/2), -(image.height/2), w, h);

    // and restore the co-ords to how they were when we began
    context.restore();
}

function vectorVelocityArrow(context, fromx, fromy, tox, toy){
  var headlen = 5,
      angle = Math.atan2(toy - fromy, tox - fromx);

  context.beginPath();
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(tox-headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  context.moveTo(tox, toy);
  context.lineTo(tox-headlen * Math.cos(angle + Math.PI / 6),toy - headlen * Math.sin(angle + Math.PI / 6));

  if(accel.y > 0){
    context.strokeStyle = "#7CFC00";
    context.fillStyle = "#7CFC00";
  } else {
    context.strokeStyle = "#AA0114";
    context.fillStyle = "#AA0114";
  }

  context.font = "12px Arial";

  context.stroke();
  context.stroke();

  var vx = Math.abs(vel.x),
      vy = Math.abs(vel.y),
      vh = Math.round(Math.sqrt(vx*vx + vy*vy) * 10);

  context.fillText("v^: " + vh + " m/s", tox + 10, toy + 5);
}

function vectorThrustArrow(context, fromx, fromy, tox, toy){
  var headlen = 5,
      angle = Math.atan2(toy - fromy, tox - fromx);

  context.beginPath();
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(tox-headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  context.moveTo(tox, toy);
  context.lineTo(tox-headlen * Math.cos(angle + Math.PI / 6),toy - headlen * Math.sin(angle + Math.PI / 6));

  if(thrust.y > 0){
    context.strokeStyle = "blue";
    context.fillStyle = "blue";
  } else {
    context.strokeStyle = "#551a8b";
    context.fillStyle = "#551a8b";
  }

  context.font = "12px Arial";

  context.stroke();
  context.stroke();

  var tx = Math.abs(thrust.x),
      ty = Math.abs(thrust.y),
      th = Math.round(Math.sqrt(tx*tx + ty*ty) * 100000);

  context.fillText("t^: " + th + " kgm/s2", tox + 10, toy + 5);
}

function log (){
  document.getElementById('altitude').innerHTML = "x: " + Math.round(((400 - rocket.x()) / 9.8) * -1) + " m <br/> y: " + Math.round((790 - rocket.y())/9.8) + " m";
  document.getElementById('mass').innerHTML = Math.round(mass * 1000) + " kg";
  document.getElementById('velocity').innerHTML = "x: " + (vel.x * 10).toFixed(2) + " m/s" + "<br /> y: " + (vel.y * 10).toFixed(2) + " m/s";
  document.getElementById('acceleration').innerHTML = "x: " + (accel.x * 1000).toFixed(2) + " m/s<sup>2</sup>" + "<br/> y: " + (accel.y * 1000).toFixed(2) + " m/s<sup>2</sup>";
  document.getElementById('thrust').innerHTML = "x: " + (thrust.x * 100000).toFixed(2) + " kgm/s<sup>2</sup> <br/>y: " + (thrust.y * 100000).toFixed(2) + " kgm/s<sup>2</sup>";
  document.getElementById('gravity').innerHTML = grav.y * 1000 + " m/s<sup>2</sup>";
  document.getElementById('seconds').innerHTML = secondCount + "<sup></sup>";
}

function leftHandler(){
  thrust.x -= speed(0.1);
}
function upHandler(){
  thrust.y += speed(0.1);
}
function rightHandler(){
  thrust.x += speed(0.1);
}
function downHandler(){
  if((thrust.y -= speed(0.1)) > 0){
    thrust.y -= speed(0.1);
  } else new Promise(function(resolve, reject) {
    thrust.y = 0;
  });
}

document.addEventListener('keydown', function(event) {
  if(event.keyCode == 37) {
      leftHandler();
  } else if(event.keyCode == 38) {
      upHandler();
  } else if(event.keyCode == 39) {
      rightHandler();
  } else if(event.keyCode == 40) {
      downHandler();
  }
});

setup();
