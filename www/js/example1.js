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
                      8, // velocity iterations
                      3);// position iterations
    }
    if(this.debugDraw) {
      this.world.DrawDebugData();
    } else {
      var obj = this.world.GetBodyList();
      this.context.clearRect(0,0,this.element.width,this.element.height);

      this.context.save();
      this.context.scale(this.scale,this.scale);
      
      if (document.getElementById("doTiltLR").value>40){
        pujaderecha();
      };
     
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
    width: 1.5,
    height: 1.5,
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
     jam = elcubo.GetUserData();
     console.log(jam);
  }
  
    function pujaderecha(){
    elcubo.ApplyImpulse({ x: 80, y: 0 }, elcubo.GetWorldCenter());
     jam = elcubo.GetUserData();
     console.log(jam);
  }
  
  function init() {
    //agrego un click al div
    document.getElementById("mibotonizq").addEventListener("click", pujaizquierda, false);
    document.getElementById("mibotonder").addEventListener("click", pujaderecha, false);
    //agrego un click al div
    
    var img = new Image();

    // Wait for the image to load
    img.addEventListener("load", function() {

      physics = window.physics = new Physics(document.getElementById("b2dCanvas"));

      // Create some walls
                                
      new Body(physics, { color: "blue", type: "static", shape: "polygon", 
                          points: [{x : 0, y : 0},{x : 8.25, y : 0.4},{x : 8.95, y : 10.75},{x : 0, y : 10.85}],
                          x: 0, y: 5 });
      
       new Body(physics, { color: "red", type: "static", shape: "polygon", 
                          points: [{x : 24, y : 0.2},{x : 23.85, y : 5.3},{x : 15.3, y : 5.35},{x : 15.3, y : 0} ],
                          x: -2, y: 5 });
       
       new Body(physics, { color: "red", type: "static", shape: "polygon", 
                          points: [ {x : 23.95, y : 5.35},{x : 23.95, y : 7.85},{x : 13.45, y : 8.3},{x : 15.15, y : 5.15} ],
                          x: -4, y: 6 });
                                           
                                                
                          
      new Body(physics, { image: img, x: 9, y: 0 });
      

      
      
      physics.click(function(body1) {
        body1.ApplyImpulse({ x: 0, y: -80 }, body1.GetWorldCenter());
      });

      requestAnimationFrame(gameLoop);
    });

    img.src = "img/cube.png";
  }

  window.addEventListener("load",init);  
 
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

