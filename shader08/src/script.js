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

// 总体而言，这个ConvolutionShader被设计用于使用高斯核进行图像卷积。核的构建基于指定的标准差（sigma）。卷积是图像处理中常见的操作，用于模糊和边缘检测等任务。

const ConvolutionShader = {

	name: 'ConvolutionShader',




	vertexShader: /* glsl */`

		uniform vec2 uImageIncrement;

		varying vec2 vUv;

		void main() {

			vUv = uv - ( ( 25.0 - 1.0 ) / 2.0 ) * uImageIncrement;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float cKernel[ 25 ];

		uniform sampler2D tDiffuse;
		uniform vec2 uImageIncrement;

		varying vec2 vUv;

		void main() {

			vec2 imageCoord = vUv;
			vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );

			for( int i = 0; i < 25; i ++ ) {

				sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];
				imageCoord += uImageIncrement;

			}

			gl_FragColor = sum;

		}`,

	buildKernel: function ( sigma ) {

		// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

		const kMaxKernelSize = 25;
		let kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

		if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;

		const halfWidth = ( kernelSize - 1 ) * 0.5;

		const values = new Array( kernelSize );
		let sum = 0.0;
		for ( let i = 0; i < kernelSize; ++ i ) {

			values[ i ] = gauss( i - halfWidth, sigma );
			sum += values[ i ];

		}

		// normalize the kernel

		for ( let i = 0; i < kernelSize; ++ i ) values[ i ] /= sum;

		return values;

	}

};

function gauss( x, sigma ) {

	return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

}
// 着色器材质 ShaderMaterial
const material = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  vertexShader: ConvolutionShader.vertexShader,
  fragmentShader: ConvolutionShader.fragmentShader,
  uniforms: {

		tDiffuse:  { value: textureLoader.load('/images/1.jpg') },
    uImageIncrement: { value: new THREE.Vector2( 0.001953125, 0.0 ) },
    color:{value: new THREE.Color( 1, 0, 0 ) },
    cKernel: { value: [1.1,0.1,0.2,0.3,0.4,0.15,0.16,0.7,0.8,0.9,2.1,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,0.1,0.1,0.2,0.3,0.4] }

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