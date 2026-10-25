import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import Avatar1 from 'design/images/avatar1.png';
import Avatar2 from 'design/images/avatar2.jpeg';
import { makeStarTexture } from 'shared/starTexture';
import './InfoScene.scss';

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const smooth = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

const InfoScene = () => {
	const mountRef = useRef(null);
	const outerRef = useRef(null);
	const heroRef = useRef(null);
	const introRef = useRef(null);
	const skillsRef = useRef(null);

	useEffect(() => {
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
		scene.fog = new THREE.FogExp2('#05060a', 0.015);
		const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 400);
		camera.position.set(0, 0, 26);

		// 星空
		const starCount = 1400;
		const sp = new Float32Array(starCount * 3);
		for (let i = 0; i < starCount; i++) {
			sp[i * 3] = (Math.random() - 0.5) * 160;
			sp[i * 3 + 1] = (Math.random() - 0.5) * 120;
			sp[i * 3 + 2] = -Math.random() * 120;
		}
		const starGeo = new THREE.BufferGeometry();
		starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
		const starMat = new THREE.PointsMaterial({ color: 0x9fd8ff, size: 1.6, map: makeStarTexture(), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
		scene.add(new THREE.Points(starGeo, starMat));

		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));
		composer.addPass(new UnrealBloomPass(new THREE.Vector2(width / 2, height / 2), 0.4, 0.5, 0.4));

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

		let raf = 0;
		const clock = new THREE.Clock();
		const animate = () => {
			raf = requestAnimationFrame(animate);
			if (!visible) return;
			const t = clock.getElapsedTime();

			const rect = outer.getBoundingClientRect();
			const total = rect.height - window.innerHeight;
			const prog = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;

			// 相機在星空中緩緩推進 + 輕微漂移
			camera.position.z = 22 - prog * 8;
			camera.position.x = Math.sin(t * 0.25) * 1.2;
			camera.position.y = Math.cos(t * 0.2) * 0.8;
			camera.lookAt(0, 0, 0);

			// 三段文字淡入淡出（第一幕一開始就全顯）
			const a1 = 1 - smooth(prog, 0.26, 0.36);
			const a2 = smooth(prog, 0.36, 0.46) * (1 - smooth(prog, 0.62, 0.72));
			const a3 = smooth(prog, 0.72, 0.82);
			if (heroRef.current) heroRef.current.style.opacity = a1;
			if (introRef.current) introRef.current.style.opacity = a2;
			if (skillsRef.current) skillsRef.current.style.opacity = a3;

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
			composer.dispose?.();
			if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
		};
	}, []);

	return (
		<section id="Information" className="InfoScene" ref={outerRef}>
			<div className="InfoScene-sticky">
				<div className="InfoScene-canvas" ref={mountRef} />

				{/* 第一幕：身份 */}
				<div className="InfoScene-hero" ref={heroRef}>
					<div className="InfoScene-avatars">
						<img src={Avatar1} alt="洪世桓" className="InfoScene-avatar" />
						<img src={Avatar2} alt="史萊姆 logo" className="InfoScene-avatar InfoScene-avatar--slime" />
					</div>
					<div className="InfoScene-name">洪世桓</div>
					<div className="InfoScene-role">ADE · Any-Domain Engineer</div>
					<div className="InfoScene-tagline">{`「哪都能做」工程師
這年頭 vibe coding，工程師好像都被逼成 Any-Domain —— 什麼都得做得出來 XD`}</div>
					<div className="InfoScene-contact">🏠 Taipei　📬 getsulin@gmail.com　🏫 臺師大 數學系</div>
					<div className="InfoScene-scrollhint">往下捲 ↓</div>
				</div>

				{/* 第二幕：自介 */}
				<div className="InfoScene-panel InfoScene-intro" ref={introRef}>
					<div className="InfoScene-panel-kicker">ABOUT</div>
					<div className="InfoScene-panel-text">{`一隻從大學開始接觸程式的史萊姆。數學系出身，比起死記語法，更吃的是看文件、問 AI、試錯，然後把想法硬做成畫面的能力。

自從 AI 普及後，工程的門檻從「會不會寫」變成「敢不敢落地」——而把設計與想法實際變成能動的畫面，正是支撐我一直學下去的成就感來源。`}</div>
				</div>

				{/* 第三幕：技能 */}
				<div className="InfoScene-panel InfoScene-skills" ref={skillsRef}>
					<div className="InfoScene-panel-kicker">SKILLS</div>
					<div className="InfoScene-skillgrid">
						{[
							['前端 React / Vue', '本行·多套企業後台與儀表板'],
							['後端 Service', '2024 進入·Node/Express·MongoDB·Docker'],
							['雲端 / 部署', 'AWS EC2·GoDaddy·Docker·Vercel'],
							['Python / 爬蟲', '自動化蒐集與清洗資料'],
							['Unity XR / C#', '2025 進入·Quest 3 實機'],
							['Edge AI / 電腦視覺', '地端即時影像·GPU 推論'],
						].map(([t, d]) => (
							<div key={t} className="InfoScene-skillcard">
								<div className="InfoScene-skillcard-t">{t}</div>
								<div className="InfoScene-skillcard-d">{d}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default InfoScene;
