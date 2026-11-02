import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeStarTexture } from 'shared/starTexture';
import { ChargeMapMock } from './mockups';
import './SPLive.scss';

// 去識別化假資料：只保留「站點編號 + 狀態 + 功率」，不含任何地名/客戶資訊
const STATUS = {
	available: { color: '#34d399', label: '可用' },
	busy: { color: '#f59e0b', label: '使用中' },
	offline: { color: '#6b7280', label: '離線' },
};
const STATIONS = [
	{ id: 'A-01', x: -6, z: -4, status: 'available', kw: 120 },
	{ id: 'B-02', x: 4, z: -6.5, status: 'busy', kw: 180 },
	{ id: 'C-03', x: 7.5, z: 3, status: 'available', kw: 120 },
	{ id: 'D-04', x: -7, z: 5, status: 'offline', kw: 0 },
	{ id: 'E-05', x: 0.5, z: 7.5, status: 'busy', kw: 90 },
	{ id: 'F-06', x: -2, z: -8, status: 'available', kw: 150 },
	{ id: 'G-07', x: 9, z: -1, status: 'available', kw: 120 },
];

const webglOK = () => {
	try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
	catch { return false; }
};

const ChargeMap3D = () => {
	const mountRef = useRef(null);
	const cameraRef = useRef(null);
	const controlsRef = useRef(null);
	const pausedRef = useRef(false); // 開著站點卡時暫停自轉，免得選中的站點轉走
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
		camera.position.set(0, 15, 18);
		cameraRef.current = camera;

		scene.add(new THREE.AmbientLight(0x9fd8ff, 0.5));
		const dir = new THREE.DirectionalLight(0xffffff, 0.8);
		dir.position.set(6, 12, 8);
		scene.add(dir);

		// ---- 地面：暗底圓盤 + 霓虹網格 ----
		const ground = new THREE.Mesh(
			new THREE.CircleGeometry(26, 48),
			new THREE.MeshStandardMaterial({ color: '#070a12', roughness: 0.95, metalness: 0 })
		);
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = -0.02;
		scene.add(ground);

		const grid = new THREE.GridHelper(40, 40, 0x1f6feb, 0x15345f);
		grid.material.transparent = true;
		grid.material.opacity = 0.45;
		scene.add(grid);

		// ---- 城市街區：少量暗色方塊增加景深 ----
		const blockMat = new THREE.MeshStandardMaterial({ color: '#0f1726', roughness: 0.8, metalness: 0.1 });
		const edgeMat = new THREE.LineBasicMaterial({ color: 0x2b4b7a, transparent: true, opacity: 0.6 });
		const occupied = STATIONS.map((s) => [s.x, s.z]);
		const blocks = new THREE.Group();
		let seed = 7;
		const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
		for (let i = 0; i < 14; i++) {
			const bx = (rnd() - 0.5) * 34;
			const bz = (rnd() - 0.5) * 34;
			if (occupied.some(([ox, oz]) => Math.hypot(bx - ox, bz - oz) < 4)) continue;
			const h = 1 + rnd() * 4;
			const bw = 1.6 + rnd() * 2.2;
			const bd = 1.6 + rnd() * 2.2;
			const geo = new THREE.BoxGeometry(bw, h, bd);
			const mesh = new THREE.Mesh(geo, blockMat);
			mesh.position.set(bx, h / 2, bz);
			blocks.add(mesh);
			const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
			edges.position.copy(mesh.position);
			blocks.add(edges);
		}
		scene.add(blocks);

		// ---- 充電站 marker ----
		const glowTex = makeStarTexture();
		const pulsers = []; // { orb, ring, glow, phase }
		const hitTargets = [];
		const disposables = [];
		STATIONS.forEach((st, i) => {
			const col = new THREE.Color(STATUS[st.status].color);
			const g = new THREE.Group();
			g.position.set(st.x, 0, st.z);

			// 光柱
			const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, 4, 8);
			const beamMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
			const beam = new THREE.Mesh(beamGeo, beamMat);
			beam.position.y = 2;
			g.add(beam);
			disposables.push(beamGeo, beamMat);

			// 頂端發光球
			const orbGeo = new THREE.SphereGeometry(0.42, 16, 16);
			const orbMat = new THREE.MeshBasicMaterial({ color: col });
			const orb = new THREE.Mesh(orbGeo, orbMat);
			orb.position.y = 4;
			g.add(orb);
			disposables.push(orbGeo, orbMat);

			// 地面光環
			const ringGeo = new THREE.TorusGeometry(1, 0.05, 8, 40);
			const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8 });
			const ring = new THREE.Mesh(ringGeo, ringMat);
			ring.rotation.x = -Math.PI / 2;
			ring.position.y = 0.05;
			g.add(ring);
			disposables.push(ringGeo, ringMat);

			// 柔光暈
			const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
			const glow = new THREE.Sprite(glowMat);
			glow.scale.set(2.6, 2.6, 1);
			glow.position.y = 4;
			g.add(glow);
			disposables.push(glowMat);

			// 透明點擊範圍（raycast 目標）
			const hitGeo = new THREE.SphereGeometry(1.6, 8, 8);
			const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
			const hit = new THREE.Mesh(hitGeo, hitMat);
			hit.position.y = 3.2;
			hit.userData.station = st;
			g.add(hit);
			hitTargets.push(hit);
			disposables.push(hitGeo, hitMat);

			scene.add(g);
			pulsers.push({ orb, ring, glow, phase: i * 0.9, busy: st.status === 'busy', off: st.status === 'offline' });
		});

		// ---- OrbitControls（不劫持頁面捲動）----
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 1.5, 0);
		controls.enableDamping = true;
		controls.dampingFactor = 0.08;
		controls.enablePan = false;
		controls.enableZoom = false; // 滾輪留給頁面捲動；縮放走 ＋／－ 鈕
		controls.autoRotate = true;
		controls.autoRotateSpeed = 0.55;
		controls.minPolarAngle = 0.35;
		controls.maxPolarAngle = Math.PI / 2.35;
		// 手機：單指讓頁面捲動，雙指才旋轉/縮放
		if (isMobile) controls.touches = { ONE: THREE.TOUCH.NONE, TWO: THREE.TOUCH.DOLLY_ROTATE };
		controls.update();
		controlsRef.current = controls;

		// ---- 點擊 / 點按挑站點（與拖曳區分）----
		const raycaster = new THREE.Raycaster();
		const ndc = new THREE.Vector2();
		const dom = renderer.domElement;
		let down = null;
		const onDown = (e) => { down = { x: e.clientX, y: e.clientY }; };
		const onUp = (e) => {
			if (!down) return;
			const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
			down = null;
			if (moved > 6) return; // 當作拖曳旋轉，不選取
			const rect = dom.getBoundingClientRect();
			ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(ndc, camera);
			const hits = raycaster.intersectObjects(hitTargets, false);
			setSelected(hits.length ? hits[0].object.userData.station : null);
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
			for (let i = 0; i < pulsers.length; i++) {
				const p = pulsers[i];
				if (p.off) { p.ring.material.opacity = 0.3; p.glow.material.opacity = 0.35; continue; }
				const speed = p.busy ? 3.2 : 1.6; // 使用中閃得快
				const s = 0.5 + 0.5 * Math.sin(t * speed + p.phase);
				p.ring.scale.setScalar(1 + s * 0.35);
				p.ring.material.opacity = 0.4 + s * 0.5;
				p.glow.material.opacity = 0.55 + s * 0.4;
				p.orb.scale.setScalar(0.9 + s * 0.25);
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
			ground.geometry.dispose();
			ground.material.dispose();
			grid.geometry.dispose();
			grid.material.dispose();
			blocks.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
			blockMat.dispose();
			edgeMat.dispose();
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
		const len = THREE.MathUtils.clamp(off.length() * factor, 9, 34);
		off.setLength(len);
		cam.position.copy(ctr.target).add(off);
		ctr.update();
	};

	if (!supported) return <ChargeMapMock />;

	return (
		<div className="SP-live">
			<div className="SP-live-canvas" ref={mountRef} />

			<div className="SP-live-legend">
				{Object.entries(STATUS).map(([k, v]) => (
					<span key={k} className="SP-live-legend-item">
						<span className="SP-live-dot" style={{ background: v.color }} />{v.label}
					</span>
				))}
			</div>

			<div className="SP-live-hint">{isTouch ? '雙指旋轉 · 點站點看詳情' : '拖曳旋轉 · 點站點看詳情'}</div>

			<div className="SP-live-zoom">
				<button type="button" aria-label="放大" onClick={() => zoom(0.82)}>＋</button>
				<button type="button" aria-label="縮小" onClick={() => zoom(1.22)}>－</button>
			</div>

			{selected && (
				<div className="SP-live-card" style={{ '--clr': STATUS[selected.status].color }}>
					<button type="button" className="SP-live-card-x" aria-label="關閉" onClick={() => setSelected(null)}>×</button>
					<div className="SP-live-card-id">站點 {selected.id}</div>
					<div className="SP-live-card-status">
						<span className="SP-live-dot" style={{ background: STATUS[selected.status].color }} />
						{STATUS[selected.status].label}
					</div>
					<div className="SP-live-card-kw">{selected.status === 'offline' ? '—' : `${selected.kw} kW`}</div>
				</div>
			)}
		</div>
	);
};

export default ChargeMap3D;
