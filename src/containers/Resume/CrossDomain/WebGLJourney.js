import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { buildModel } from './models';
import { makeStarTexture } from 'shared/starTexture';
import './WebGLJourney.scss';

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const GAP = 50;
const VIEW = 24; // 相機與聚焦物件的距離（越大物件越小）

const WebGLJourney = ({ stations }) => {
	const mountRef = useRef(null);
	const outerRef = useRef(null);
	const stickyRef = useRef(null);
	const panelRefs = useRef([]);
	const dotRefs = useRef([]);

	const n = stations.length;

	useEffect(() => {
		const mount = mountRef.current;
		const outer = outerRef.current;
		if (!mount || !outer) return;

		const testCanvas = document.createElement('canvas');
		if (!(testCanvas.getContext('webgl2') || testCanvas.getContext('webgl'))) return;

		let width = mount.clientWidth;
		let height = mount.clientHeight;

		const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
		renderer.setPixelRatio(1); // 鎖 1：泛光成本最關鍵的來源
		renderer.setSize(width, height);
		mount.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2('#05060a', 0.012);

		const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 400);
		camera.position.set(0, 0, VIEW);

		const totalDepth = (n - 1) * GAP;

		// 星空
		const starCount = 1500;
		const starPos = new Float32Array(starCount * 3);
		for (let i = 0; i < starCount; i++) {
			starPos[i * 3] = (Math.random() - 0.5) * 160;
			starPos[i * 3 + 1] = (Math.random() - 0.5) * 120;
			starPos[i * 3 + 2] = 20 - Math.random() * (totalDepth + 80);
		}
		const starGeo = new THREE.BufferGeometry();
		starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
		const starMat = new THREE.PointsMaterial({
			color: 0x9fd8ff, size: 1.6, map: makeStarTexture(), transparent: true, opacity: 0.9,
			blending: THREE.AdditiveBlending, depthWrite: false,
		});
		scene.add(new THREE.Points(starGeo, starMat));

		// 打光（讓實心模型有立體感）
		scene.add(new THREE.AmbientLight(0xffffff, 0.55));
		const key = new THREE.DirectionalLight(0xffffff, 1.1);
		key.position.set(4, 6, 8);
		scene.add(key);
		const rim = new THREE.DirectionalLight(0x88aaff, 0.6);
		rim.position.set(-6, -2, -4);
		scene.add(rim);

		// 各領域具象 3D 模型
		const stationMeshes = stations.map((s, i) => {
			const group = buildModel(s.key, s.color);
			group.position.set(i % 2 === 0 ? -3 : 3, (i % 2 === 0 ? 1 : -1) * 1.5, -i * GAP);
			scene.add(group);
			return group;
		});

		// 泛光（半解析度，省很多）
		const composer = new EffectComposer(renderer);
		composer.setPixelRatio(1);
		composer.addPass(new RenderPass(scene, camera));
		const bloom = new UnrealBloomPass(new THREE.Vector2(width / 2, height / 2), 0.55, 0.5, 0.22);
		composer.addPass(bloom);

		const onResize = () => {
			width = mount.clientWidth;
			height = mount.clientHeight;
			renderer.setSize(width, height);
			composer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		};
		window.addEventListener('resize', onResize);

		// 迴圈一直活著；離開畫面只跳過繪製（避免停掉後重啟時重建 GPU 圖層卡頓）
		let visible = false;
		let raf = 0;
		const io = new IntersectionObserver(
			([entry]) => { visible = entry.isIntersecting; },
			{ threshold: 0, rootMargin: '200px 0px' }
		);
		io.observe(outer);

		const band = 0.6 / (n - 1);
		const clock = new THREE.Clock();

		const animate = () => {
			raf = requestAnimationFrame(animate);
			if (!visible) return; // 不在畫面內：只排程、不繪製
			const t = clock.getElapsedTime();

			// 直接從 DOM 讀捲動進度（不經 React）
			const rect = outer.getBoundingClientRect();
			const total = rect.height - window.innerHeight;
			const prog = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;

			camera.position.z = VIEW - prog * totalDepth;
			camera.position.x = Math.sin(t * 0.3) * 1.2;
			camera.position.y = Math.cos(t * 0.24) * 0.8;
			camera.lookAt(0, 0, camera.position.z - VIEW);

			for (let i = 0; i < stationMeshes.length; i++) {
				stationMeshes[i].rotation.y = t * 0.25 + i; // 轉盤式慢轉，保持正立
			}

			// 直接改面板 / 里程點的 DOM（不觸發 React 重繪）
			const active = clamp(Math.round(prog * (n - 1)), 0, n - 1);
			for (let i = 0; i < n; i++) {
				const center = n === 1 ? 0.5 : i / (n - 1);
				const op = 1 - clamp(Math.abs(prog - center) / band, 0, 1);
				const panel = panelRefs.current[i];
				if (panel) {
					panel.style.opacity = op;
					panel.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
				}
				const dot = dotRefs.current[i];
				if (dot) {
					dot.style.background = i === active ? stations[i].color : 'rgba(255,255,255,0.25)';
					dot.style.transform = i === active ? 'scale(1.6)' : 'scale(1)';
				}
			}

			composer.render();
		};

		raf = requestAnimationFrame(animate); // 啟動常駐迴圈

		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
			window.removeEventListener('resize', onResize);
			renderer.dispose();
			starGeo.dispose();
			starMat.dispose();
			stationMeshes.forEach((grp) => grp.traverse((o) => {
				if (o.geometry) o.geometry.dispose();
				if (o.material) o.material.dispose();
			}));
			composer.dispose?.();
			if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
		};
	}, [stations, n]);

	return (
		<section className="WebGLJourney" ref={outerRef} style={{ height: `${n * 70}vh` }}>
			<div className="WebGLJourney-sticky" ref={stickyRef}>
				<div className="WebGLJourney-canvas" ref={mountRef} />

				{stations.map((s, i) => (
					<div
						key={s.key}
						className="WebGLJourney-panel"
						ref={(el) => (panelRefs.current[i] = el)}
						style={{ opacity: 0, '--clr': s.color }}>
						<div className="WebGLJourney-panel-en">{s.en}</div>
						<div className="WebGLJourney-panel-tag">{s.tag}</div>
						<div className="WebGLJourney-panel-title">{s.title}</div>
						<div className="WebGLJourney-panel-desc">{s.description}</div>
					</div>
				))}

				<div className="WebGLJourney-dots">
					{stations.map((s, i) => (
						<span
							key={s.key}
							className="WebGLJourney-dot"
							ref={(el) => (dotRefs.current[i] = el)}
							style={{ background: 'rgba(255,255,255,0.25)' }}
						/>
					))}
				</div>
			</div>
		</section>
	);
};

export default WebGLJourney;
