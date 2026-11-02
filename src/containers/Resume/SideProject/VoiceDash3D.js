import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VoiceDashMock } from './mockups';
import './SPLive.scss';

// 去識別化假數據：通用的語音答詢治理指標，無任何真實客戶數字
const BAR_COLOR = '#2dd4bf';
const BARS = [
	{ d: '一', v: 128 }, { d: '二', v: 156 }, { d: '三', v: 142 },
	{ d: '四', v: 171 }, { d: '五', v: 198 }, { d: '六', v: 96 }, { d: '日', v: 88 },
];
const MAXV = 210;
const GAUGES = [
	{ label: '答詢命中率', value: 0.94, disp: '94%', color: '#2dd4bf', note: '模型查語意層、答得出來的比例' },
	{ label: '資料一致率', value: 1.0, disp: '100%', color: '#38bdf8', note: '看板數字與 AI 口述同源，永遠一致' },
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
	const sprite = new THREE.Sprite(mat);
	return { sprite, tex, mat };
}

const VoiceDash3D = () => {
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
		scene.fog = new THREE.FogExp2('#05070d', 0.02);
		const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
		camera.position.set(0, 4.5, 14);
		cameraRef.current = camera;

		scene.add(new THREE.AmbientLight(0x9fd8ff, 0.6));
		const dir = new THREE.DirectionalLight(0xffffff, 0.85);
		dir.position.set(5, 10, 8);
		scene.add(dir);

		// 底座
		const base = new THREE.Mesh(
			new THREE.CylinderGeometry(8.4, 8.4, 0.3, 48),
			new THREE.MeshStandardMaterial({ color: '#0a1120', roughness: 0.9, metalness: 0.1 })
		);
		base.position.y = -0.15;
		scene.add(base);
		const baseRing = new THREE.Mesh(
			new THREE.TorusGeometry(8.4, 0.05, 8, 64),
			new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.5 })
		);
		baseRing.rotation.x = -Math.PI / 2;
		baseRing.position.y = 0.02;
		scene.add(baseRing);

		const hitTargets = [];
		const disposables = [base.geometry, base.material, baseRing.geometry, baseRing.material];
		const pulsers = [];

		// ---- 柱狀圖：本週答詢量 ----
		const barColor = new THREE.Color(BAR_COLOR);
		BARS.forEach((b, i) => {
			const h = (b.v / MAXV) * 5.2 + 0.3;
			const geo = new THREE.BoxGeometry(0.92, h, 0.92);
			geo.translate(0, h / 2, 0);
			const mat = new THREE.MeshStandardMaterial({ color: barColor, emissive: barColor, emissiveIntensity: 0.5, roughness: 0.4, metalness: 0.2 });
			const bar = new THREE.Mesh(geo, mat);
			bar.position.set((i - (BARS.length - 1) / 2) * 1.35, 0.15, 0);
			bar.userData.metric = { kind: 'bar', id: `bar-${i}`, label: `週${b.d}`, value: `${b.v} 筆`, note: '當日語音/文字答詢筆數' };
			scene.add(bar);
			hitTargets.push(bar);
			disposables.push(geo, mat);
			pulsers.push({ type: 'bar', mat, phase: i * 0.5, id: `bar-${i}` });
		});

		// ---- 環狀指標 ----
		GAUGES.forEach((g, gi) => {
			const grp = new THREE.Group();
			grp.position.set((gi === 0 ? -3.4 : 3.4), 5.4, -0.6);
			const col = new THREE.Color(g.color);

			const bg = new THREE.Mesh(
				new THREE.TorusGeometry(1.5, 0.16, 10, 56),
				new THREE.MeshBasicMaterial({ color: 0x223049 })
			);
			grp.add(bg);
			disposables.push(bg.geometry, bg.material);

			const arc = new THREE.Mesh(
				new THREE.TorusGeometry(1.5, 0.22, 10, 56, Math.PI * 2 * g.value),
				new THREE.MeshBasicMaterial({ color: col })
			);
			arc.rotation.z = Math.PI / 2; // 從頂端起算
			grp.add(arc);
			disposables.push(arc.geometry, arc.material);

			const pct = makeLabel(g.disp, '#ffffff', 60);
			pct.sprite.scale.set(2.4, 1.2, 1);
			pct.sprite.position.set(0, 0, 0.1);
			grp.add(pct.sprite);
			disposables.push(pct.tex, pct.mat);

			const title = makeLabel(g.label, g.color, 40);
			title.sprite.scale.set(3.6, 1.8, 1);
			title.sprite.position.set(0, -2.1, 0);
			grp.add(title.sprite);
			disposables.push(title.tex, title.mat);

			// 透明點擊範圍
			const hit = new THREE.Mesh(
				new THREE.CircleGeometry(1.7, 20),
				new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
			);
			hit.userData.metric = { kind: 'gauge', id: `gauge-${gi}`, label: g.label, value: g.disp, note: g.note };
			grp.add(hit);
			hitTargets.push(hit);
			disposables.push(hit.geometry, hit.material);

			scene.add(grp);
			pulsers.push({ type: 'gauge', mat: arc.material, baseColor: col, phase: gi * 1.1, id: `gauge-${gi}` });
		});

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 3, 0);
		controls.enableDamping = true;
		controls.dampingFactor = 0.08;
		controls.enablePan = false;
		controls.enableZoom = false;
		controls.autoRotate = true;
		controls.autoRotateSpeed = 0.5;
		controls.minPolarAngle = 0.6;
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
			setSelected(hits.length ? hits[0].object.userData.metric : null);
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
				const s = 0.5 + 0.5 * Math.sin(t * 1.6 + p.phase);
				if (p.type === 'bar') p.mat.emissiveIntensity = 0.4 + s * 0.5;
				else p.mat.color.copy(p.baseColor).multiplyScalar(0.8 + s * 0.4);
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
		const len = THREE.MathUtils.clamp(off.length() * factor, 9, 24);
		off.setLength(len);
		cam.position.copy(ctr.target).add(off);
		ctr.update();
	};

	if (!supported) return <VoiceDashMock />;

	return (
		<div className="SP-live">
			<div className="SP-live-canvas" ref={mountRef} />

			<div className="SP-live-legend">
				<span className="SP-live-legend-item"><span className="SP-live-dot" style={{ background: BAR_COLOR }} />本週答詢量</span>
				<span className="SP-live-legend-item"><span className="SP-live-dot" style={{ background: '#38bdf8' }} />治理指標</span>
			</div>

			<div className="SP-live-hint">{isTouch ? '雙指旋轉 · 點指標看明細' : '拖曳旋轉 · 點指標看明細'}</div>

			<div className="SP-live-zoom">
				<button type="button" aria-label="放大" onClick={() => zoom(0.82)}>＋</button>
				<button type="button" aria-label="縮小" onClick={() => zoom(1.22)}>－</button>
			</div>

			{selected && (
				<div className="SP-live-card" style={{ '--clr': selected.kind === 'gauge' ? '#38bdf8' : BAR_COLOR }}>
					<button type="button" className="SP-live-card-x" aria-label="關閉" onClick={() => setSelected(null)}>×</button>
					<div className="SP-live-card-id">{selected.label}</div>
					<div className="SP-live-card-kw">{selected.value}</div>
					<div className="SP-live-card-note">{selected.note}</div>
				</div>
			)}
		</div>
	);
};

export default VoiceDash3D;
