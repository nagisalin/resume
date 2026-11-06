import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import Avatar1 from 'design/images/avatar1.png';
import Avatar2 from 'design/images/avatar2.jpeg';
import { makeStarTexture } from 'shared/starTexture';
import { glue } from 'shared/text';
import './InfoScene.scss';

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const smooth = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

// 技能卡：一律用「技術標籤」陣列，風格一致（不再混散句與年份；年份/新舊在「經歷」「跨領域」已交代）
const SKILLS = [
	['前端 React / Vue', ['React', 'Vue', 'RWD', '報表', 'i18n']],
	['後端 Service', ['Node', 'Express', 'MongoDB', 'Docker']],
	['雲端 / 部署', ['AWS EC2', 'GoDaddy', 'Docker', 'Vercel']],
	['Python / 爬蟲', ['Python', '爬蟲', '排程自動化']],
	['Unity XR / C#', ['Unity', 'C#', 'Meta Quest 3', 'WebXR']],
	['Edge AI / 電腦視覺', ['物件偵測', 'VLM', 'GPU 推論']],
];
const ABOUT = `一隻從大學開始接觸程式的史萊姆。數學系出身，比起死記語法，更吃的是看文件、問 AI、試錯，然後把想法硬做成畫面的能力。

自從 AI 普及後，工程的門檻從「會不會寫」變成「敢不敢落地」——而把設計與想法實際變成能動的畫面，正是支撐我一直學下去的成就感來源。`;

