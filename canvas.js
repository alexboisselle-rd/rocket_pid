var ship = new Image(),
    plume = new Image();

var plumes = {},
    can = document.getElementById('canvas1'),
    legend = document.getElementById('legend'),
    ctx, lgd,
    plumeRate = 0,
    K_p, K_i, K_d;

var rocket, x, y, accel, vel;

var tickCount, secondCount = 0;

var exportYaw = [],
    exportVel = [],
    exportAccel = [],
    exportE = [],
    exportD = [],
    exportI = [],
    exportP = [],
    yawNeeded, yawDiff, reset, lastError,
    K_p, K_i, K_d, T_i, T_d;

function setup(){
  setDefaults();
  ship.src = "/Users/Alex/Work/lab/pid-canvas-ship/rocket-ship.svg";
  plume.src = "/Users/Alex/Work/lab/pid-canvas-ship/cloud.svg";
  window.requestAnimationFrame(loop);
}

function setDefaults(){
  rocket = 'undefined';
  x = can.width/2-100;
  y = can.height-250;
  mass = weight(0.7); // kg
  // accel = speed(0); // m/s_2
  accel = vector(speed(0), speed(0));
  // grav = speed(9.8);  // m/s_2
  grav = vector(speed(0), speed(9.8));
  // vel = speed(0); // m/s
  vel = vector(speed(0), speed(0)); // m/s
  r = -45;
  thrust = vector(0, 0); // kgm/s_2
  tickCount = 0;
  yaw = 0;
  secondCount = 0;
  motor = 0;
  spAngle = 0;
  spXVel = 0;
  spXAccel = 0;
  spX = can.width / 2;
  spY = can.height / 2;
  reset = 0;
}

