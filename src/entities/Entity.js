import { mat4rotate, mat4scale } from "../math/mat4";

class Entity {
    // NOTE: transform = model view matrix umodified by camera transform
    constructor(mesh) {
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.size = [0, 0, 0];
        this.mesh = mesh;
    }

    move(arr) {
        this.position[0] += arr[0];
        this.position[1] += arr[1];
        this.position[2] += arr[2];
    }

    rotate(arr) {
        this.rotation[0] += arr[0];
        this.rotation[1] += arr[1];
        this.rotation[2] += arr[2];
    }

    scale(arr) {
        this.size[0] += arr[0];
        this.size[1] += arr[1];
        this.size[2] += arr[2];
    }

    getPosition() {
        return position;
    }

    getRotationAsQuat() {
        /*
        qx = np.sin(roll/2) * np.cos(pitch/2) * np.cos(yaw/2) - np.cos(roll/2) * np.sin(pitch/2) * np.sin(yaw/2)
        qy = np.cos(roll/2) * np.sin(pitch/2) * np.cos(yaw/2) + np.sin(roll/2) * np.cos(pitch/2) * np.sin(yaw/2)
        qz = np.cos(roll/2) * np.cos(pitch/2) * np.sin(yaw/2) - np.sin(roll/2) * np.sin(pitch/2) * np.cos(yaw/2)
        qw = np.cos(roll/2) * np.cos(pitch/2) * np.cos(yaw/2) + np.sin(roll/2) * np.sin(pitch/2) * np.sin(yaw/2)
        */
        return [
            (Math.sin(this.rotation[0] / 2) * Math.cos(this.rotation[1] / 2) * Math.cos(this.rotation[2] / 2)) 
            - (Math.cos(this.rotation[0] / 2) * Math.sin(this.rotation[1] / 2) * Math.sin(this.rotation[2] / 2)),
            (Math.cos(this.rotation[0] / 2) * Math.sin(this.rotation[1] / 2) * Math.cos(this.rotation[2] / 2)) 
            + (Math.sin(this.rotation[0] / 2) * Math.cos(this.rotation[1] / 2) * Math.sin(this.rotation[2] / 2)),
            (Math.cos(this.rotation[0] / 2) * Math.cos(this.rotation[1] / 2) * Math.sin(this.rotation[2] / 2)) 
            - (Math.sin(this.rotation[0] / 2) * Math.sin(this.rotation[1] / 2) * Math.cos(this.rotation[2] / 2)),
            (Math.cos(this.rotation[0] / 2) * Math.cos(this.rotation[1] / 2) * Math.cos(this.rotation[2] / 2)) 
            + (Math.sin(this.rotation[0] / 2) * Math.sin(this.rotation[1] / 2) * Math.sin(this.rotation[2] / 2)),
        ];
    }

    getTransform() {
        var transform = mat4create();
        mat4fromRotationTranslationScaleOrigin(transform, this.getRotationAsQuat(), this.position, this.size, [0, 0, 0]);
        return transform;
    }
}
class Camera {
    constructor(position, rotation, fovDegrees, near, far) {
        this.position = position;
        this.rotation = rotation;
        this.fovDegrees = fovDegrees;
        this.near = near;
        this.far = far;
    }

    getProjectionMatrix(gl) {
        const output = mat4create();
        const fov = this.fovDegrees * Math.PI / 180;
        const aspect = gl.canvas.width / gl.canvas.height;
        mat4perspective(output, fov, aspect, this.near, this.far);
        return output;
    }

    move(arr) {
        this.position[0] += arr[0];
        this.position[1] += arr[1];
        this.position[2] += arr[2];
    }

    rotation(arr) {
        this.rotation[0] += arr[0];
        this.rotation[1] += arr[1];
        this.rotation[2] += arr[2];
        this.rotation[3] += arr[3];
    }
}