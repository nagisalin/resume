import { useEffect, useState } from 'react';
import classnames from 'classnames';

import WebGLJourney from './WebGLJourney';
import { FrontendScene, BackendScene, CrawlerScene, UnityScene, EdgeAIScene } from './Scenes';
import { useScrollReveal } from 'hooks/useScroll';

import '../SectionContainer.scss';
import './CrossDomain.scss';

const landmarks = [
	{
		key: 'frontend',
		en: 'FRONTEND',
		label: '前端（本行）',
		color: '#17c0eb',
		scene: FrontendScene,
		tag: '本行，但把它做到夠廣',
		title: '前端 × 廣度',
		description: `這是我的本行。2024 起獨力完成多套企業內部後台與營運儀表板（React / Vue），含權限、i18n、報表與 RWD。

最能代表「廣度」的是電動車充電這塊：從使用者端一路做到營運端——車主 App（預約、充電、金流付款）、營運後台、金流訂閱方案，一個領域從畫面做到流程全包。`,
	},
	{
		key: 'backend',
		en: 'BACKEND & CLOUD',
		label: '後端 × 雲端',
		color: '#34d399',
		scene: BackendScene,
		tag: '原本不會：寫 service',
		title: '後端 Service × 雲端部署',
		description: `碰後端之前，我沒寫過 service。最後長成 Node / Express + MongoDB + Docker，撐起任務排程通知、跨系統資料同步、信件寄送這些要穩定在背景跑的東西。

而且「寫完」不是結束：我自己用 AWS EC2 架機跑服務、用 GoDaddy 管網域與 DNS、用 Docker 容器化、用 Vercel 佈署前端——把東西真的推上線、讓外部連得到，這一段也是我在扛。`,
	},
	{
		key: 'crawler',
		en: 'PYTHON',
		label: 'Python 爬蟲',
		color: '#f59e0b',
		scene: CrawlerScene,
		tag: '跨到另一個語言',
		title: 'Python × 爬蟲自動化',
		description: `用 Python 寫爬蟲，定期去蒐集外部公開資料，清洗後入庫供系統使用，再搭配排程自動更新。

從「使用者點了才動」的前端，走到「沒人看著也要自己穩穩跑」的自動化，是這段最大的思路轉換。`,
	},
	{
		key: 'unity',
		en: 'UNITY XR',
		label: 'Unity / VR',
		color: '#a78bfa',
		scene: UnityScene,
		tag: '原本不會：C#、VR',
		title: 'Unity XR × Meta Quest 3',
		description: `碰 Unity 之前，我沒寫過半行 C#。

兩個都做到實機能跑：一個是 VR 遙控機器人——頭盔顯示機器人身上的即時影像，用手勢下達移動指令；另一個是沉浸式的復健訓練。VR 的坑跟寫網頁完全不同：手部追蹤的捏合門檻、座姿站姿的追蹤原點、WebXR 只在 HTTPS 或 localhost 下才給「進入 VR」……都是要上機才知道的事。`,
	},
	{
		key: 'edgeai',
		en: 'EDGE AI',
		label: '邊緣 AI',
		color: '#22d3ee',
		scene: EdgeAIScene,
		tag: '原本不會：電腦視覺',
		title: '地端 Edge AI × 即時影像',
		description: `一台地端邊緣裝置，要即時分析數百路公開影像串流。卡最久的是算力：一邊跑物件偵測、一邊跑 VLM 寫摘要，單張 GPU 不夠。

做法是自寫精簡推論路徑（在 GPU 上一次做完篩選與 NMS），再拆多行程分攤相機、讓 VLM 在 GPU 忙時讓位。最後做成一條龍：地端分析 → 雲端儀表 → AI 語音答詢 → WebXR 戰情牆，資料全程在地端去識別化，不回傳原始影像。`,
	},
];

const CrossDomain = () => {
	const [isMobile, setIsMobile] = useState(false);
	const [finaleRef, finaleVisible] = useScrollReveal();

	useEffect(() => {
		const mq = window.matchMedia('(max-width: 768px)');
		const onChange = () => setIsMobile(mq.matches);
		onChange();
		if (mq.addEventListener) mq.addEventListener('change', onChange);
		else mq.addListener(onChange);
		return () => {
			if (mq.removeEventListener) mq.removeEventListener('change', onChange);
			else mq.removeListener(onChange);
		};
	}, []);

	return (
		<>
			<section id="CrossDomain" className="CrossDomainIntro">
				<div className="CrossDomainIntro-inner">
					<div className="CrossDomainIntro-kicker">CROSS-DOMAIN</div>
					<div className="CrossDomainIntro-title">跨領域落地</div>
					<div className="CrossDomainIntro-sub">{`技能列表在這個年代等於沒寫 —— 誰都能列。
所以接下來不列技術，而是一路往下，
穿過我一個個「原本不會、後來做上線」的領域。`}</div>
					<div className="CrossDomainIntro-hint">往下穿越 ↓</div>
				</div>
			</section>

			{isMobile ? (
				<section className="CrossDomainMobile">
					{landmarks.map((lm) => {
						const Scene = lm.scene;
						return (
							<div key={lm.key} className="CrossDomainMobile-Case" style={{ '--door-clr': lm.color }}>
								<div className="CrossDomainMobile-Case-Scene">
									<Scene />
								</div>
								<div className="CrossDomainMobile-Case-Label">{lm.label}</div>
								<div className="CrossDomainMobile-Case-Tag">{lm.tag}</div>
								<div className="CrossDomainMobile-Case-Title">{lm.title}</div>
								<div className="CrossDomainMobile-Case-Desc">{lm.description}</div>
							</div>
						);
					})}
				</section>
			) : (
				<WebGLJourney stations={landmarks} />
			)}

			<section className="CrossDomainFinale" ref={finaleRef}>
				<div className={classnames('CrossDomainFinale-inner', { 'is-visible': finaleVisible })}>
					<div className="CrossDomainFinale-text">{`走完這段路，我其實也不確定「什麼都會一點」算不算好事。

這年頭 vibe coding，工程師好像都被推著變成 Any-Domain ——
語法、框架這些，AI 都幫得上忙。
真正難被取代的，大概是溝通、是創意，
是把東西「落地」的能力，是能同時開很多工、把 token 燒出價值的能力。

我不是每個領域都最強的那個。
但「給我一個沒做過的領域，我有辦法把它弄上線」——
這件事，這一路上已經做給你看過了。`}</div>
					<div className="CrossDomainFinale-sign">—— ADE · Any-Domain Engineer</div>
				</div>
			</section>
		</>
	);
};

export default CrossDomain;
