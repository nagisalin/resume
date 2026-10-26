import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { makeStarTexture } from 'shared/starTexture';
import './Experience3D.scss';

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const GAP = 46;
const VIEW = 20;

const rawStops = [
	{
		key: 'teach', year: '2018 – 2021', color: '#f59e0b',
		role: '課程設計 / 教學講師', org: '瑞比智慧科技 (CodingBar)',
		desc: `設計最初版 Python 程式教育課程，規劃投影片與習題、錄製線上課程與資優班教材；帶 3~5 人課程組分工，並規劃證照題庫提高通過率。`,
	},
	{
		key: 'fe1', year: '2021 – 2023', color: '#38bdf8',
		role: 'Front-End Engineer', org: '瑞比智慧科技 (CodingBar)',
		desc: `程式教學平台的前端維護與新功能開發，與後端串 API、把關 deploy 至 staging/prod；擔任 1~3 人前端負責人兼專案 PM；用 GCP Cloud Functions 承接自動化爬蟲外包。`,
	},
	{
		key: 'fe2', year: '2023 – 2024', color: '#a78bfa',
		role: 'Front-End Engineer', org: '太平洋建設 (蝦米智慧)',
		desc: `專案型前端，一人從開版、RWD、Webpack 到部署於 IIS 上線；製作多個官網與內部系統（停車場後台、ISMS、OA、KIOSK 介面），並負責專案的資安黑白箱弱掃。`,
	},
	{
		key: 'ade', year: '2024 – 至今', color: '#34d399',
		role: 'ADE · Any-Domain Engineer', org: 'LSC / Sonice（在職中）',
		desc: `數學系出身，沒有一個技術領域是科班，但這 32 個月它們都上線了——35 個專案一人從第一行寫到部署，橫跨前端、後端、Python、Unity XR、Edge AI（細節見「跨領域落地」）。`,
	},
	{
		key: 'value', year: '', color: '#ffd166', isValue: true,
		role: '', org: 'VALUE',
		desc: `在 LSC/Sonice，除了被指派的專案，我也主動做了一些「沒人要求、但能讓團隊更好」的東西：

・一套內部專案管理系統 (PMS)，取代原本 GitLab Ticket 的問題回報流程（還藏了些彩蛋）
・gitlab-ci-monitor：盯著 CI 狀態不再漏接
・Artemis / Autopilot 自動化計畫、常用頁面的收集系統
・把一份模糊的客戶 RFP，一路討論釐清成可執行的規格、功能工時報價與角色架構圖

這年頭 vibe coding 越來越方便，「會不會寫扣」早就不是重點——
重點一直是「有想法、能發現問題、並提出改善方案」的人。`,
		slogan: '重要的不是你在現場完成了什麼，而是你能為現場帶來什麼。',
	},
];

// 時間軸由最近往回（2024 → 2018）；價值觀結尾 block 固定在最後
const stops = [...rawStops.slice(0, 4).reverse(), rawStops[4]];

