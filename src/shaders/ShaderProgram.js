import { mat4 } from "gl-matrix";
import { mat4subtract, mat4translate } from "../math/mat4";

class ShaderProgram {
    constructor(gl, name, vertexShaderText, fragShaderText) {
        // initialize shader
        this.program = initShaderProgram(gl, vertexShaderText, fragShaderText);

        // get programs info containing locations of attributes and uniforms
        this.programInfo = {
            attribLocations: {
              vertexPosition: gl.getAttribLocation(this.program, 'aVertexPosition'),
              vertexNormal: gl.getAttribLocation(this.program, 'aVertexNormal'),
              textureCoord: gl.getAttribLocation(this.program, "aTextureCoord"),
            },
            uniformLocations: {
              // textures
              albedo: gl.getUniformLocation(this.program, 'albedo'),
              normal: gl.getUniformLocation(this.program, 'normal'),
              roughness: gl.getUniformLocation(this.program, 'roughness'),
              ao: gl.getUniformLocation(this.program, 'ao'),

              // texture actives
              useAlbedo: gl.getUniformLocation(this.program, 'useAlbedo'),
              useNormal: gl.getUniformLocation(this.program, 'useNormal'),
              useRoughness: gl.getUniformLocation(this.program, 'useRoughness'),
              useAO: gl.getUniformLocation(this.program, 'useAO'),

              // matrices
              projectionMatrix: gl.getUniformLocation(this.program, 'uProjectionMatrix'),
              modelViewMatrix: gl.getUniformLocation(this.program, 'uModelViewMatrix'),
              normalMatrix: gl.getUniformLocation(this.program, 'uNormalMatrix'),

              // material strengths
              specularStrength: gl.getUniformLocation(this.program, 'specularStrength'),
              ambientStrength: gl.getUniformLocation(this.program, 'ambientStrength'),

              // camera information
              viewPos: gl.getUniformLocation(this.program, 'viewPos'),

              // light information
              lightCount: gl.getUniformLocation(this.program, "lightCount"),
              lightColor: gl.getUniformLocation(this.program, 'lightColor'),
              lightPos: gl.getUniformLocation(this.program, 'lightPos'),
              lightConstant: gl.getUniformLocation(this.program, 'lightConstant'),
              lightLinear: gl.getUniformLocation(this.program, 'lightLinear'),
              lightQuadratic: gl.getUniformLocation(this.program, 'lightQuadratic'),
              lightDirection: gl.getUniformLocation(this.program, 'lightDirection'),
              lightAngle: gl.getUniformLocation(this.program, 'lightAngle'),
              lightMaxAngle: gl.getUniformLocation(this.program, 'lightMaxAngle'),
              lightMaxDistance: gl.getUniformLocation(this.program, 'lightMaxDistance'),
            },
          };

        console.log("Successfully created shader named " + name);
    }

    enableProgram(gl) {
        gl.useProgram(this.program);
    }

    loadProjectionMatrix(gl, projectionMatrix) {
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    }

    loadModelViewMatrix(gl, modelViewMatrix) {
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    }

    loadLights(lights) {
      // get and save count
      var count = 16;
      if (lights.length < count) count = lights.length;
      gl.uniform1i(this.programInfo.uniformLocations.lightCount, count);

      // create arrays
      var positions = [];
      var colors = [];
      var maxDistances = [];
      var quadratics = [];
      var linears = [];
      var constants = [];
      var directions = [];
      var angles = [];
      var maxAngles = [];

      // load lights
      for (var i = 0; i < count; i++) {
        var light = lights[i];
        Array.prototype.push.apply(positions, light.lightPos);
        Array.prototype.push.apply(colors, light.lightColor);
        maxDistances.push(light.lightMaxDistance);
        quadratics.push(light.lightQuadratic);
        linears.push(light.lightLinear);
        constants.push(light.lightConstant);
        Array.prototype.push.apply(directions, light.lightDirection);
        angles.push(light.lightAngle);
        maxAngles.push(light.lightMaxAngle);
      }

      // save arrays
      gl.uniform3fv(this.programInfo.uniformLocations.lightPos, new Float32Array(positions));
      gl.uniform3fv(this.programInfo.uniformLocations.lightColor, new Float32Array(colors));
      gl.uniform1f(this.programInfo.uniformLocations.lightMaxDistance, new Float32Array(maxDistances));
      gl.uniform1f(this.programInfo.uniformLocations.lightQuadratic, new Float32Array(quadratics));
      gl.uniform1f(this.programInfo.uniformLocations.lightLinear, new Float32Array(linears));
      gl.uniform1f(this.programInfo.uniformLocations.lightConstant, new Float32Array(constants));
      gl.uniform3fv(this.programInfo.uniformLocations.lightDirection, new Float32Array(directions));
      gl.uniform1f(this.programInfo.uniformLocations.lightAngle, new Float32Array(angles));
      gl.uniform1f(this.programInfo.uniformLocations.lightMaxAngle, new Float32Array(maxAngles));
    }

    draw(gl, camera, entities, lights) {
      // enable this shader
      this.enableProgram(gl);

      // load light information
      this.loadLights(lights);

      // load camera information
      gl.uniform3fv(this.programInfo.uniformLocations.viewPos, camera.position);

      // load material information
      gl.uniform1f(this.programInfo.uniformLocations.ambientStrength, 0.1);
      gl.uniform1f(this.programInfo.uniformLocations.specularStrength, 0.5);

      // load projection matrix
      this.loadProjectionMatrix(gl, camera.getProjectionMatrix(gl));
      
      // for each entity, draw
      entities.forEach(entity => this.drawEntity(gl, camera, entity));
    }

    drawEntity(gl, camera, entity) {
      // load mesh into shader
      entity.mesh.loadIntoShader(gl, this);

      // model view matrix
      const modelViewMatrix = entity.getTransform();
      mat4translate(modelViewMatrix, modelViewMatrix, 
        [ -camera.position[0], -camera.position[1], -camera.position[2] ]);
      this.loadModelViewMatrix(gl, modelViewMatrix);

      // load normal matrix
      const normalMatrix = mat4create();
      mat4invert(normalMatrix, modelViewMatrix);
      mat4transpose(normalMatrix, normalMatrix);
      gl.uniformMatrix4fv(this.programInfo.uniformLocations.normalMatrix, false, normalMatrix);

      // load textures
      mesh.loadMaterial(gl, this);

      // draw
      gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount);
    }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    // Create the shader program
  
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
  
    return shaderProgram;
  }
  
  //
  // creates a shader of the given type, uploads the source and
  // compiles it.
  //
  function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
  
    // Send the source to the shader object
  
    gl.shaderSource(shader, source);
  
    // Compile the shader program
  
    gl.compileShader(shader);
  
    // See if it compiled successfully
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;
  }