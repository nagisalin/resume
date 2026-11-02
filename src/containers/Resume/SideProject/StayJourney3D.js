import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeStarTexture } from 'shared/starTexture';
import { StayJourneyMock } from './mockups';
import './SPLive.scss';

// 去識別化：server 驅動的 stage 狀態機，只描述通用旅程階段
const STAGES = [
	{ name: '抵達前', color: '#38bdf8', note: '一封 email 的 magic-link 進場，免帳號', pos: [-6.2, 0, 2] },
	{ name: '入住日', color: '#34d399', note: '智慧門鎖開門、綁定通訊與多語系', pos: [-3, 1.8, -2.4] },
	{ name: '住宿中', color: '#a78bfa', note: 'IoT 服務與即時需求，狀態機推進', pos: [0, 3.2, 1.2] },
	{ name: '退房', color: '#f59e0b', note: '結算與 OTA 訂單同步', pos: [3, 1.8, -2.4] },
	{ name: '評論', color: '#f472b6', note: '邀評、旅程收尾', pos: [6.2, 0, 2] },
];

const webglOK = () => {
	try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
	catch { return false; }
};

function makeLabel(text, color, fontPx) {
	const cv = document.createElement('canvas');
	cv.width = 256; cv.height = 128;
	const ctx = cv.getContext('2d');
	ctx.fillStyle = color;
	ctx.font = `bold ${fontPx}px -apple-system, system-ui, "PingFang TC", sans-serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(text, 128, 70);
	const tex = new THREE.CanvasTexture(cv);
	tex.anisotropy = 2;
	const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
	return { sprite: new THREE.Sprite(mat), tex, mat };
}

const StayJourney3D = () => {
	const mountRef = useRef(null);
	const cameraRef = useRef(null);
	const controlsRef = useRef(null);
	const pausedRef = useRef(false);
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
		scene.fog = new THREE.FogExp2('#05070d', 0.022);
		const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
		camera.position.set(0, 3.5, 15);
		cameraRef.current = camera;

		scene.add(new THREE.AmbientLight(0x9fd8ff, 0.6));

		// ---- 旅程曲線 ----
		const points = STAGES.map((s) => new THREE.Vector3(...s.pos));
		const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
		const tubeGeo = new THREE.TubeGeometry(curve, 140, 0.07, 8, false);
		const tube = new THREE.Mesh(tubeGeo, new THREE.MeshBasicMaterial({ color: 0x3a6ea5, transparent: true, opacity: 0.55 }));
		scene.add(tube);

		const glowTex = makeStarTexture();
		const hitTargets = [];
		const disposables = [tubeGeo, tube.material];
		const nodes = [];

		// ---- 階段節點 ----
		STAGES.forEach((s, i) => {
			const col = new THREE.Color(s.color);
			const grp = new THREE.Group();
			grp.position.set(...s.pos);

			const orb = new THREE.Mesh(new THREE.SphereGeometry(0.46, 18, 18), new THREE.MeshBasicMaterial({ color: col }));
			grp.add(orb);
			disposables.push(orb.geometry, orb.material);

			const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
			glow.scale.set(2.8, 2.8, 1);
			grp.add(glow);
			disposables.push(glow.material);

			const label = makeLabel(`${i + 1}. ${s.name}`, '#ffffff', 40);
			label.sprite.scale.set(3.4, 1.7, 1);
			label.sprite.position.set(0, 1.2, 0);
			grp.add(label.sprite);
			disposables.push(label.tex, label.mat);

			const hit = new THREE.Mesh(new THREE.SphereGeometry(1.25, 10, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
			hit.userData.stage = s;
			grp.add(hit);
			hitTargets.push(hit);
			disposables.push(hit.geometry, hit.material);

			scene.add(grp);
			nodes.push({ glow, orb, pos: new THREE.Vector3(...s.pos) });
		});

		// ---- 沿線移動的房客光點 ----
		const bead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
		scene.add(bead);
		const beadGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff2cc, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
		beadGlow.scale.set(1.8, 1.8, 1);
		scene.add(beadGlow);
		disposables.push(bead.geometry, bead.material, beadGlow.material);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 1.4, 0);
		controls.enableDamping = true;
		controls.dampingFactor = 0.08;
		controls.enablePan = false;
		controls.enableZoom = false;
		controls.autoRotate = true;
		controls.autoRotateSpeed = 0.5;
		controls.minPolarAngle = 0.5;
		controls.maxPolarAngle = 1.45;
		if (isMobile) controls.touches = { ONE: THREE.TOUCH.NONE, TWO: THREE.TOUCH.DOLLY_ROTATE };
		controls.update();
		controlsRef.current = controls;

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
			setSelected(hits.length ? hits[0].object.userData.stage : null);
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
		const tmp = new THREE.Vector3();
		const animate = () => {
			raf = requestAnimationFrame(animate);
			if (!visible) return;
			const t = clock.getElapsedTime();

			// 房客沿線前進（loop）
			const u = (t * 0.08) % 1;
			curve.getPointAt(u, tmp);
			bead.position.copy(tmp);
			beadGlow.position.copy(tmp);

			// 節點脈動；房客經過時更亮
			for (let i = 0; i < nodes.length; i++) {
				const nd = nodes[i];
				const near = 1 - THREE.MathUtils.clamp(nd.pos.distanceTo(tmp) / 2.2, 0, 1);
				const s = 0.6 + 0.4 * Math.sin(t * 2 + i);
				nd.glow.material.opacity = 0.5 + s * 0.3 + near * 0.5;
				nd.orb.scale.setScalar(1 + near * 0.5);
			}

			controls.autoRotate = !pausedRef.current;
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
			disposables.forEach((d) => d.dispose && d.dispose());
			renderer.dispose();
			if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
			cameraRef.current = null;
			controlsRef.current = null;
		};
	}, [supported]);

	useEffect(() => { pausedRef.current = !!selected; }, [selected]);

	const zoom = (factor) => {
		const cam = cameraRef.current;
		const ctr = controlsRef.current;
		if (!cam || !ctr) return;
		const off = cam.position.clone().sub(ctr.target);
		const len = THREE.MathUtils.clamp(off.length() * factor, 9, 26);
		off.setLength(len);
		cam.position.copy(ctr.target).add(off);
		ctr.update();
	};

	if (!supported) return <StayJourneyMock />;

	return (
		<div className="SP-live">
			<div className="SP-live-canvas" ref={mountRef} />

			<div className="SP-live-legend">
				<span className="SP-live-legend-item"><span className="SP-live-dot" style={{ background: '#fff2cc' }} />房客動線</span>
				<span className="SP-live-legend-item">5 段 stage 狀態機</span>
			</div>

			<div className="SP-live-hint">{isTouch ? '雙指旋轉 · 點階段看說明' : '拖曳旋轉 · 點階段看說明'}</div>

			<div className="SP-live-zoom">
				<button type="button" aria-label="放大" onClick={() => zoom(0.82)}>＋</button>
				<button type="button" aria-label="縮小" onClick={() => zoom(1.22)}>－</button>
			</div>

			{selected && (
				<div className="SP-live-card" style={{ '--clr': selected.color }}>
					<button type="button" className="SP-live-card-x" aria-label="關閉" onClick={() => setSelected(null)}>×</button>
					<div className="SP-live-card-id">{selected.name}</div>
					<div className="SP-live-card-note">{selected.note}</div>
				</div>
			)}
		</div>
	);
};

export default StayJourney3D;
