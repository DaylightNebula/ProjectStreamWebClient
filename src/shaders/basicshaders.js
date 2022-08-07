const vertexShaderSource = `
attribute vec3 aVertexNormal;
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

varying highp vec2 vTextureCoord;
varying highp vec3 vNormal;
varying highp vec3 vFragPos;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
    vNormal = mat3(uNormalMatrix) * aVertexNormal;
    vFragPos = vec3(uModelViewMatrix * aVertexPosition);
}
`;
 
const fragmentShaderSource = `
varying highp vec3 vFragPos;
varying highp vec2 vTextureCoord;
varying highp vec3 vNormal;
uniform sampler2D uSampler;

uniform highp vec3 viewPos;

// light stuffs
uniform highp int lightCount;
uniform highp vec3 lightColor[16];
uniform highp vec3 lightPos[16];
uniform highp float lightLinear[16];
uniform highp float lightQuadratic[16];
uniform highp float lightConstant[16];
uniform highp vec3 lightDirection[16];
uniform highp float lightAngle[16];
uniform highp float lightMaxAngle[16];
uniform highp float lightMaxDistance[16];

// material stuffs
uniform highp float specularStrength;
uniform highp float ambientStrength;

void main(void) {
    // object color
    highp vec4 objectcolor = texture2D(uSampler, vTextureCoord);
    highp vec3 color = vec3(0.0, 0.0, 0.0);
    highp vec3 norm = normalize(vNormal);

    // loop through all lights
    for (int lightIndex = 0; lightIndex < 16; lightIndex++) {
	    if (lightIndex >= lightCount) break;
	    
	    // get basic light information
	    highp vec3 lightDir = normalize(lightPos[lightIndex] - vFragPos);
	
	    // ambient light
	    highp vec3 ambient = ambientStrength * lightColor[lightIndex];
	
	    // diffuse lighting
	    highp float diff = max(dot(norm, lightDir), 0.0);
	    highp vec3 diffuse = diff * lightColor[lightIndex];
	
	    // specular lighting
	    highp vec3 viewDir = normalize(viewPos - vFragPos);
	    highp vec3 reflectDir = reflect(-lightDir, norm);  
	    highp float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
	    highp vec3 specular = specularStrength * spec * lightColor[lightIndex];  
		
	    // attenuation
	    highp float attenuation = 1.0;
	    highp float distance = length(lightPos[lightIndex] - vFragPos);
		if (distance < lightMaxDistance[lightIndex]) {
			attenuation = 1.0 / ((distance * distance * lightQuadratic[lightIndex]) + (distance * lightLinear[lightIndex]) + lightConstant[lightIndex]);
	    } else {
			diffuse *= 0.0;
			specular *= 0.0;
	    }
	
	    // spot angle
	    highp float currentLightAngle = degrees(acos(dot(lightDir, normalize(-lightDirection[lightIndex]))));
	    if (currentLightAngle > lightMaxAngle[lightIndex]) {
			highp float epsilon = lightMaxAngle[lightIndex] - lightAngle[lightIndex];
			highp float intensity = 1.0 - clamp((currentLightAngle - lightMaxAngle[lightIndex]) / epsilon, 0.0, 1.0);
			diffuse *= intensity;
			specular *= intensity;
	    }
		color += objectcolor.rgb * (ambient + diffuse + specular) * attenuation;
    }

    // output
    //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(lightMaxDistance[0] / 100.0, lightMaxDistance[0] / 100.0, lightMaxDistance[0] / 100.0, 1.0);
	gl_FragColor = vec4(color, objectcolor.a);
}
`;