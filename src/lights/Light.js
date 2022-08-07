class Light {
    constructor(
        lightPos, lightColor, lightMaxDistance,
        lightQuadratic, lightLinear, lightConstant,
        lightDirection, lightAngle, lightMaxAngle
    ) {
        this.lightPos = lightPos;
        this.lightColor = lightColor;
        this.lightMaxDistance = lightMaxDistance;
        this.lightQuadratic = lightQuadratic;
        this.lightLinear = lightLinear;
        this.lightConstant = lightConstant;
        this.lightDirection = lightDirection;
        this.lightAngle = lightAngle;
        this.lightMaxAngle = lightMaxAngle;
    }
}
class SpotLight extends Light {
    constructor(
        lightPos, lightColor, lightMaxDistance,
        lightQuadratic, lightLinear, lightConstant,
        lightDirection, lightMaxAngle
    ) {
        super(lightPos, lightColor, lightMaxDistance, 
            lightQuadratic, lightLinear, lightConstant,
            lightDirection, lightMaxAngle * 0.75, lightMaxAngle);
    }
}
class AreaLight extends SpotLight {
    constructor(
        lightPos, lightColor, lightMaxDistance,
        lightQuadratic, lightLinear, lightConstant
    ) {
        super(lightPos, lightColor, lightMaxDistance, 
            lightQuadratic, lightLinear, lightConstant,
            [0,0,0],360);
    }
}
class DirectionalLight extends AreaLight {
    constructor(
        lightPos, lightColor, lightMaxDistance
    ) {
        super(lightPos, lightColor, lightMaxDistance,
            0,0,1);
    }
}