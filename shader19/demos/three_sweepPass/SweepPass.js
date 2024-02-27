class SweepPass extends THREE.Pass {
    constructor(scene, camera) {
        super();

        this.scene = scene;
        this.camera = camera;

        this.sweepMaterial = this.getSweepMaterial();
        this.fsQuad = new THREE.Pass.FullScreenQuad(this.sweepMaterial);
    }

    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        this.sweepMaterial.uniforms["colorTexture"].value = readBuffer.texture;

        renderer.setRenderTarget(null);
        this.fsQuad.render(renderer);
    }

    getSweepMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                "colorTexture": { value: null },
                "time": { type: "f", value: 0.0 }
            },
            vertexShader:
                `
                varying vec2 vUv;
                varying vec3 iPosition;
                void main() {
                    vUv = uv;
                    iPosition = position; // -1.0 -> 1.0
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,

            fragmentShader:
                `
                uniform float time;

                varying vec2 vUv;
                varying vec3 iPosition;
                uniform sampler2D colorTexture;
                void main() {

                    vec4 sampledColor = texture2D(colorTexture, vUv);

                    float alpha = abs(iPosition.y + iPosition.x - time);

                    if (alpha < 0.1) {
                        float a = 1.0 - alpha / 0.1;
                        //  卢马换算公式光度; 
                        float luma  = 0.2126 * sampledColor.r + 0.7152 * sampledColor.g + 0.0722 * sampledColor.b;
                        gl_FragColor = mix(vec4(sampledColor.rgb * 0.3, 1.0), sampledColor , luma );
                    } else {
                        gl_FragColor = vec4(sampledColor.rgb * 0.3, 1.0);
                    }
                }`
        });
    }
}