function loop(){
  //ALL
  ctx = can.getContext('2d');

  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0, 0, can.width, can.height); // clear canvas





  //ROCKET
  if(rocket === 'undefined' || !rocket.r){
    rocket = new Rocket(200, 200);
  }

  ctx.save();

  // ctx.drawImage(ship, rocket.x(), rocket.y(), rocket.width, rocket.height);

  drawRotatedImage(ship, rocket.x(), rocket.y(), rocket.width, rocket.height, rocket.r(), ctx);

  motor = 0.7;

  var yawStartY = rocket.y() + rocket.height,
      yawStartX = rocket.x() + rocket.width/2,
      yawYVector = yawStartY + (30),
      yawXVector = yawStartX + (yaw * 20);

  vectorYawArrow(ctx, yawStartX, yawStartY, yawXVector, yawYVector);





  //PLUME
  if(Math.floor(tickCount/plumeRate) === tickCount/plumeRate && (thrust.y > 0 || thrust.x != 0)){
    var newPlume = new Plume(80, 80);
    plumes[newPlume.id] = newPlume;
  }

  for(var p in plumes){
    var exPlume = plumes[p];
    // drawRotatedImage(plume, exPlume.x, exPlume.y, exPlume.width, exPlume.height, exPlume.r, ctx);
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
      thrustYVector = velStartY - (thrust.y * -30000),
      thrustXVector = velStartX - (thrust.x * -30000);

  vectorThrustArrow(lgd, velStartX, velStartY, thrustXVector, thrustYVector);








  //PID

  //u(t) = K_pe(t) + K_i [t\0] e(t)dt + K_d de(te)/dt

  K_p = 0.01;

  K_i = 100;
  T_i = 500;

  K_d = 1;
  T_d = 1;

  var k     = 0,
      eXVel = Math.abs(spXVel - vel.x),
      pVel  = eXVel * K_p,
      iVel  = reset + (K_i/T_i) * eXVel,
      dVel  = (K_d/T_d) * eXVel - lastError,
      outputVel = pVel + iVel + dVel;

  yawNeeded = getYawFromVel(outputVel, vel); //transform error into yaw angle

  //if old diff is pos and new diff is neg, reset reset
  if((lastError > 0) && ((eXVel - lastError < 0))){
    reset = 0;
  } else if((lastError < 0) && ((eXVel - lastError > 0))) {
    reset = 0;
  } else {
    reset = iVel;
  }

  lastError = eXVel;


  if(tickCount > 05) {

    if(Math.abs(yawNeeded) > 0.6){
      yawNeeded = 0.6
    }

     if(vel.x > 0){
       yaw = 0 - Math.abs(yawNeeded);
     } else {
       yaw = 0 + Math.abs(yawNeeded);
     }
  }

  exportYaw.push(yaw);
  exportVel.push(vel.x);
  exportAccel.push(accel.x);

  exportE.push(eXVel);
  exportP.push(pVel);
  exportI.push(iVel);
  exportD.push(dVel);




  //ALL
  tickCount++;

  if((tickCount/60).toFixed(0) == tickCount/60){
    secondCount++;
  }

  if(tickCount == 600){
    // exportYawAsCSV(10);
    // exportVelAsCSV(10);
    chart(exportVel, exportYaw, exportAccel);
    chart2(exportP, exportI, exportD, exportE);
  }

  if(tickCount == 900){
    // exportYawAsCSV(10);
    // exportVelAsCSV(10);
    chart(exportVel, exportYaw, exportAccel);
    chart2(exportP, exportI, exportD, exportE);
  }

  if(tickCount == 1500){
    // exportYawAsCSV(10);
    // exportVelAsCSV(10);
    chart(exportVel, exportYaw, exportAccel);
    chart2(exportP, exportI, exportD, exportE);
  }

  if(tickCount == 3200){
    // exportYawAsCSV(60);
    // exportVelAsCSV(60);

    chart(exportVel, exportYaw, exportAccel);
    chart2(exportP, exportI, exportD, exportE);
  }

  if(tickCount == 6400){
    exportYawAsCSV(120);
    exportVelAsCSV(120);

    chart(exportVel, exportYaw, exportAccel);
    chart2(exportP, exportI, exportD);
  }

  if(tickCount == 12000){
    exportYawAsCSV(240);
    exportVelAsCSV(240);

    chart(exportVel, exportYaw, exportAccel);
    chart2(exportP, exportI, exportD);
  }




  if(thrust.y === 0){
    thrust.x = 0;
  }



  thrust.x = force(Math.sin(rocket.r()*Math.PI/180) * motor);
  thrust.y = force(Math.cos(rocket.r()*Math.PI/180) * motor);


  if(tickCount > 240){
    thrust.y = 0;
  }

  // console.log(thrust)
  accel = vector((thrust.x / mass), (thrust.y / mass) - grav.y);
  vel = vector(vel.x + accel.x, (vel.y + accel.y) < 0 - 5.4 ? 0 - 5.4 : vel.y + accel.y);



  console.log(vel.x)

  vel.x = Number(Number(vel.x));

  // console.log(vel.x)

  plumeRate = Math.round(20 - vel.y * 3);

  window.requestAnimationFrame(loop);

  log();




  // if(rocket.y() >= can.height){
  //   setDefaults();
  // }

}

