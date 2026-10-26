import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { makeStarTexture } from 'shared/starTexture';
import { MonitorWallMock, StayJourneyMock, ChargeMapMock, FilterMock, OrgAgentMock, VoiceDashMock } from './mockups';
import './SideProject3D.scss';

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const GAP = 46;
const VIEW = 20;

const projects = [
	{
		key: 'monitor', color: '#22d3ee', mock: MonitorWallMock,
		title: '即時影像監控牆', tag: '效能取捨 · WebSocket',
		desc: `數百路影像串流匯成一面即時監控牆。難點全在效能取捨——同時解多路串流、斷線自動重連、頻寬不足時的降幀/降畫質策略，狀態用 WebSocket 即時推送。`,
	},
	{
		key: 'stay', color: '#34d399', mock: StayJourneyMock,
		title: '智慧旅宿房客旅程', tag: 'server 驅動 · 狀態機 · IoT',
		desc: `房客從一封 email 的 magic-link 進場，整段旅程由 server 驅動的 stage 狀態機推進（抵達前 → 入住日 → 住宿中 → 退房 → 評論）。串智慧門鎖與 IoT、OTA 訂單、通訊綁定，全程多語言並依案場時區顯示。這段的狀態機與各 stage 的 UX 我調最久。`,
	},
	{
		key: 'map', color: '#f59e0b', mock: ChargeMapMock,
		title: '充電站地圖', tag: '地圖 SDK · 叢集 · 即時狀態',
		desc: `全區電動車充電站地圖：多站點叢集、即時狀態（可用 / 使用中 / 離線）、點選看站點詳情。重點在大量 marker 的效能與叢集策略，以及狀態即時更新。`,
	},
	{
		key: 'filter', color: '#a78bfa', mock: FilterMock,
		title: '多條件篩選器組合', tag: '最高頻 · 看似平凡做對很難',
		desc: `後台系統出現頻率最高、也最容易做半套的東西。多條件組合 × URL 同步（可分享、可回上一步）× 換頁保留 × 「重設」的語意要對——每一項單獨簡單，湊在一起做對很難。`,
	},
	{
		key: 'org', color: '#818cf8', mock: OrgAgentMock,
		title: 'AI 員工編排平台', tag: '多代理 · 組織 · 治理',
		desc: `把一群 AI agent 當成「AI 員工」來編排：自動生成組織（CEO / CTO / 各部門），每個員工有自己的工具、知識庫與 MCP。重點是治理——我設了階層規則：最下層的 agent 不能自己再生 agent、主管只負責指揮不親自動手，避免失控與無限展開。`,
	},
	{
		key: 'voice', color: '#2dd4bf', mock: VoiceDashMock,
		title: '語音答詢治理看板', tag: '語音 AI · 語意層 · 資料一致',
		desc: `同一個頁面：治理看板 + 語音/文字答詢。關鍵是看板上的數字和 AI 助理講出來的數字來自「同一個語意層」，所以永遠一致。串 OpenAI Realtime（WebRTC 直連、短效憑證不外洩金鑰），模型要數字時走 function call 查語意層、寫稽核日誌，還有權限過濾與「無法回答」的處理。`,
	},
];

const SideProject3D = () => {
	const mountRef = useRef(null);
	const outerRef = useRef(null);
	const panelRefs = useRef([]);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia('(max-width: 768px)');
		const on = () => setIsMobile(mq.matches);
		on();
		mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
		return () => { mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on); };
	}, []);

	useEffect(() => {
		if (isMobile) return;
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

		const n = projects.length;
		const totalDepth = (n - 1) * GAP;

		const starCount = 1400;
		const spos = new Float32Array(starCount * 3);
		for (let i = 0; i < starCount; i++) {
			spos[i * 3] = (Math.random() - 0.5) * 160;
			spos[i * 3 + 1] = (Math.random() - 0.5) * 120;
			spos[i * 3 + 2] = 20 - Math.random() * (totalDepth + 80);
		}
		const starGeo = new THREE.BufferGeometry();
		starGeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
		const starMat = new THREE.PointsMaterial({ color: 0x9fd8ff, size: 1.6, map: makeStarTexture(), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
		scene.add(new THREE.Points(starGeo, starMat));

		// 每個作品一面漂浮螢幕框（相機飛過）
		const frames = projects.map((p, i) => {
			const edges = new THREE.EdgesGeometry(new THREE.PlaneGeometry(30, 17));
			const frame = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: new THREE.Color(p.color) }));
			frame.position.set(i % 2 === 0 ? -2 : 2, 0, -i * GAP);
			scene.add(frame);
			return frame;
		});

		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));
		composer.addPass(new UnrealBloomPass(new THREE.Vector2(width / 2, height / 2), 0.6, 0.5, 0.12));

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
			camera.position.x = Math.sin(t * 0.22) * 0.8;
			camera.position.y = Math.cos(t * 0.18) * 0.5;
			camera.lookAt(0, 0, camera.position.z - VIEW);

			for (let i = 0; i < frames.length; i++) {
				frames[i].rotation.y = Math.sin(t * 0.3 + i) * 0.12;
			}

			for (let i = 0; i < n; i++) {
				const center = i / (n - 1);
				const op = 1 - clamp(Math.abs(prog - center) / band, 0, 1);
				const panel = panelRefs.current[i];
				if (panel) {
					panel.style.opacity = op;
					panel.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
				}
			}
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
			frames.forEach((f) => { f.geometry.dispose(); f.material.dispose(); });
			composer.dispose?.();
			if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
		};
	}, [isMobile]);

	if (isMobile) {
		return (
			<section id="SideProject" className="SideProject3D SideProject3D--mobile">
				<div className="SP-m-title">SIDE PROJECTS · 技術重刻（去識別化）</div>
				{projects.map((p) => {
					const Mock = p.mock;
					return (
						<div key={p.key} className="SP-m-card" style={{ '--clr': p.color }}>
							<div className="SP-m-mock"><Mock /></div>
							<div className="SP-m-tag">{p.tag}</div>
							<div className="SP-m-title2">{p.title}</div>
							<div className="SP-m-desc">{p.desc}</div>
						</div>
					);
				})}
			</section>
		);
	}

	return (
		<section id="SideProject" className="SideProject3D" ref={outerRef} style={{ height: `${projects.length * 78}vh` }}>
			<div className="SP-sticky">
				<div className="SP-canvas" ref={mountRef} />
				{projects.map((p, i) => {
					const Mock = p.mock;
					return (
						<div
							key={p.key}
							className="SP-panel"
							ref={(el) => (panelRefs.current[i] = el)}
							style={{ opacity: 0, '--clr': p.color }}>
							<div className="SP-panel-mock"><Mock /></div>
							<div className="SP-panel-info">
								<div className="SP-panel-kicker">SIDE PROJECT · 去識別化重刻</div>
								<div className="SP-panel-tag">{p.tag}</div>
								<div className="SP-panel-title">{p.title}</div>
								<div className="SP-panel-desc">{p.desc}</div>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default SideProject3D;
