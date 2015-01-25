(function() {
  var b2Vec2 = Box2D.Common.Math.b2Vec2;
  var b2BodyDef = Box2D.Dynamics.b2BodyDef;
  var b2Body = Box2D.Dynamics.b2Body;
  var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
  var b2Fixture = Box2D.Dynamics.b2Fixture;
  var b2World = Box2D.Dynamics.b2World;
  var b2MassData = Box2D.Collision.Shapes.b2MassData;
  var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
  var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
  var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;


  var Physics = window.Physics = function(element,scale) {
    var gravity = new b2Vec2(0,9.8);
    this.world = new b2World(gravity, true);
    this.element = element;
    this.context = element.getContext("2d");
    this.scale = scale || 20;
    this.dtRemaining = 0;
    this.stepAmount = 1/60;
  };

  Physics.prototype.debug = function() {
    this.debugDraw = new b2DebugDraw();
    this.debugDraw.SetSprite(this.context);
    this.debugDraw.SetDrawScale(this.scale);
    this.debugDraw.SetFillAlpha(0.3);
    this.debugDraw.SetLineThickness(1.0);
    this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(this.debugDraw);
  };

  
  var elcubo;
  var i=0;
  
  Physics.prototype.step = function(dt) {
    this.dtRemaining += dt;
    while(this.dtRemaining > this.stepAmount) {
      this.dtRemaining -= this.stepAmount;
      this.world.Step(this.stepAmount, 
                      10, // velocity iterations
                      10);// position iterations
    }
    if(this.debugDraw) {
      this.world.DrawDebugData();
    } else {
      var obj = this.world.GetBodyList();
      this.context.clearRect(0,0,this.element.width,this.element.height);

      this.context.save();
      this.context.scale(this.scale,this.scale);
      
      //control de tilteo
      if (document.getElementById("doTiltLR").value>30 && document.getElementById("doTiltLR").value<40){
        pujaderecha1();
      }
     else if (document.getElementById("doTiltLR").value>41 && document.getElementById("doTiltLR").value<55){
        pujaderecha2();
      }
      else if (document.getElementById("doTiltLR").value>56 && document.getElementById("doTiltLR").value){
        pujaderecha3();
      }
      
      
      if (document.getElementById("doTiltLR").value<-30 && document.getElementById("doTiltLR").value>-40){
        pujaizquierda1();
      }
     else if (document.getElementById("doTiltLR").value<-41 && document.getElementById("doTiltLR").value>-55){
        pujaizquierda2();
      }
      else if (document.getElementById("doTiltLR").value<-56 && document.getElementById("doTiltLR").value){
        pujaizquierda3();
      }
      
      
      while(obj) {
        var body = obj.GetUserData();
        if(body) {
          body.draw(this.context);
        }
        if (i==0){
          elcubo=obj;
          //var body23 = obj.GetUserData();
          //console.log(body23);
          i++;
        }
        obj = obj.GetNext();
      }
      //var nuevo = obj.GetUserData();
      //console.log(nuevo);
      this.context.restore();
    }
  };

 

  Physics.prototype.click = function(callback) {
    var self = this;
    function handleClick(e) {
      e.preventDefault();
      
      //codigo al dar click
      
      //codigo al dar click
      
      var point = {
            x: (e.offsetX || e.layerX) / self.scale,
            y: (e.offsetY || e.layerY) / self.scale
          };

      self.world.QueryPoint(function(fixture) {
        callback(fixture.GetBody(),
                 fixture,
                 point);
      },point);
    }

    this.element.addEventListener("click",handleClick);
    this.element.addEventListener("touchstart",handleClick);
  };

  
  //collision
   Physics.prototype.collision = function() {
   this.listener = new Box2D.Dynamics.b2ContactListener();
   this.listener.PostSolve = function(contact,impulse) {
     var bodyA = contact.GetFixtureA().GetBody().GetUserData(),
         bodyB = contact.GetFixtureB().GetBody().GetUserData();

     if(bodyA.contact) { bodyA.contact(contact,impulse,true) }
     if(bodyB.contact){
         // window.document.getElementById('final').innerHTML='FIN';
          bodyB.contact(contact,impulse,false);
          //AQUI ES EL GAME OVER!!!
		  $('#gameover').fadeIn();
     }

   };
   this.world.SetContactListener(this.listener);
 };
  
  
  var Body = window.Body = function(physics,details) {
    this.details = details = details || {};

    // Create the definition
    this.definition = new b2BodyDef();

    // Set up the definition
    for(var k in this.definitionDefaults) {
      this.definition[k] = details[k] || this.definitionDefaults[k];
    }
    this.definition.position = new b2Vec2(details.x || 0, details.y || 0);
    this.definition.linearVelocity = new b2Vec2(details.vx || 0, details.vy || 0);
    this.definition.userData = this;
    this.definition.type = details.type == "static" ? b2Body.b2_staticBody :
                                                      b2Body.b2_dynamicBody;

    // Create the Body
    this.body = physics.world.CreateBody(this.definition);

    // Create the fixture
    this.fixtureDef = new b2FixtureDef();
    for(var l in this.fixtureDefaults) {
      this.fixtureDef[l] = details[l] || this.fixtureDefaults[l];
    }


    details.shape = details.shape || this.defaults.shape;

    switch(details.shape) {
      case "circle":
        details.radius = details.radius || this.defaults.radius;
        this.fixtureDef.shape = new b2CircleShape(details.radius);
        break;
      case "polygon":
        this.fixtureDef.shape = new b2PolygonShape();
        this.fixtureDef.shape.SetAsArray(details.points,details.points.length);
        break;
      case "block":
      default:
        details.width = details.width || this.defaults.width;
        details.height = details.height || this.defaults.height;

        this.fixtureDef.shape = new b2PolygonShape();
        this.fixtureDef.shape.SetAsBox(details.width/2,
                                       details.height/2);
        break;
    }

    this.body.CreateFixture(this.fixtureDef);
  };


  Body.prototype.defaults = {
    shape: "block",
    width: 1.3,
    height: 1.3,
    radius: 1
  };

  Body.prototype.fixtureDefaults = {
    density: 2,
    friction: 1,
    restitution: 0.2
  };

  Body.prototype.definitionDefaults = {
    active: true,
    allowSleep: true,
    angle: 0,
    angularVelocity: 0,
    awake: true,
    bullet: false,
    fixedRotation: false
  };


  Body.prototype.draw = function(context) {
    var pos = this.body.GetPosition(),
        angle = this.body.GetAngle();

    context.save();
    context.translate(pos.x,pos.y);
    context.rotate(angle);


    if(this.details.color) {
      context.fillStyle = this.details.color;

      switch(this.details.shape) {
        case "circle":
          context.beginPath();
          context.arc(0,0,this.details.radius,0,Math.PI*2);
          context.fill();
          break;
        case "polygon":
          var points = this.details.points;
          context.beginPath();
          context.moveTo(points[0].x,points[0].y);
          for(var i=1;i<points.length;i++) {
            context.lineTo(points[i].x,points[i].y);
          }
          context.fill();
          break;
        case "block":
          context.fillRect(-this.details.width/2,
                           -this.details.height/2,
                           this.details.width,
                           this.details.height);
        default:
          break;
      }
    }

    if(this.details.image) {
      context.drawImage(this.details.image,
                        -this.details.width/2,
                        -this.details.height/2,
                        this.details.width,
                        this.details.height);

    }

    context.restore();

  }


  var physics,
      lastFrame = new Date().getTime();

  window.gameLoop = function() {
    var tm = new Date().getTime();
    requestAnimationFrame(gameLoop);
    var dt = (tm - lastFrame) / 1000;
    if(dt > 1/15) { dt = 1/15; }
    physics.step(dt);
    lastFrame = tm;
  };

  
  function pujaizquierda(){
    elcubo.ApplyImpulse({ x: -80, y: 0 }, elcubo.GetWorldCenter());
  }
  
   function pujaizquierda1(){
    elcubo.ApplyImpulse({ x: -2, y: 0 }, elcubo.GetWorldCenter());
  }
  
   function pujaizquierda2(){
    elcubo.ApplyImpulse({ x: -4, y: 0 }, elcubo.GetWorldCenter());
  }
  
  function pujaizquierda3(){
    elcubo.ApplyImpulse({ x: -6, y: 0 }, elcubo.GetWorldCenter());
  }
  
    function pujaderecha(){
    elcubo.ApplyImpulse({ x: 80, y: 0 }, elcubo.GetWorldCenter());
  }
      function pujaderecha1(){
    elcubo.ApplyImpulse({ x: 2, y: 0 }, elcubo.GetWorldCenter());
  }
      function pujaderecha2(){
    elcubo.ApplyImpulse({ x: 4, y: 0 }, elcubo.GetWorldCenter());
  }
      function pujaderecha3(){
    elcubo.ApplyImpulse({ x: 6, y: 0 }, elcubo.GetWorldCenter());
  }
  
  function arriba(){
    console.log("arriba");
    elcubo.ApplyImpulse({ x: 0, y: -60 }, elcubo.GetWorldCenter());
  }
  
  function init() {

    //agrego un click al div    
    var img = new Image();
    var img2 = new Image();
    var img3 = new Image();
    var img4 = new Image();


    // Wait for the image to load
    img.addEventListener("load", function() {

      physics = window.physics = new Physics(document.getElementById("b2dCanvas"));

      physics.collision();
      
      
      // Create some walls
      new Body(physics, {  type: "static", shape: "polygon", points: [{x : 24, y : 0.25},{x : 24, y : 5.35},{x : 15.25, y : 5.3},{x : 15.25, y : 0.2},], x : 0, Y : 5.35});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 23.95, y : 5.45},{x : 24, y : 8.45},{x : 13.6, y : 8.2},{x : 15.15, y : 5.35},], x : 0, Y : 8.45});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 24.1, y : 10.85},{x : 13.75, y : 10.6},{x : 13.5, y : 8.35},], x : 0, Y : 10.85});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 23.95, y : 11.05},{x : 24, y : 14.05},{x : 13.15, y : 13.55},{x : 13.9, y : 10.7},], x : 0, Y : 14.05});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 23.95, y : 14.15},{x : 24, y : 17.2},{x : 15.6, y : 17.2},{x : 13.2, y : 13.6},], x : 0, Y : 17.2});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 24, y : 17.35},{x : 23.95, y : 19.7},{x : 16.6, y : 19.7},{x : 15.7, y : 17.2},], x : 0, Y : 19.7});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 24, y : 19.85},{x : 24.1, y : 21.5},{x : 16.6, y : 21.35},{x : 16.65, y : 19.7},], x : 0, Y : 21.5});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 23.95, y : 21.55},{x : 24, y : 23.15},{x : 15.9, y : 23.3},{x : 16.65, y : 21.35},], x : 0, Y : 23.3});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 24, y : 23.2},{x : 24, y : 26.9},{x : 12.75, y : 26.45},{x : 15.75, y : 23.3},], x : 0, Y : 26.9});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 24, y : 27.05},{x : 12, y : 29},{x : 12.9, y : 26.5},], x : 0, Y : 29});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 23.95, y : 27.2},{x : 23.85, y : 30.85},{x : 11.95, y : 30.7},{x : 12, y : 29.15},], x : 0, Y : 30.85});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 23.8, y : 31.1},{x : 23.95, y : 33.35},{x : 12.55, y : 32.8},{x : 11.85, y : 30.85},], x : 0, Y : 33.35});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 24, y : 33.55},{x : 24, y : 35.35},{x : 13.95, y : 35},{x : 12.7, y : 32.9},], x : 0, Y : 35.35});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 24, y : 35.5},{x : 24, y : 37.25},{x : 15.3, y : 37.1},{x : 14.05, y : 35.05},], x : 0, Y : 37.25});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 23.95, y : 37.45},{x : 24, y : 38.9},{x : 15.4, y : 38.9},{x : 15.3, y : 37.25},], x : 0, Y : 38.9});


