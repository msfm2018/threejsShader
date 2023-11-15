import { Vector3 } from "three";
 
class RoamUtil {
  constructor(camera, viewcontrols, domElement) {
    this.viewcontrols = viewcontrols;
    this.camera = camera;
    this.domElement = domElement !== undefined ? domElement : document;
    this.movementSpeed = 1;
    this.rotateSpeed = (2 / 180) * Math.PI;
    this.horizontalRotation = 0;
    this.verticalRotation = 0;
    this.rotateAngle = Math.PI;
    this.rotateUpDownAngle = Math.PI; // 上下周期
    this.targetPosition = new Vector3(0, 0, 0);
    this.domElement.addEventListener(
      "keydown",
      this._bind(this, this._onKeyDown),
      false
    );
    this.domElement.addEventListener(
      "keyup",
      this._bind(this, this._onKeyUp),
      false
    );
  }
 
  /**
   * 更新位置，用在animation()里
   */
  update() {
    let actualMoveSpeed = this.movementSpeed;
    let actualrotateSpeed = this.rotateSpeed;
    /*---------------键盘上下左右键控制相机向前后左右运动---------------------*/
    if (this.moveForward) this.camera.translateZ(-actualMoveSpeed);
    if (this.moveBackward) this.camera.translateZ(actualMoveSpeed);
    if (this.moveLeft) this.camera.translateX(-actualMoveSpeed);
    if (this.moveRight) this.camera.translateX(actualMoveSpeed);
 
    /* --------------AD键控制相机左右旋转-------------------------------- */
    if (this.rotateLeft) {
      this.rotateAngle += actualrotateSpeed;
      this.camera.rotateY(actualrotateSpeed);
    }
    if (this.rotateRight) {
      this.rotateAngle -= actualrotateSpeed;
      this.camera.rotateY(-actualrotateSpeed);
    }
    // 上下
    if (this.rotateUp) {
      this.camera.translateY(actualMoveSpeed);
    }
    if (this.rotateDown) {
      this.camera.translateY(-actualMoveSpeed);
    }
    this.camera.updateProjectionMatrix();
    // let targetPosition = new Vector3(0, 0, 0);
    let position = this.camera.position;
    if (this.rotateLeft || this.rotateRight) {
      this.targetPosition.x = position.x + 1 * Math.sin(this.rotateAngle);
      //   this.targetPosition.y = position.y;
      this.targetPosition.z = position.z + 1 * Math.cos(this.rotateAngle);
    }
    // 按键控制镜头上下,无需，只需鼠标切方向就行
    if (this.rotateUp || this.rotateDown) {
      //   上下移动镜头
      this.targetPosition.y =
        position.y + 1 * Math.tan(this.rotateUpDownAngle);
      this.targetPosition.z = position.z + 1 * Math.cos(this.rotateAngle);
      //   上下移动y
    }
    // this.camera.lookAt(this.targetPosition);
    this.viewcontrols.target = this.targetPosition;
  }
 
  _bind(scope, fn) {
    return function() {
      fn.apply(scope, arguments);
    };
  }
 
  _onKeyDown(event) {
    //event.preventDefault();
 
    switch (event.keyCode) {
      // case 38||87: /*up*/this.moveForward = true; break;
      // case 37||65: /*left*/this.moveLeft = true; break;
      // case 40||83: /*down*/this.moveBackward = true; break;
      // case 39||68: /*right*/this.moveRight = true; break;
      case 87:
        /*up*/ this.moveForward = true;
        break;
      case 65:
        /*left*/ this.moveLeft = true;
        break;
      case 83:
        /*down*/ this.moveBackward = true;
        break;
      case 68:
        /*right*/ this.moveRight = true;
        break;
 
      case 81:
        /*Q*/ this.rotateLeft = true;
        break;
      case 69:
        /*E*/ this.rotateRight = true;
        break;
      // 上下视觉
      case 90:
        /*Z*/ this.rotateUp = true;
        break;
      case 67:
        /*C*/ this.rotateDown = true;
        break;
    }
  }
 
  _onKeyUp(event) {
    switch (event.keyCode) {
      // case 38||87: /*up、w*/this.moveForward = false; break;
      // case 37||65: /*left、a*/this.moveLeft = false; break;
      // case 40||83: /*down、s*/this.moveBackward = false; break;
      // case 39||68: /*right、d*/this.moveRight = false; break;
 
      case 87:
        /*up*/ this.moveForward = false;
        break;
      case 65:
        /*left*/ this.moveLeft = false;
        break;
      case 83:
        /*down*/ this.moveBackward = false;
        break;
      case 68:
        /*right*/ this.moveRight = false;
        break;
 
      case 81:
        /*Q*/ this.rotateLeft = false;
        break;
      case 69:
        /*E*/ this.rotateRight = false;
        break;
      // 上下视觉
      case 90:
        /*Z*/ this.rotateUp = false;
        break;
      case 67:
        /*C*/ this.rotateDown = false;
        break;
    }
  }
}
 
export { RoamUtil };