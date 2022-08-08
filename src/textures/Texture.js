class Texture {
    constructor(gl, url) {
        this.id = loadTexture(gl, this, url);
    }
}
class Material {
  constructor(gl, albedoPath) {
    this.gl = gl;
    this.albedo = new Texture(gl, albedoPath);
  }

  setAO(path) { this.ao = new Texture(this.gl, path); }
  setNormal(path) { this.normal = new Texture(this.gl, path); }
  setRoughness(path) { this.roughness = new Texture(this.gl, path); }
}

function loadTexture(gl, outTexture, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      width,
      height,
      border,
      srcFormat,
      srcType,
      pixel
    );

    applyTexture(gl, url, texture);
  
    return texture;
  }

  async function applyTexture(gl, url, texture) {
    const res = await fetch(url, {mode: 'cors'});
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob, {
      premultiplyAlpha: 'none',
      colorSpaceConversion: 'none',
    });
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, bitmap.width, bitmap.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    //gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, bitmap);
    gl.compressedTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, bitmap.width, bitmap.height, gl.RGB, bitmap);
    if (isPowerOf2(bitmap.width) && isPowerOf2(bitmap.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  }

  // async function applyTexture(gl, url, texture) {
  //   var image = new Image();
  //   image.onload = function () {
  //     gl.bindTexture(gl.TEXTURE_2D, texture);
  //     gl.texImage2D(
  //       gl.TEXTURE_2D,
  //       0,
  //       gl.RGBA,
  //       gl.RGBA,
  //       gl.UNSIGNED_BYTE,
  //       image
  //     );

  //     if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
  //       // Yes, it's a power of 2. Generate mips.
  //       gl.generateMipmap(gl.TEXTURE_2D);
  //     } else {
  //       // No, it's not a power of 2. Turn off mips and set
  //       // wrapping to clamp to edge
  //       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  //     }
  //   };
  //   image.src = url;
  // }
  
  function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }