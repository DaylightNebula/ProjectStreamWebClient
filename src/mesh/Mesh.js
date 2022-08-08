class Mesh {
    constructor(gl, material, vertices, uvs, /*indices,*/ normals) {
        // vertices
        this.vertexCount = vertices.length / 3;
        this.vertices = createVAO(gl, vertices);

        // texture uvs
        this.material = material;
        this.textureUVs = createVAO(gl, uvs);

        // indices
        //this.indicesCount = indices.length;
        //this.indices = createElementArray(gl, indices);

        // normals
        this.normalsCount = normals.length / 3;
        this.normals = createVAO(gl, normals);
    }

    bindVertices(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
    }

    bindTextureUVs(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureUVs);
    }

    // bindIndices(gl) {
    //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
    // }

    bindNormals(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);
    }

    loadIntoShader(gl, shader) {
        // load vertices
        this.bindVertices(gl);
        gl.vertexAttribPointer(shader.programInfo.attribLocations.vertexPosition, 
            3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shader.programInfo.attribLocations.vertexPosition);

        // load texture coords
        this.bindTextureUVs(gl);
        gl.vertexAttribPointer(shader.programInfo.attribLocations.textureCoord,
             2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shader.programInfo.attribLocations.textureCoord);

        // load indices
        //this.bindIndices(gl);

        // load normals
        this.bindNormals(gl);
        gl.vertexAttribPointer(shader.programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shader.programInfo.attribLocations.vertexNormal);
    }

    loadMaterial(gl, shader) {
        // albedo
        var useAlbedo = this.material.albedo instanceof Texture && this.material.albedo.id instanceof WebGLTexture;
        gl.uniform1i(shader.programInfo.uniformLocations.useAlbedo, useAlbedo);
        if (useAlbedo) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.material.albedo.id);
            gl.uniform1i(shader.programInfo.uniformLocations.albedo, 0);
        }

        // normal
        var useNormal = this.material.normal instanceof Texture && this.material.normal.id instanceof WebGLTexture;
        gl.uniform1i(shader.programInfo.uniformLocations.useNormal, useNormal);
        if (useNormal) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.material.normal.id);
            gl.uniform1i(shader.programInfo.uniformLocations.normal, 1);
        }

        // roughness
        var useRoughness = this.material.roughness instanceof Texture && this.material.roughness.id instanceof WebGLTexture;
        gl.uniform1i(shader.programInfo.uniformLocations.useRoughness, useRoughness);
        if (useRoughness) {
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this.material.roughness.id);
            gl.uniform1i(shader.programInfo.uniformLocations.roughness, 2);
        }

        // ao
        var useAO = this.material.ao instanceof Texture && this.material.ao.id instanceof WebGLTexture;
        gl.uniform1i(shader.programInfo.uniformLocations.useAO, useAO);
        if (useAO) {
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, this.material.ao.id);
            gl.uniform1i(shader.programInfo.uniformLocations.ao, 3);
        }
    }
}

function createVAO(gl, array) {
    // create a vao from the given array
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
    return buffer;
}

function createElementArray(gl, array) {
    // create element array from the given array
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array), gl.STATIC_DRAW);
    return buffer;
}

function loadMeshFromAssets(gl, material, entity, path) {
    // get array buffer
    fetch(path)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => loadMeshFromArrayBuffer(gl, arrayBuffer, material, entity));
}
function loadMeshFromArrayBuffer(gl, arrayBuffer, material, entity) {
    var dataView = new DataView(arrayBuffer, 0);

    // get vertices
    var vertexCount = dataView.getInt32(0, true) - Number.MIN_VALUE;
    console.log("Vertex count " + vertexCount);
    var counter = 4;
    var tmpVertices = [];
    for (let i = 0; i < vertexCount; i++) {
        tmpVertices.push(dataView.getFloat32((i * 12) + counter + 0, true));
        tmpVertices.push(dataView.getFloat32((i * 12) + counter + 4, true));
        tmpVertices.push(dataView.getFloat32((i * 12) + counter + 8, true));
    }
    counter += vertexCount * 12;

    // get normals
    var normalCount = dataView.getInt32(counter, true);
    counter += 4;
    var tmpNormals = [];
    for (let i = 0; i < normalCount; i++) {
        tmpNormals.push(dataView.getFloat32(i * 12 + counter + 0, true));
        tmpNormals.push(dataView.getFloat32(i * 12 + counter + 4, true));
        tmpNormals.push(dataView.getFloat32(i * 12 + counter + 8, true));
    }
    counter += normalCount * 12;

    // get tex coords
    var texCoordCount = dataView.getInt32(counter, true);
    counter += 4;
    var tmpTexCoords = [];
    for (let i = 0; i < texCoordCount; i++) {
        tmpTexCoords.push(dataView.getFloat32(i * 8 + counter + 0, true));
        tmpTexCoords.push(dataView.getFloat32(i * 8 + counter + 4, true));
    }
    counter += texCoordCount * 8;

    // get indices
    var indicesCount = dataView.getInt32(counter, true);
    counter += 4;
    var vertices = [];
    var normals = [];
    var texCoords = [];
    for (let i = 0; i < indicesCount; i++) {
        var idxV = dataView.getInt16(i * 6 + counter + 0, true);
        var idxT = dataView.getInt16(i * 6 + counter + 2, true);
        var idxN = dataView.getInt16(i * 6 + counter + 4, true);
        //console.log(idxV + " : " + idxT + " : " + idxN);
        vertices.push(tmpVertices[(idxV - 1) * 3]);
        vertices.push(tmpVertices[(idxV - 1) * 3 + 1]);
        vertices.push(tmpVertices[(idxV - 1) * 3 + 2]);
        normals.push(tmpNormals[(idxN - 1) * 3]);
        normals.push(tmpNormals[(idxN - 1) * 3 + 1]);
        normals.push(tmpNormals[(idxN - 1) * 3 + 2]);
        texCoords.push(tmpTexCoords[(idxT - 1) * 2]);
        texCoords.push(-tmpTexCoords[(idxT - 1) * 2 + 1]);
    }

    //console.log("Vertices " + vertices);
    //console.log("Normals count " + (normals.length / 3));
    //console.log("UVs count " + (texCoords.length / 2));

    // return new mesh
    entity.mesh = new Mesh(gl, material, vertices, texCoords, normals);
    mesh.vertexCount = vertices.length / 3;
}