const Experience3D = () => {
	const mountRef = useRef(null);
	const outerRef = useRef(null);
	const panelRefs = useRef([]);
	const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches);

	useEffect(() => {
		const mq = window.matchMedia('(max-width: 1024px)');
		const on = () => setIsMobile(mq.matches);
		on();
		mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
		return () => { mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on); };
	}, []);

	useEffect(() => {
		if (isMobile) return; // 手機走 DOM 卡片，不起 WebGL
		const mount = mountRef.current;
		const outer = outerRef.current;
		if (!mount || !outer) return;
		const test = document.createElement('canvas');
		if (!(test.getContext('webgl2') || test.getContext('webgl'))) return;

		let width = mount.clientWidth;
		let height = mount.clientHeight;
		const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
		renderer.setPixelRatio(1);
		renderer.setSize(width, height);
		mount.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2('#05060a', 0.013);
		const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 400);
		camera.position.set(0, 0, VIEW);

		const n = stops.length;
		const totalDepth = (n - 1) * GAP;

		// 星空
		const starCount = 1400;
		const sp = new Float32Array(starCount * 3);
		for (let i = 0; i < starCount; i++) {
			sp[i * 3] = (Math.random() - 0.5) * 160;
			sp[i * 3 + 1] = (Math.random() - 0.5) * 120;
			sp[i * 3 + 2] = 20 - Math.random() * (totalDepth + 80);
		}
		const starGeo = new THREE.BufferGeometry();
		starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
		const starMat = new THREE.PointsMaterial({ color: 0x9fd8ff, size: 1.6, map: makeStarTexture(), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
		scene.add(new THREE.Points(starGeo, starMat));

		// 時間隧道：每個時期一個發光環 + 中心節點，中間用細線串起
		const rings = [];
		const beamPts = [];
		stops.forEach((s, i) => {
			const z = -i * GAP;
			const ring = new THREE.Mesh(
				new THREE.TorusGeometry(8, 0.22, 10, 60),
				new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color) })
			);
			ring.position.set(0, 0, z);
			scene.add(ring);
			rings.push(ring);

			const node = new THREE.Mesh(
				new THREE.SphereGeometry(0.7, 18, 18),
				new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color) })
			);
			node.position.set(0, 0, z);
			scene.add(node);
			beamPts.push(new THREE.Vector3(0, 0, z));
		});
		const beam = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints(beamPts),
			new THREE.LineBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.5 })
		);
		scene.add(beam);

		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));
		composer.addPass(new UnrealBloomPass(new THREE.Vector2(width / 2, height / 2), 0.7, 0.55, 0.1));

		const onResize = () => {
			width = mount.clientWidth;
			height = mount.clientHeight;
			renderer.setSize(width, height);
			composer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		};
		window.addEventListener('resize', onResize);

		let visible = false;
		const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0, rootMargin: '200px 0px' });
		io.observe(outer);

		const band = 0.55 / (n - 1);
		let raf = 0;
		const clock = new THREE.Clock();
		const animate = () => {
			raf = requestAnimationFrame(animate);
			if (!visible) return;
			const t = clock.getElapsedTime();
			const rect = outer.getBoundingClientRect();
			const total = rect.height - window.innerHeight;
			const prog = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;

			camera.position.z = VIEW - prog * totalDepth;
			camera.position.x = Math.sin(t * 0.25) * 0.8;
			camera.position.y = Math.cos(t * 0.2) * 0.6;
			camera.lookAt(0, 0, camera.position.z - VIEW);

			for (let i = 0; i < rings.length; i++) {
				rings[i].rotation.z = t * 0.2 + i;
			}

			const active = clamp(Math.round(prog * (n - 1)), 0, n - 1);
			for (let i = 0; i < n; i++) {
				const center = i / (n - 1);
				const op = 1 - clamp(Math.abs(prog - center) / band, 0, 1);
				const panel = panelRefs.current[i];
				if (panel) {
					panel.style.opacity = op;
					panel.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
				}
			}
			void active;
			composer.render();
		};
		raf = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
			window.removeEventListener('resize', onResize);
			renderer.dispose();
			starGeo.dispose();
			starMat.dispose();
			rings.forEach((r) => { r.geometry.dispose(); r.material.dispose(); });
			composer.dispose?.();
			if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
		};
	}, [isMobile]);

	if (isMobile) {
		return (
			<section id="Experience" key="exp-mobile" className="Experience3D Experience3D--mobile">
				<div className="Exp3D-m-title">EXPERIENCE</div>
				{stops.map((s, i) => (
					<div key={s.key} className={`Exp3D-m-card${s.isValue ? ' is-value' : ''}`} style={{ '--clr': s.color }}>
						{i === 0 && <div className="Exp3D-now">NOW · 現在</div>}
						{s.year && <div className="Exp3D-m-year">{s.year}</div>}
						{s.role && <div className="Exp3D-m-role">{s.role}</div>}
						{s.org !== 'VALUE' && <div className="Exp3D-m-org">{s.org}</div>}
						<div className="Exp3D-m-desc">{s.desc}</div>
						{s.slogan && <div className="Exp3D-m-slogan">{s.slogan}</div>}
					</div>
				))}
			</section>
		);
	}

	return (
		<section id="Experience" key="exp-desktop" className="Experience3D" ref={outerRef} style={{ height: `${stops.length * 75}vh` }}>
			<div className="Exp3D-sticky">
				<div className="Exp3D-canvas" ref={mountRef} />
				{stops.map((s, i) => (
					<div
						key={s.key}
						className={`Exp3D-panel${s.isValue ? ' is-value' : ''}`}
						ref={(el) => (panelRefs.current[i] = el)}
						style={{ opacity: 0, '--clr': s.color }}>
						{i === 0 && <div className="Exp3D-now">NOW · 現在</div>}
						{s.year && <div className="Exp3D-panel-year">{s.year}</div>}
						{s.isValue && <div className="Exp3D-panel-kicker">VALUE</div>}
						{s.role && <div className="Exp3D-panel-role">{s.role}</div>}
						{s.org !== 'VALUE' && <div className="Exp3D-panel-org">{s.org}</div>}
						<div className="Exp3D-panel-desc">{s.desc}</div>
						{s.slogan && <div className="Exp3D-panel-slogan">{s.slogan}</div>}
					</div>
				))}
			</div>
		</section>
	);
};

export default Experience3D;
