import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MonitorWallMock } from './mockups';
import './SPLive.scss';

const STATUS = {
	normal: { color: '#22d3ee', label: '正常', mode: 0.0, tint: [0.18, 0.72, 0.95] },
	alert: { color: '#ef4444', label: '警戒', mode: 1.0, tint: [0.9, 0.3, 0.25] },
	offline: { color: '#6b7280', label: '離線', mode: 2.0, tint: [0.4, 0.44, 0.5] },
};
// 去識別化：只有攝影機編號 + 區 + 狀態 + fps，無任何真實地點或畫面
const COLS = 5;
const ROWS = 3;
const ALERT_IDX = new Set([3, 11]);
const OFFLINE_IDX = new Set([7]);

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const FRAG = `
precision mediump float;
uniform float uTime; uniform float uSeed; uniform vec3 uTint; uniform float uMode;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)) + uSeed) * 43758.5453); }
void main(){
	vec2 uv = vUv;
	float scan = 0.82 + 0.18 * sin(uv.y * 130.0 + uTime * 2.2);
	float n = hash(floor(uv * vec2(54.0, 34.0)) + floor(uTime * 10.0));
	float band = smoothstep(0.0, 0.35, 1.0 - abs(fract(uTime * 0.14 + uSeed) - uv.y));
	vec3 col = uTint * (0.22 + 0.55 * band) * scan + n * 0.07;
	if (uMode > 1.5) { col = vec3(0.1) + n * 0.28; }
	else if (uMode > 0.5) { float a = 0.5 + 0.5 * sin(uTime * 6.0); col = mix(col, vec3(0.85,0.12,0.12), 0.38 + 0.3 * a); }
	gl_FragColor = vec4(col, 1.0);
}`;

const webglOK = () => {
	try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
	catch { return false; }
};

