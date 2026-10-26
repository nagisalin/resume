import { useEffect, useRef, useState, Fragment } from 'react';
import * as THREE from 'three';
import { makeStarTexture } from 'shared/starTexture';
import { MonitorWallMock, StayJourneyMock, ChargeMapMock, FilterMock, OrgAgentMock, VoiceDashMock } from './mockups';

import aiParkImg from 'design/pictures/aiParkImg.png';
import oaImg from 'design/pictures/oaImg.png';
import kioskImg from 'design/pictures/kioskImg.png';
import loginPageImg from 'design/pictures/loginPage.png';
import chartPageImg from 'design/pictures/chartPage.png';
import listPageImg from 'design/pictures/listPage.png';

import './SideProjectGallery.scss';

const works = [
	// ---- LSC / Sonice（去識別化重刻）----
	{ key: 'monitor', group: 'LSC / Sonice', color: '#22d3ee', mock: MonitorWallMock, title: '即時影像監控牆', tag: '效能取捨 · WebSocket',
		desc: `數百路影像串流匯成一面即時監控牆。難點全在效能取捨——同時解多路串流、斷線自動重連、頻寬不足時的降幀/降畫質策略，狀態用 WebSocket 即時推送。` },
	{ key: 'stay', group: 'LSC / Sonice', color: '#34d399', mock: StayJourneyMock, title: '智慧旅宿房客旅程', tag: 'server 驅動 · 狀態機 · IoT',
		desc: `房客從一封 email 的 magic-link 進場，整段旅程由 server 驅動的 stage 狀態機推進（抵達前 → 入住日 → 住宿中 → 退房 → 評論）。串智慧門鎖與 IoT、OTA 訂單、通訊綁定，全程多語言並依案場時區顯示。` },
	{ key: 'map', group: 'LSC / Sonice', color: '#f59e0b', mock: ChargeMapMock, title: '充電站地圖', tag: '地圖 SDK · 叢集 · 即時狀態',
		desc: `全區電動車充電站地圖：多站點叢集、即時狀態（可用 / 使用中 / 離線）、點選看站點詳情。重點在大量 marker 的效能與叢集策略。` },
	{ key: 'filter', group: 'LSC / Sonice', color: '#a78bfa', mock: FilterMock, title: '多條件篩選器組合', tag: '最高頻 · 做對很難',
		desc: `後台最高頻、也最容易做半套的東西。多條件組合 × URL 同步（可分享、可回上一步）× 換頁保留 × 「重設」的語意要對——每一項單獨簡單，湊在一起做對很難。` },
	{ key: 'org', group: 'LSC / Sonice', color: '#818cf8', mock: OrgAgentMock, title: 'AI 員工編排平台', tag: '多代理 · 組織 · 治理',
		desc: `把一群 AI agent 當成「AI 員工」來編排：自動生成組織（CEO / CTO / 各部門），每個員工有自己的工具、知識庫與 MCP。重點是治理——我設了階層規則：最下層的 agent 不能自己再生 agent、主管只負責指揮不親自動手，避免失控與無限展開。` },
	{ key: 'voice', group: 'LSC / Sonice', color: '#2dd4bf', mock: VoiceDashMock, title: '語音答詢治理看板', tag: '語音 AI · 語意層 · 資料一致',
		desc: `同一個頁面：治理看板 + 語音/文字答詢。關鍵是看板數字和 AI 助理講出來的數字來自「同一個語意層」，所以永遠一致。串 OpenAI Realtime（WebRTC 直連、短效憑證不外洩金鑰），模型要數字時走 function call 查語意層、寫稽核日誌，並有權限過濾與「無法回答」處理。` },

	// ---- 早期作品 ----
	{ key: 'park', group: '早期作品', color: '#17c0eb', img: aiParkImg, title: '停車場後台管理系統', tag: '太平洋建設 · 車辨即時影像',
		desc: `政府停車場的後台管理系統。串車辨即時影像——後端經 WebSocket 把 NVR 影像封包回傳，前端每秒 render 更新達成監控牆；另有停車紀錄、設備清單管理，以圓餅／折線呈現每月資料分析。` },
	{ key: 'oa', group: '早期作品', color: '#17c0eb', img: oaImg, title: '內部 OA 管理系統', tag: '太平洋建設 · Node.js 全端',
		desc: `公司內部 OA 管理系統。以 Node.js 後端串 API 做線上打卡、公佈欄最新消息、常用文件範本下載。` },
	{ key: 'kiosk', group: '早期作品', color: '#17c0eb', img: kioskImg, title: 'KIOSK 繳費機介面', tag: '太平洋建設 · 自行設計',
		desc: `停車場 KIOSK 繳費機介面。當時沒有設計師，自己參考現有產品歸納重編排；特別加了 Footer 電話圖示與語言切換（多數繳費機沒有的設計）。` },
	{ key: 'login', group: '早期作品', color: '#fd79a8', img: loginPageImg, title: 'Login Page', tag: 'CodingBar · Carousel · Firebase',
		desc: `程式教學平台的登入頁。研究官方 Doc 引入 Carousel 套件做輪播、含手機 RWD；串 Firebase 做帳戶註冊／忘記密碼／試用登入。` },
	{ key: 'chart', group: '早期作品', color: '#fd79a8', img: chartPageImg, title: 'Chart Page', tag: 'CodingBar · 標準差離群',
		desc: `平台的數據圖表頁。處理重複 component 與 Tab 切版；商品評分用到數學標準差計算離群程度（這題同事一看就直接丟給數學系的我 XD）。` },
	{ key: 'list', group: '早期作品', color: '#fd79a8', img: listPageImg, title: 'List Page', tag: 'CodingBar · Firestore CRUD',
		desc: `平台的列表資料管理頁。Rectangle + Hamburger 組合 component；串 Firestore 實作基礎 CRUD 與簡易搜尋。` },
];

