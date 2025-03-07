import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, water, boat;
let controls;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Camera position
    camera.position.set(0, 10, 20);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Water
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg', function(texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
    });
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Load boat model
    const loader = new GLTFLoader();
    loader.load(
        'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Sailboat/glTF/Sailboat.gltf',
        function (gltf) {
            boat = gltf.scene;
            boat.scale.set(0.5, 0.5, 0.5);
            boat.position.y = 0.1;
            boat.rotation.y = Math.PI;
            scene.add(boat);
        },
        // Progress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Error callback
        function (error) {
            console.error('An error happened:', error);
            // Fallback to cube if model fails to load
            const boatGeometry = new THREE.BoxGeometry(2, 1, 4);
            const boatMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
            boat = new THREE.Mesh(boatGeometry, boatMaterial);
            boat.position.y = 0.5;
            scene.add(boat);
        }
    );

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Keyboard controls
    document.addEventListener('keydown', onKeyDown);
}

function onKeyDown(event) {
    const speed = 0.5;
    switch(event.key) {
        case 'ArrowLeft':
            boat.rotation.y += 0.1;
            break;
        case 'ArrowRight':
            boat.rotation.y -= 0.1;
            break;
        case 'ArrowUp':
            boat.position.x += Math.sin(-boat.rotation.y) * speed;
            boat.position.z += Math.cos(-boat.rotation.y) * speed;
            break;
        case 'ArrowDown':
            boat.position.x -= Math.sin(-boat.rotation.y) * speed;
            boat.position.z -= Math.cos(-boat.rotation.y) * speed;
            break;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    water.material.uniforms['time'].value += 1.0 / 60.0;
    controls.update();
    renderer.render(scene, camera);
}

init();
animate();