const InfoScene = () => {
	const mountRef = useRef(null);
	const mobileMountRef = useRef(null);
	const outerRef = useRef(null);
	const heroRef = useRef(null);
	const introRef = useRef(null);
	const skillsRef = useRef(null);
	const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches);
	// 只有「不支援 WebGL」才退回靜態堆疊版；手機照樣跑捲動 3D（用效能檔）
	const [useStatic] = useState(() => {
		if (typeof window === 'undefined') return true;
		try { const c = document.createElement('canvas'); return !(c.getContext('webgl2') || c.getContext('webgl')); }
		catch { return true; }
	});

	useEffect(() => {
		const mq = window.matchMedia('(max-width: 1024px)');
		const on = () => setIsMobile(mq.matches);
		on();
		mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
		return () => { mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on); };
	}, []);

	useEffect(() => {
		if (useStatic || isMobile) return; // 只有桌機跑分幕 cinema；手機走 sticky 背景 + 正常流文字
		const mount = mountRef.current;
		const outer = outerRef.current;
		if (!mount || !outer) return;

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

		// 星空（手機砍半，省頂點與 overdraw）
		const starCount = isMobile ? 700 : 1400;
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
		const bloomRes = isMobile ? 3 : 2; // 手機用 1/3 解析度泛光（fill-rate 是手機最大成本）
		const bloom = new UnrealBloomPass(new THREE.Vector2(width / bloomRes, height / bloomRes), isMobile ? 0.34 : 0.4, 0.5, 0.4);
		composer.addPass(bloom);

		const onResize = () => {
			width = mount.clientWidth;
			height = mount.clientHeight;
			renderer.setSize(width, height);
			composer.setSize(width, height);
			bloom.setSize(width / bloomRes, height / bloomRes); // setSize 後重設，維持降解析度
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
	}, [useStatic, isMobile]);

	// ---- 手機（有 WebGL）：只跑背景星空；文字走正常流，不碰 opacity ----
	useEffect(() => {
		if (useStatic || !isMobile) return;
		const mount = mobileMountRef.current;
		const outer = outerRef.current;
		if (!mount || !outer) return;

		let width = mount.clientWidth;
		let height = mount.clientHeight;
		const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
		renderer.setPixelRatio(1);
		renderer.setSize(width, height);
		mount.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 400);
		camera.position.set(0, 0, 24);

		const starCount = 600;
		const sp = new Float32Array(starCount * 3);
		for (let i = 0; i < starCount; i++) {
			sp[i * 3] = (Math.random() - 0.5) * 170;
			sp[i * 3 + 1] = (Math.random() - 0.5) * 170;
			sp[i * 3 + 2] = -Math.random() * 140;
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.BufferAttribute(sp, 3));
		const m = new THREE.PointsMaterial({ color: 0x9fd8ff, size: 1.7, map: makeStarTexture(), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
		scene.add(new THREE.Points(g, m));

		const onResize = () => {
			width = mount.clientWidth; height = mount.clientHeight;
			renderer.setSize(width, height);
			camera.aspect = width / height; camera.updateProjectionMatrix();
		};
		window.addEventListener('resize', onResize);

		let visible = true;
		const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0, rootMargin: '200px 0px' });
		io.observe(outer);

		let raf = 0;
		const clock = new THREE.Clock();
		const animate = () => {
			raf = requestAnimationFrame(animate);
			if (!visible) return;
			const t = clock.getElapsedTime();
			// 相機隨捲動緩推 + 漂移；就算手機慣性捲動暫停 JS，背景只是凍一下，不影響文字
			const rect = outer.getBoundingClientRect();
			const total = rect.height - window.innerHeight;
			const prog = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
			camera.position.z = 24 - prog * 10;
			camera.position.x = Math.sin(t * 0.2) * 1.0;
			camera.position.y = Math.cos(t * 0.18) * 0.7;
			camera.lookAt(0, 0, 0);
			renderer.render(scene, camera);
		};
		raf = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
			window.removeEventListener('resize', onResize);
			renderer.dispose();
			g.dispose();
			m.dispose();
			if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
		};
	}, [useStatic, isMobile]);

	// 手機（有 WebGL）：每塊滑進畫面時各自淡入上浮一次（進場動畫，但各佔各的位置→不可能重疊）
	useEffect(() => {
		if (useStatic || !isMobile) return;
		const sec = outerRef.current;
		if (!sec) return;
		sec.classList.add('sr-ready'); // 只有 JS 跑了才套「初始隱藏」，JS 壞掉時內容照樣看得到
		const items = sec.querySelectorAll('.sr');
		const io = new IntersectionObserver((entries) => {
			entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('sr-in'); io.unobserve(e.target); } });
		}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
		items.forEach((el) => io.observe(el));
		return () => { io.disconnect(); sec.classList.remove('sr-ready'); };
	}, [useStatic, isMobile]);

	// 手機與無-WebGL 共用的堆疊內容（正常文件流，物理上不可能重疊）
	const stackedContent = (
		<>
			<div className="InfoM-hero sr">
				<div className="InfoScene-avatars">
					<img src={Avatar1} alt="史萊姆" className="InfoScene-avatar" />
					<img src={Avatar2} alt="史萊姆 logo" className="InfoScene-avatar InfoScene-avatar--slime" />
				</div>
				<div className="InfoScene-name">史萊姆</div>
				<div className="InfoScene-role">ADE · Any-Domain Engineer</div>
				<div className="InfoScene-tagline">{glue(`「哪都能做」工程師
這年頭 vibe coding，工程師好像都被逼成 Any-Domain —— 什麼都得做得出來 XD`)}</div>
				<div className="InfoScene-contact">
					<span className="nb">🏠 Taipei</span>
					<span className="nb">📬 getsulin@gmail.com</span>
					<span className="nb">🏫 臺師大 數學系</span>
				</div>
			</div>

			<div className="InfoM-block sr">
				<div className="InfoScene-panel-kicker">ABOUT</div>
				<div className="InfoScene-panel-text">{glue(ABOUT)}</div>
			</div>

			<div className="InfoM-block sr">
				<div className="InfoScene-panel-kicker">SKILLS</div>
				<div className="InfoScene-skillgrid">
					{SKILLS.map(([t, d]) => (
						<div key={t} className="InfoScene-skillcard">
							<div className="InfoScene-skillcard-t">{t}</div>
							<div className="InfoScene-skillcard-d">{d.map((x) => <span key={x} className="InfoScene-chip">{x}</span>)}</div>
						</div>
					))}
				</div>
			</div>
		</>
	);

	// 無 WebGL：純靜態堆疊（深色實底）
	if (useStatic) {
		return <section id="Information" key="info-static" className="InfoScene InfoScene--mobile">{stackedContent}</section>;
	}

	// 手機（有 WebGL）：sticky 3D 星空背景 + 正常流文字
	if (isMobile) {
		return (
			<section id="Information" key="info-mobile" className="InfoScene InfoScene--cinemaM" ref={outerRef}>
				<div className="InfoM-bg"><div className="InfoM-bg-canvas" ref={mobileMountRef} /></div>
				<div className="InfoM-content">{stackedContent}</div>
			</section>
		);
	}

	// 桌機：分幕 cinema
	return (
		<section id="Information" key="info-cinema" className="InfoScene" ref={outerRef}>
			<div className="InfoScene-sticky">
				<div className="InfoScene-canvas" ref={mountRef} />

				{/* 第一幕：身份 */}
				<div className="InfoScene-hero" ref={heroRef}>
					<div className="InfoScene-avatars">
						<img src={Avatar1} alt="史萊姆" className="InfoScene-avatar" />
						<img src={Avatar2} alt="史萊姆 logo" className="InfoScene-avatar InfoScene-avatar--slime" />
					</div>
					<div className="InfoScene-name">史萊姆</div>
					<div className="InfoScene-role">ADE · Any-Domain Engineer</div>
					<div className="InfoScene-tagline">{glue(`「哪都能做」工程師
這年頭 vibe coding，工程師好像都被逼成 Any-Domain —— 什麼都得做得出來 XD`)}</div>
					<div className="InfoScene-contact">
						<span className="nb">🏠 Taipei</span>
						<span className="nb">📬 getsulin@gmail.com</span>
						<span className="nb">🏫 臺師大 數學系</span>
					</div>
					<div className="InfoScene-scrollhint">往下捲 ↓</div>
				</div>

				{/* 第二幕：自介 */}
				<div className="InfoScene-panel InfoScene-intro" ref={introRef}>
					<div className="InfoScene-panel-kicker">ABOUT</div>
					<div className="InfoScene-panel-text">{glue(ABOUT)}</div>
				</div>

				{/* 第三幕：技能 */}
				<div className="InfoScene-panel InfoScene-skills" ref={skillsRef}>
					<div className="InfoScene-panel-kicker">SKILLS</div>
					<div className="InfoScene-skillgrid">
						{SKILLS.map(([t, d]) => (
							<div key={t} className="InfoScene-skillcard">
								<div className="InfoScene-skillcard-t">{t}</div>
								<div className="InfoScene-skillcard-d">{d.map((x) => <span key={x} className="InfoScene-chip">{x}</span>)}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default InfoScene;
