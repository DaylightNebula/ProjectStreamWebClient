// options
let FPS_OUTPUT = false;

// necessary stuff
var canvas;
var gl;
var shader;
var texture;
var mesh;
var camera;
var entities = [];
var lights = [];

function main() {
  // get canvas and webgl context
  canvas = document.querySelector('#canvas');
  gl = canvas.getContext('webgl2');

  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // setup culling
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  //gl.disable(gl.CULL_FACE);
  //gl.frontFace(gl.CW);

  // setup lights
  var light = new SpotLight([0, 0, 0], [1, 1, 1], 10, 0.05, 0, 0, [0, 0, -1], 360);
  lights.push(light);

  // create basic shader
  shader = new ShaderProgram(gl, "BasicShader", vertexShaderSource, fragmentShaderSource);

  // load texture
  texture = new Texture(gl, "./assets/Albedo.png");

  // load positions and colors into a mesh
  mesh = new Mesh(gl, texture, cubeVertices, cubeTextCoords, /*cubeIndices,*/ cubeNormals);

  // create camera
  camera = new Camera([0, 0, 0], [0, 0, 0, 1], 45, 0.1, 10000.0);

  // create entity
  var a = new Entity(mesh);
  a.move([0.0, 0.0, -6.0]);
  a.scale([12, 12, 12]);
  //var b = new Entity(mesh);
  //b.move([-1.5, 0.0, -6.0]);
  //b.scale([1, 1, 1]);
  entities.push(a);
  //entities.push(b);

  loadMeshFromAssets(gl, texture, a, "./assets/horns.obj");
  //loadMeshFromAssets(gl, texture, b, "./assets/knife.obj");

  console.log("Finished startup!");
}

function resize(gl) {
  // resize
  canvas.width = gl.canvas.clientWidth;
  canvas.height = gl.canvas.clientHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function drawScene(gl, shader, deltaTime) {
  // call resize
  resize(gl);

  entities.forEach(entity => entity.rotate([ 0, deltaTime, 0 ]));
  //entities.forEach(entity => entity.move([ 0, 0, -deltaTime ]));

  // fps log
  if (FPS_OUTPUT) console.log("FPS " + (1 / deltaTime));

  // clear everything
  gl.clearColor(0.0, 0.0, 0.0, 1.0);                    // Clear to black, fully opaque
  gl.clearDepth(1.0);                                   // Clear everything
  gl.enable(gl.DEPTH_TEST);                             // Enable depth testing
  gl.depthFunc(gl.LEQUAL);                              // Near things obscure far things
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Clear color and depth bits

  // draw mesh
  shader.draw(gl, camera, entities, lights);
}

let then = 0;
function render(now) {
  now *= 0.001; // convert to seconds
  const deltaTime = now - then; // get delta time
  then = now;  // update then time variable for delta time tracking

  drawScene(gl, shader, deltaTime);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);