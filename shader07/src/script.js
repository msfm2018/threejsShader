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

// 这是一个颜色着色器程序，名为ColorifyShader，用于对图像进行单色调整。

const ColorifyShader = {

	name: 'ColorifyShader',



	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform vec3 color;
		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
      // 一个灰度（grayscale）转换的权重向量 luma。这个向量中的三个值（0.299、0.587、0.114）分别对应于红色、绿色和蓝色通道的权重。这是根据人眼对不同颜色敏感度的经验值来确定的。
			vec3 luma = vec3( 0.299, 0.587, 0.114 );
      // gray = 0.299 * R + 0.587 * G + 0.114 * B
			float v = dot( texel.xyz, luma );

			gl_FragColor = vec4( v * color, texel.a );

		}`

};
// 着色器材质 ShaderMaterial
const material = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  vertexShader: ColorifyShader.vertexShader,
  fragmentShader: ColorifyShader.fragmentShader,
  uniforms: {

		tDiffuse:  { value: textureLoader.load('/images/1.jpg') },

    color:{value: new THREE.Color( 1, 0, 0 ) },


	},

});

// 创建网格
const mesh = new THREE.Mesh(geometry, material);
mesh.scale.y = 2 / 3;
scene.add(mesh);

 const gui = new dat.GUI();

// 添加 powRGB 到 GUI
// 添加 powRGB 到 GUI
const powRGBFolder = gui.addFolder('color');
powRGBFolder.add(material.uniforms.color.value, 'r').min(0).max(1).step(0.1).name('Red');
powRGBFolder.add(material.uniforms.color.value, 'g').min(0).max(1).step(0.1).name('Green');
powRGBFolder.add(material.uniforms.color.value, 'b').min(0).max(1).step(0.1).name('Blue');

// gui.addColor(material.uniforms.color, 'value').name('color');


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