new Body(physics, {   type: "static", shape: "polygon", points: [{x : 8.25, y : 0.25},{x : 8.25, y : 5.15},{x : 0.15, y : 5.2},], x : 0, Y : 5.2});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 8.25, y : 5.2},{x : 8.95, y : 10.75},{x : 0.1, y : 10.6},], x : 0, Y : 10.75});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 8.95, y : 10.7},{x : 9.75, y : 12.8},{x : 0.25, y : 13.3},], x : 0, Y : 13.3});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 9.85, y : 12.85},{x : 10.55, y : 14.45},{x : 0.3, y : 15.55},], x : 0, Y : 15.55});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 13.1, y : 16.3},{x : 0.15, y : 16.4},{x : 11.5, y : 14.4}], x : -1, Y : 16.4});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 12, y : 16.1},{x : 13.85, y : 18.55},{x : 0.45, y : 18.25},], x : 0, Y : 18.55});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 13.95, y : 18.65},{x : 14.5, y : 20.45},{x : 0.15, y : 20.8},], x : 0, Y : 20.8});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 14.5, y : 20.0},{x : 13.9, y : 22.3},{x : 0.3, y : 22.25},], x : 0, Y : 22.3});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 14.0, y : 22.25},{x : 12.25, y : 23.35},{x : 0.4, y : 23.15},], x : 0, Y : 23.35});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 12.50, y : 23.3},{x : 11.5, y : 23.9},{x : 0.45, y : 23.5},], x : 0, Y : 23.5});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 12, y : 23.6},{x : 10.75, y : 24.4},{x : 0.25, y : 24.35},], x : 0, Y : 24.4});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 10.6, y : 24.55},{x : 9.6, y : 26.5},{x : 0.3, y : 26.75},], x : 0, Y : 26.75});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 9.4, y : 26.6},{x : 8.5, y : 28.6},{x : 0.4, y : 28.7},], x : 0, Y : 28.7});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 8.55, y : 28.7},{x : 8.5, y : 30.85},{x : 0.25, y : 31},], x : 0, Y : 31});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 8.4, y : 30.95},{x : 9.3, y : 33.2},{x : 0.1, y : 32.95},], x : 0, Y : 33.2});
new Body(physics, {  type: "static", shape: "polygon", points: [{x : 9.4, y : 33.35},{x : 11.8, y : 37.15},{x : 0.25, y : 37.15},], x : 0, Y : 37.15});
new Body(physics, {    type: "static", shape: "polygon", points: [{x : 11.8, y : 37.25},{x : 11.8, y : 38.8},{x : 0.45, y : 38.95},], x : 0, Y : 38.95});
                                                
      //el chip ese                    
      var body= new Body(physics, { image: img, x: 13.5, y: -2 });
      //contact del chip
       //body contact
       body.contact = function(contact,impulse,first) {
        //posiblemente aqui tambien se chocan los objetos.
     };
      
      
	 pos1=8.5+(Math.random()*4);
	   pos2=8.5+(Math.random()*4);
	   pos3=8.5+(Math.random()*4);
	   pos4=8.5+(Math.random()*4);
	   pos5=9+(Math.random()*4);
      
	setTimeout(function(){
		new Body(physics, { image:img2, x: pos1, y: -0.5, width:0.8, height:0.8});
		new Body(physics, { image:img3, x: pos2, y: -0.7, width:0.8, height:0.8 });
		new Body(physics, { image:img4, x: pos3, y: -0.2, width:0.8, height:0.8 });
		new Body(physics, { image:img2, x: pos4, y: 0, width:0.8, height:0.8 });
		new Body(physics, { image:img3, x: pos5, y: -0.1, width:0.8, height:0.8 });
		},2200);
      
      
      physics.click(function(body1) {
        body1.ApplyImpulse({ x: 0, y: -80 }, body1.GetWorldCenter());
      });

      requestAnimationFrame(gameLoop);
    });

    img.src = "img/chip.png";
    img2.src = "img/enemigo.png";
    img3.src = "img/enemigocuerpo1.gif";
    img4.src = "img/enemigocuerpo2.gif";
    
  }

  window.addEventListener("load",init);  
  window.addEventListener("click", arriba);
   window.addEventListener("touchstart", arriba);
}());




// Lastly, add in the `requestAnimationFrame` shim, if necessary. Does nothing 
// if `requestAnimationFrame` is already on the `window` object.
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
 
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());