const MonitorWall3D = () => {
	const mountRef = useRef(null);
	const cameraRef = useRef(null);
	const controlsRef = useRef(null);
	const selectedIdRef = useRef(null);
	const [selected, setSelected] = useState(null);
	const [supported] = useState(webglOK);
	const [isTouch] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches);

	useEffect(() => {
		if (!supported) return;
		const mount = mountRef.current;
		if (!mount) return;
		const isMobile = window.matchMedia('(max-width: 1024px)').matches;

		let width = mount.clientWidth;
		let height = mount.clientHeight || Math.round(width * 0.625);

		const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));
		renderer.setSize(width, height);
		mount.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2('#05070d', 0.02);
		const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 200);
		camera.position.set(0, 0.4, 13.5);
		cameraRef.current = camera;

		// ---- 建立攝影機清單 ----
		const cams = [];
		let idx = 0;
		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				const status = OFFLINE_IDX.has(idx) ? 'offline' : ALERT_IDX.has(idx) ? 'alert' : 'normal';
				cams.push({
					id: `CAM-${String(idx + 1).padStart(2, '0')}`,
					zone: String.fromCharCode(65 + (c % 3)),
					status,
					fps: status === 'offline' ? 0 : 24 + ((idx * 7) % 7),
					c, r,
				});
				idx++;
			}
		}

		// ---- 曲面排列的監控格 ----
		const pw = 2.6, ph = 1.7, colGap = 0.2, gapY = 0.26, curve = 0.08;
		const panelGeo = new THREE.PlaneGeometry(pw, ph);
		const frameGeo = new THREE.PlaneGeometry(pw + 0.14, ph + 0.14);
		const feedMats = [];
		const frames = [];
		const hitTargets = [];
		cams.forEach((cam, i) => {
			const x = (cam.c - (COLS - 1) / 2) * (pw + colGap);
			const z = x * x * curve; // 凹面：邊緣稍微靠近觀眾
			const y = ((ROWS - 1) / 2 - cam.r) * (ph + gapY);
			const g = new THREE.Group();
			g.position.set(x, y, z);
			g.lookAt(0, y, 60); // 微微朝中心（凹面）

			const st = STATUS[cam.status];
			const frameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(st.color), transparent: true, opacity: 0.85 });
			const frame = new THREE.Mesh(frameGeo, frameMat);
			frame.position.z = -0.03;
			g.add(frame);
			frames.push({ mesh: frame, mat: frameMat, status: cam.status, base: 0.85 });

			const feedMat = new THREE.ShaderMaterial({
				uniforms: { uTime: { value: 0 }, uSeed: { value: i * 1.7 }, uTint: { value: new THREE.Vector3(...st.tint) }, uMode: { value: st.mode } },
				vertexShader: VERT, fragmentShader: FRAG,
			});
			const feed = new THREE.Mesh(panelGeo, feedMat);
			feed.userData.cam = cam;
			g.add(feed);
			feedMats.push(feedMat);
			hitTargets.push(feed);

			scene.add(g);
		});

		// ---- 控制：限制方位，面板不會翻到背面 ----
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 2);
		controls.enableDamping = true;
		controls.dampingFactor = 0.08;
		controls.enablePan = false;
		controls.enableZoom = false;
		controls.minPolarAngle = 1.15;
		controls.maxPolarAngle = 1.72;
		controls.minAzimuthAngle = -0.62;
		controls.maxAzimuthAngle = 0.62;
		if (isMobile) controls.touches = { ONE: THREE.TOUCH.NONE, TWO: THREE.TOUCH.DOLLY_ROTATE };
		controls.update();
		controlsRef.current = controls;

		// ---- 點選 ----
		const raycaster = new THREE.Raycaster();
		const ndc = new THREE.Vector2();
		const dom = renderer.domElement;
		let down = null;
		const onDown = (e) => { down = { x: e.clientX, y: e.clientY }; };
		const onUp = (e) => {
			if (!down) return;
			const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
			down = null;
			if (moved > 6) return;
			const rect = dom.getBoundingClientRect();
			ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(ndc, camera);
			const hits = raycaster.intersectObjects(hitTargets, false);
			const cam = hits.length ? hits[0].object.userData.cam : null;
			selectedIdRef.current = cam ? cam.id : null;
			setSelected(cam);
		};
		dom.addEventListener('pointerdown', onDown);
		dom.addEventListener('pointerup', onUp);

		const onResize = () => {
			width = mount.clientWidth;
			height = mount.clientHeight || Math.round(width * 0.625);
			renderer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		};
		window.addEventListener('resize', onResize);

		let visible = true;
		const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0, rootMargin: '150px 0px' });
		io.observe(mount);

		let raf = 0;
		const clock = new THREE.Clock();
		const animate = () => {
			raf = requestAnimationFrame(animate);
			if (!visible) return;
			const t = clock.getElapsedTime();
			for (let i = 0; i < feedMats.length; i++) feedMats[i].uniforms.uTime.value = t;
			for (let i = 0; i < frames.length; i++) {
				const f = frames[i];
				const isSel = selectedIdRef.current === cams[i].id;
				if (f.status === 'alert') f.mat.opacity = isSel ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(t * 3));
				else f.mat.opacity = isSel ? 1 : f.base;
				f.mesh.scale.setScalar(isSel ? 1.06 : 1);
			}
			controls.update();
			renderer.render(scene, camera);
		};
		raf = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
			window.removeEventListener('resize', onResize);
			dom.removeEventListener('pointerdown', onDown);
			dom.removeEventListener('pointerup', onUp);
			controls.dispose();
			panelGeo.dispose();
			frameGeo.dispose();
			feedMats.forEach((m) => m.dispose());
			frames.forEach((f) => f.mat.dispose());
			renderer.dispose();
			if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
			cameraRef.current = null;
			controlsRef.current = null;
		};
	}, [supported]);

	const zoom = (factor) => {
		const cam = cameraRef.current;
		const ctr = controlsRef.current;
		if (!cam || !ctr) return;
		const off = cam.position.clone().sub(ctr.target);
		const len = THREE.MathUtils.clamp(off.length() * factor, 8, 22);
		off.setLength(len);
		cam.position.copy(ctr.target).add(off);
		ctr.update();
	};

	if (!supported) return <MonitorWallMock />;

	return (
		<div className="SP-live">
			<div className="SP-live-canvas" ref={mountRef} />

			<div className="SP-live-legend">
				{Object.values(STATUS).map((v) => (
					<span key={v.label} className="SP-live-legend-item"><span className="SP-live-dot" style={{ background: v.color }} />{v.label}</span>
				))}
			</div>

			<div className="SP-live-hint">{isTouch ? '雙指旋轉 · 點格看攝影機' : '拖曳旋轉 · 點格看攝影機'}</div>

			<div className="SP-live-zoom">
				<button type="button" aria-label="放大" onClick={() => zoom(0.82)}>＋</button>
				<button type="button" aria-label="縮小" onClick={() => zoom(1.22)}>－</button>
			</div>

			{selected && (
				<div className="SP-live-card" style={{ '--clr': STATUS[selected.status].color }}>
					<button type="button" className="SP-live-card-x" aria-label="關閉" onClick={() => { selectedIdRef.current = null; setSelected(null); }}>×</button>
					<div className="SP-live-card-id">{selected.id}</div>
					<div className="SP-live-card-status"><span className="SP-live-dot" style={{ background: STATUS[selected.status].color }} />{STATUS[selected.status].label} · {selected.zone} 區</div>
					<div className="SP-live-card-kw">{selected.status === 'offline' ? '— fps' : `${selected.fps} fps`}</div>
				</div>
			)}
		</div>
	);
};

export default MonitorWall3D;