function drag(x){
  var area = (2 * Math.PI * (rocket.width/2) * rocket.height) + (2 * Math.PI * Math.pow(rocket.width/2, 2));

  var drag = 0.5 * (1.2 * Math.pow(x, 2) / 2) * area;

  return drag;
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

function vector(x, y, a){
  return {
    x: x,
    y: y,
    a: a || null
  }
}

function getYawFromAccel(accel, motor){
  //we get the inverse cos of the triangle to find the angle by the length of the adjacent & hyp
  var yaw = Math.acos(accel/motor) * 360 / (Math.PI * 2) - 90;
  return yaw;
}

function getYawFromVel(outputVelX, currentVector){

  var currentVelH = Math.sqrt(Math.pow(currentVector.x, 2) + Math.pow(currentVector.y, 2)) * 100;

  //we get the inverse cos of the triangle to find the angle by the length of the adjacent & hyp
  var yaw = Number(Math.acos(outputVelX/currentVelH) * 360 / (Math.PI * 2) - 90);

  // yaw = Number(yaw.toFixed(2));
  // console.log(yaw)
  return yaw;
}

function Rocket(width, height){
  var rocket = {};

  rocket.x = function(curr){
    var newX = (rocket._x || x) + vel.x * 1;

    rocket._x = newX;
    return newX;
  };

  rocket.y = function(curr){
    var newY = (rocket._y || y) - vel.y;

    rocket._y = newY;
    return newY;
  };

  rocket.r = function(curr){
    var newR = (rocket._r || r) + yaw;

    // console.log(newR)
    rocket._r = newR;

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
  plume.y      = rocket.y() + 180 + (Math.abs(rocket.r()) * -1);
  plume.id     = "PLUME-" + Math.ceil(Math.random() * 100000);
  plume.r      = randScale *360;

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
    context.translate(x + image.width/2, y + image.height/2);

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


function vectorYawArrow(context, fromx, fromy, tox, toy){
  var headlen = 5,
      angle = Math.atan2(toy - fromy, tox - fromx);

  //
  // context.save();
  //
  // // context.translate(fromx + ((tox-fromx)/2), fromy + toy/2);
  //
  // context.rotate(rocket.r() * Math.PI/180);

  context.beginPath();

  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(tox-headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  context.moveTo(tox, toy);
  context.lineTo(tox-headlen * Math.cos(angle + Math.PI / 6),toy - headlen * Math.sin(angle + Math.PI / 6));

  if(thrust.y > 0){
    context.strokeStyle = "red";
    context.fillStyle = "red";
  } else {
    context.strokeStyle = "#551a8b";
    context.fillStyle = "#551a8b";
  }

  context.font = "12px Arial";

  context.stroke();
  context.stroke();

  context.fillText("Yaw: " + (yaw * 10).toFixed(1) + " degress", tox + 10, toy + 5);


  context.restore();
}

function log (){
  document.getElementById('altitude').innerHTML = "x: " + Math.round(((400 - rocket.x()) / 9.8) * -1) + " m <br/> y: " + Math.round((790 - rocket.y())/9.8) + " m";
  document.getElementById('mass').innerHTML = Math.round(mass * 1000) + " kg";
  document.getElementById('velocity').innerHTML = "x: " + (vel.x * 10).toFixed(2) + " m/s" + "<br /> y: " + (vel.y * 10).toFixed(2) + " m/s";
  document.getElementById('acceleration').innerHTML = "x: " + (accel.x * 1000).toFixed(2) + " m/s<sup>2</sup>" + "<br/> y: " + (accel.y * 1000).toFixed(2) + " m/s<sup>2</sup>";
  document.getElementById('thrust').innerHTML = "x: " + (thrust.x * 100000).toFixed(2) + " N <br/>y: " + (thrust.y * 100000).toFixed(2) + " N";
  document.getElementById('gravity').innerHTML = grav.y * 1000 + " m/s<sup>2</sup>";
  document.getElementById('seconds').innerHTML = secondCount + "<sup></sup>";
  document.getElementById('yaw').innerHTML = (yaw * 10).toFixed(1);
}

function leftHandler(){
  // thrust.x -= speed(0.1);
  if(yaw - 0.1 <= -.45){
    yaw = -.45;
  } else {
    yaw = yaw - 0.1;
  }
}
function upHandler(){
  // thrust.y += speed(0.1);
}
function rightHandler(){
  // thrust.x += speed(0.1);
  if(yaw + 0.1 >= .45){
    yaw = .45;
  } else {
    yaw = yaw + 0.1;
  }
}
function downHandler(){
  // if((thrust.y -= speed(0.1)) > 0){
  //   thrust.y -= speed(0.1);
  // } else {
  //   thrust.y = 0;
  //   thrust.x = 0;
  // };
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

function exportYawAsCSV(sec){
  if(exportYaw.length > 0){
    exportAsCSV(exportYaw, "yawPID" + (sec ? " " + sec + " seconds" : ""));
  }
}

function exportVelAsCSV(sec){
  if(exportVel.length > 0){
    exportAsCSV(exportVel, "velPID" + (sec ? " " + sec + " seconds" : ""));
  }
}

setup();