const SideProjectGallery = () => {
	const [active, setActive] = useState(0);
	const mountRef = useRef(null);

	// 星空背景（靜態緩慢漂移）
	useEffect(() => {
		const mount = mountRef.current;
		if (!mount) return;
		const test = document.createElement('canvas');
		if (!(test.getContext('webgl2') || test.getContext('webgl'))) return;

		let width = mount.clientWidth;
		let height = mount.clientHeight;
		const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
		renderer.setPixelRatio(1);
		renderer.setSize(width, height);
		mount.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 400);
		camera.position.z = 30;

		const starCount = 1300;
		const sp = new Float32Array(starCount * 3);
		for (let i = 0; i < starCount; i++) {
			sp[i * 3] = (Math.random() - 0.5) * 180;
			sp[i * 3 + 1] = (Math.random() - 0.5) * 140;
			sp[i * 3 + 2] = (Math.random() - 0.5) * 120;
		}
		const starGeo = new THREE.BufferGeometry();
		starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
		const starMat = new THREE.PointsMaterial({ color: 0x9fd8ff, size: 1.5, map: makeStarTexture(), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
		const stars = new THREE.Points(starGeo, starMat);
		scene.add(stars);

		const onResize = () => {
			width = mount.clientWidth;
			height = mount.clientHeight;
			renderer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		};
		window.addEventListener('resize', onResize);

		let visible = true;
		const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0, rootMargin: '200px 0px' });
		io.observe(mount);

		let raf = 0;
		const clock = new THREE.Clock();
		const animate = () => {
			raf = requestAnimationFrame(animate);
			if (!visible) return;
			const t = clock.getElapsedTime();
			stars.rotation.y = t * 0.02;
			stars.rotation.x = Math.sin(t * 0.05) * 0.05;
			renderer.render(scene, camera);
		};
		raf = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
			window.removeEventListener('resize', onResize);
			renderer.dispose();
			starGeo.dispose();
			starMat.dispose();
			if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
		};
	}, []);

	const w = works[active];
	const Mock = w.mock;

	return (
		<section id="SideProject" className="SPGallery">
			<div className="SPGallery-bg" ref={mountRef} />

			<div className="SPGallery-inner">
				{/* 左：作品按鈕清單 */}
				<div className="SPGallery-nav">
					<div className="SPGallery-nav-title">作品 · SIDE PROJECTS</div>
					{works.map((item, i) => {
						const showGroup = i === 0 || works[i - 1].group !== item.group;
						return (
							<Fragment key={item.key}>
								{showGroup && <div className="SPGallery-group">{item.group}</div>}
								<button
									className={`SPGallery-btn${i === active ? ' active' : ''}`}
									style={{ '--clr': item.color }}
									onClick={() => setActive(i)}>
									<span className="SPGallery-btn-dot" />
									<span className="SPGallery-btn-txt">{item.title}</span>
								</button>
							</Fragment>
						);
					})}
				</div>

				{/* 右：3D 展示 */}
				<div className="SPGallery-detail" key={w.key} style={{ '--clr': w.color }}>
					<div className="SPGallery-screen">
						{w.mock ? <Mock /> : <img src={w.img} alt={w.title} className="SPGallery-img" />}
					</div>
					<div className="SPGallery-info">
						<div className="SPGallery-kicker">{w.group === 'LSC / Sonice' ? 'LSC / Sonice · 去識別化重刻' : '早期作品'}</div>
						<div className="SPGallery-tag">{w.tag}</div>
						<div className="SPGallery-title">{w.title}</div>
						<div className="SPGallery-desc">{w.desc}</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default SideProjectGallery;
