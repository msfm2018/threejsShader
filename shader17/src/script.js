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
//这是一个类似万花筒效果的着色器，以下是该着色器的主要特性和参数：
const KaleidoShader = {

	name: 'KaleidoShader',

	uniforms: {

		'tDiffuse': { value: null },
		'sides': { value: 6.0 },
		'angle': { value: 0.0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform sampler2D tDiffuse;
		uniform float sides;
		uniform float angle;

		varying vec2 vUv;

		void main() {

			vec2 p = vUv - 0.5;
			float r = length(p);
			float a = atan(p.y, p.x) + angle;
			float tau = 2. * 3.1416 ;
			a = mod(a, tau/sides);
			a = abs(a - tau/sides/2.) ;
			p = r * vec2(cos(a), sin(a));
			vec4 color = texture2D(tDiffuse, p + 0.5);
			gl_FragColor = color;

		}`

};


// 着色器材质 ShaderMaterial
const material = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  vertexShader: KaleidoShader.vertexShader,
  fragmentShader: KaleidoShader.fragmentShader,
  uniforms: {

		tDiffuse:  { value: textureLoader.load('/images/3.jpg') },

    sides: { value:0},
    angle: { value:0},


	},

});

// 创建网格
const mesh = new THREE.Mesh(geometry, material);
mesh.scale.y = 2 / 3;
scene.add(mesh);

 const gui = new dat.GUI();

// // gui.add(material.uniforms.exposure, 'value').min(0.1).max(1.0).step(0.1).name('exposure');

gui.add(material.uniforms.angle, 'value').min(0).max(100.0).step(0.1).name('angle');
gui.add(material.uniforms.sides, 'value').min(0).max(100.0).step(0.1).name('sides');

// gui.addColor(material.uniforms.focus, 'value').name('color');


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