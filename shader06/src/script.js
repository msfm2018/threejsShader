import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
// 原始着色器
// import testVertexShader from './shaders/testRaw/vertex.glsl';
// import testFragmentShader from './shaders/testRaw/fragment.glsl';
// 着色器
import testVertexShader from './shaders/test/vertex.glsl';
import testFragmentShader from './shaders/test/fragment.glsl';

// 定义渲染尺寸
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// 初始化渲染器
const canvas = document.querySelector('canvas.webgl');
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 初始化场景
const scene = new THREE.Scene();

// 初始化相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 100);
camera.position.set(.15, 0, .65);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 页面缩放事件监听
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  // 更新渲染
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // 更新相机
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});

// 几何体
const geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32);
const count = geometry.attributes.position.count;
const randoms = new Float32Array(count);
for (let i = 0; i < count; i++) {
  randoms[i] = Math.random()*100;
}
geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
const textureLoader = new THREE.TextureLoader();

// 原始着色器材质 RawShaderMaterial
// const material = new THREE.RawShaderMaterial({
//   side: THREE.DoubleSide,
//   vertexShader: testVertexShader,
//   fragmentShader: testFragmentShader,
//   uniforms: {
//     uFrequency: { value: new THREE.Vector2(10, 5) },
//     uTime: { value: 0 },
//     uColor: { value: new THREE.Color('orange') },
//     uTexture: { value: textureLoader.load('/images/flag.png') }
//   }
// });

// uniform vec3 powRGB;: 用于控制颜色的幂次，影响颜色的明暗程度。

// uniform vec3 mulRGB;: 用于缩放颜色的参数，影响颜色的整体强度。

// uniform vec3 addRGB;: 用于偏移颜色的参数，影响颜色的整体偏移。

// varying vec2 vUv;: 从顶点着色器传递过来的纹理坐标。

// void main() {...}: 主函数，进行片元处理。以下是具体的处理步骤：

// gl_FragColor = texture2D( tDiffuse, vUv );: 从输入纹理中获取原始颜色。

// gl_FragColor.rgb = mulRGB * pow( ( gl_FragColor.rgb + addRGB ), powRGB );: 对原始颜色进行颜色校正，包括颜色的缩放、偏移和幂次调整。

// 这个着色器的目的是在渲染过程中对颜色进行调整，从而改变最终呈现的图像效果。通过调整 powRGB、mulRGB 和 addRGB 这些参数，你可以控制颜色的明亮度、对比度和颜色分布，从而实现各种不同的视觉效果。

const ColorCorrectionShader = {

	name: 'ColorCorrectionShader',



	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform sampler2D tDiffuse;
		uniform vec3 powRGB;
		uniform vec3 mulRGB;
		uniform vec3 addRGB;

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );
			gl_FragColor.rgb = mulRGB * pow( ( gl_FragColor.rgb + addRGB ), powRGB );

		}`

};
// 着色器材质 ShaderMaterial
const material = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  vertexShader: ColorCorrectionShader.vertexShader,
  fragmentShader: ColorCorrectionShader.fragmentShader,
  uniforms: {

		tDiffuse:  { value: textureLoader.load('/images/1.jpg') },
		brightness: { value: 0.5 },
		contrast: { value: 0 },
    powRGB:{value: new THREE.Vector3( 2, 2, 2 ) },
    mulRGB:{ value: new THREE.Vector3( 1, 1, 1 )},
    addRGB:{value: new THREE.Vector3( 0, 0, 0 )},

	},

});

// 创建网格
const mesh = new THREE.Mesh(geometry, material);
mesh.scale.y = 2 / 3;
scene.add(mesh);

 const gui = new dat.GUI();
gui.add(material.uniforms.brightness, 'value').min(0).max(20.0).step(0.01).name('brightness');
// 添加 powRGB 到 GUI
// 添加 powRGB 到 GUI
const powRGBFolder = gui.addFolder('powRGB');
powRGBFolder.add(material.uniforms.powRGB.value, 'x').min(0).max(5).step(0.1).name('Red');
powRGBFolder.add(material.uniforms.powRGB.value, 'y').min(0).max(5).step(0.1).name('Green');
powRGBFolder.add(material.uniforms.powRGB.value, 'z').min(0).max(5).step(0.1).name('Blue');

// 添加 mulRGB 到 GUI
const mulRGBFolder = gui.addFolder('mulRGB');
mulRGBFolder.add(material.uniforms.mulRGB.value, 'x').min(0).max(5).step(0.1).name('Red');
mulRGBFolder.add(material.uniforms.mulRGB.value, 'y').min(0).max(5).step(0.1).name('Green');
mulRGBFolder.add(material.uniforms.mulRGB.value, 'z').min(0).max(5).step(0.1).name('Blue');

// 添加 addRGB 到 GUI
const addRGBFolder = gui.addFolder('addRGB');
addRGBFolder.add(material.uniforms.addRGB.value, 'x').min(0).max(5).step(0.1).name('Red');
addRGBFolder.add(material.uniforms.addRGB.value, 'y').min(0).max(5).step(0.1).name('Green');
addRGBFolder.add(material.uniforms.addRGB.value, 'z').min(0).max(5).step(0.1).name('Blue');


// 动画
const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  // 更新材质
  // 更新控制器
  controls.update();
  // 更新渲染器
  renderer.render(scene, camera);
  // 重绘动画调用
  window.requestAnimationFrame(tick);
}
tick();