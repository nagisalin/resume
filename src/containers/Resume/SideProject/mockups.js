// SideProject 展示用的去識別化 UI mockup（純 SVG，不含任何公司實際畫面）

// 即時影像監控牆
export const MonitorWallMock = () => (
	<svg viewBox="0 0 320 180" className="SP-mock" role="img" aria-label="即時影像監控牆">
		<rect x="0" y="0" width="320" height="180" rx="8" fill="#07171d" stroke="#22d3ee" strokeWidth="2" />
		{[0, 1, 2, 3, 4, 5].map((i) => {
			const x = 14 + (i % 3) * 100;
			const y = 16 + Math.floor(i / 3) * 78;
			const live = i !== 4;
			return (
				<g key={i}>
					<rect x={x} y={y} width="88" height="64" rx="4" fill="#0c2b34" stroke="#22d3ee" strokeWidth="1" opacity={live ? 1 : 0.5} />
					{live ? (
						<>
							<circle cx={x + 10} cy={y + 10} r="3" fill="#ff5c5c" />
							<text x={x + 18} y={y + 13} fontSize="7" fill="#9fe8f5">LIVE</text>
							<rect x={x + 18} y={y + 38} width="24" height="16" rx="2" fill="#22d3ee" opacity="0.6" />
							<rect x={x + 50} y={y + 44} width="16" height="10" rx="2" fill="#22d3ee" opacity="0.4" />
						</>
					) : (
						<text x={x + 44} y={y + 36} fontSize="8" fill="#6aa" textAnchor="middle">reconnecting…</text>
					)}
				</g>
			);
		})}
	</svg>
);

// 智慧旅宿房客旅程（stage 狀態機）
export const StayJourneyMock = () => {
	const stages = ['抵達前', '入住日', '住宿中', '退房', '評論'];
	return (
		<svg viewBox="0 0 320 180" className="SP-mock" role="img" aria-label="旅宿房客旅程">
			<rect x="0" y="0" width="320" height="180" rx="8" fill="#07201a" stroke="#34d399" strokeWidth="2" />
			{/* magic link */}
			<rect x="16" y="16" width="130" height="24" rx="12" fill="#0d3328" stroke="#34d399" strokeWidth="1" />
			<text x="30" y="32" fontSize="9" fill="#9ff0cf">🔗 magic-link 進場</text>
			{/* 門鎖 */}
			<rect x="236" y="16" width="68" height="24" rx="6" fill="#0d3328" stroke="#34d399" strokeWidth="1" />
			<text x="248" y="32" fontSize="9" fill="#9ff0cf">🔒 智慧門鎖</text>
			{/* stage 流程 */}
			{stages.map((s, i) => {
				const x = 20 + i * 60;
				const active = i === 2;
				return (
					<g key={i}>
						<circle cx={x + 18} cy={96} r={active ? 15 : 12} fill={active ? '#34d399' : '#0d3328'} stroke="#34d399" strokeWidth="2" />
						<text x={x + 18} y={100} fontSize="11" fill={active ? '#06231a' : '#6cc'} textAnchor="middle">{i + 1}</text>
						<text x={x + 18} y={130} fontSize="9" fill="#cdeee0" textAnchor="middle">{s}</text>
						{i < stages.length - 1 && <line x1={x + 33} y1={96} x2={x + 63} y2={96} stroke="#34d399" strokeWidth="2" strokeDasharray="4 3" />}
					</g>
				);
			})}
			<text x="160" y="164" fontSize="8" fill="#7bbfa6" textAnchor="middle">server 驅動 · 多語言 · 依案場時區</text>
		</svg>
	);
};

// 充電站地圖
export const ChargeMapMock = () => (
	<svg viewBox="0 0 320 180" className="SP-mock" role="img" aria-label="充電站地圖">
		<rect x="0" y="0" width="320" height="180" rx="8" fill="#1a1405" stroke="#f59e0b" strokeWidth="2" />
		{/* 路網 */}
		<g stroke="#4a3a12" strokeWidth="2" fill="none">
			<path d="M0 60 H320 M0 120 H320 M90 0 V180 M210 0 V180" />
		</g>
		{/* pins */}
		{[[60, 50, '#43d675'], [140, 90, '#43d675'], [200, 55, '#ffd166'], [250, 130, '#ff6b6b'], [110, 140, '#43d675']].map(([x, y, c], i) => (
			<g key={i}>
				<path d={`M${x} ${y} c-7 -9 -7 -16 0 -22 c7 6 7 13 0 22 z`} fill={c} transform={`translate(0,-10)`} />
				<circle cx={x} cy={y - 24} r="3.5" fill="#1a1405" />
			</g>
		))}
		{/* cluster */}
		<circle cx="175" cy="135" r="15" fill="#f59e0b" opacity="0.9" />
		<text x="175" y="139" fontSize="11" fill="#1a1405" textAnchor="middle" fontWeight="700">12</text>
		{/* legend */}
		<g fontSize="8" fill="#e8d2a0">
			<circle cx="20" cy="166" r="3" fill="#43d675" /><text x="28" y="169">可用</text>
			<circle cx="70" cy="166" r="3" fill="#ffd166" /><text x="78" y="169">使用中</text>
			<circle cx="130" cy="166" r="3" fill="#ff6b6b" /><text x="138" y="169">離線</text>
		</g>
	</svg>
);

// 多條件篩選器組合
export const FilterMock = () => (
	<svg viewBox="0 0 320 180" className="SP-mock" role="img" aria-label="多條件篩選器">
		<rect x="0" y="0" width="320" height="180" rx="8" fill="#140a24" stroke="#a78bfa" strokeWidth="2" />
		{/* filter chips */}
		{[['狀態 ▾', 44], ['日期 ▾', 44], ['類別 ▾', 40], ['+ 條件', 42]].map(([t, w], i) => {
			let x = 14;
			for (let k = 0; k < i; k++) x += [44, 44, 40, 42][k] + 8;
			return (
				<g key={i}>
					<rect x={x} y={16} width={w} height="22" rx="11" fill={i < 3 ? '#2a1a52' : 'transparent'} stroke="#a78bfa" strokeWidth="1" strokeDasharray={i === 3 ? '3 2' : '0'} />
					<text x={x + w / 2} y={31} fontSize="8" fill="#d6c7ff" textAnchor="middle">{t}</text>
				</g>
			);
		})}
		{/* url sync bar */}
		<rect x="14" y="48" width="292" height="16" rx="4" fill="#0e0820" stroke="#5b47a0" strokeWidth="1" />
		<text x="20" y="60" fontSize="7" fill="#8a7cc0">?status=on&date=7d&page=2  ← URL 同步</text>
		{/* table */}
		{[0, 1, 2, 3].map((i) => (
			<g key={i}>
				<rect x="14" y={74 + i * 22} width="292" height="18" rx="3" fill={i % 2 ? '#1a1030' : '#140a24'} stroke="#2a1a52" strokeWidth="1" />
				<rect x="22" y={79 + i * 22} width="70" height="8" rx="2" fill="#a78bfa" opacity="0.5" />
				<rect x="110" y={79 + i * 22} width="90" height="8" rx="2" fill="#6b5aa0" opacity="0.5" />
				<rect x="250" y={79 + i * 22} width="44" height="8" rx="2" fill="#6b5aa0" opacity="0.4" />
			</g>
		))}
	</svg>
);

// AI 員工編排平台（組織 + 治理）
export const OrgAgentMock = () => (
	<svg viewBox="0 0 320 180" className="SP-mock" role="img" aria-label="AI 員工編排">
		<rect x="0" y="0" width="320" height="180" rx="8" fill="#0d0f24" stroke="#818cf8" strokeWidth="2" />
		{/* 連線 */}
		<g stroke="#818cf8" strokeWidth="1.5" opacity="0.6" fill="none">
			<path d="M160 44 V62 M160 62 H88 V78 M160 62 H232 V78 M88 102 V118 M88 118 H60 V130 M88 118 H116 V130 M232 102 V130" />
		</g>
		{/* CEO */}
		<g>
			<rect x="124" y="22" width="72" height="24" rx="6" fill="#2a2d6b" stroke="#a5b4fc" strokeWidth="1.5" />
			<text x="160" y="38" fontSize="11" fill="#e0e4ff" textAnchor="middle" fontWeight="700">CEO</text>
		</g>
		{/* CTO / PM */}
		{[['CTO', 88], ['PM', 232]].map(([t, x]) => (
			<g key={t}>
				<rect x={x - 32} y="78" width="64" height="22" rx="6" fill="#1c1f4d" stroke="#818cf8" strokeWidth="1.2" />
				<text x={x} y="93" fontSize="10" fill="#c7cdff" textAnchor="middle">{t}</text>
			</g>
		))}
		{/* agents */}
		{[60, 116, 232].map((x, i) => (
			<g key={i}>
				<circle cx={x} cy="140" r="12" fill="#161935" stroke="#818cf8" strokeWidth="1.2" />
				<text x={x} y="144" fontSize="9" fill="#9aa0e0" textAnchor="middle">A{i + 1}</text>
			</g>
		))}
		{/* 治理規則 badge */}
		<rect x="14" y="156" width="292" height="18" rx="4" fill="#161935" stroke="#4c4f8a" strokeWidth="1" />
		<text x="160" y="169" fontSize="8" fill="#b8bdf0" textAnchor="middle">治理：下層不可自生 agent · 主管只指揮不動手</text>
	</svg>
);

// 語音答詢治理看板（看板 + 語音同源）
export const VoiceDashMock = () => (
	<svg viewBox="0 0 320 180" className="SP-mock" role="img" aria-label="語音答詢看板">
		<rect x="0" y="0" width="320" height="180" rx="8" fill="#07201d" stroke="#2dd4bf" strokeWidth="2" />
		{/* metric */}
		<text x="16" y="38" fontSize="26" fill="#eafff9" fontWeight="800">1,284</text>
		<text x="16" y="52" fontSize="9" fill="#7fd9c9">本月事件數</text>
		{/* sparkline */}
		<polyline points="150,46 170,38 190,42 210,28 230,34 250,20 270,26 295,16" fill="none" stroke="#2dd4bf" strokeWidth="2" />
		{/* answer card */}
		<rect x="16" y="66" width="200" height="44" rx="8" fill="#0c3630" stroke="#2dd4bf" strokeWidth="1" />
		<text x="26" y="84" fontSize="8" fill="#8fe8db">Q：這個月事件比上月多嗎？</text>
		<text x="26" y="100" fontSize="9" fill="#eafff9">A：多 12%，共 1,284 件 ▮</text>
		{/* chart chip */}
		<rect x="228" y="66" width="76" height="44" rx="8" fill="#0c3630" stroke="#2dd4bf" strokeWidth="1" />
		<rect x="238" y="92" width="10" height="10" fill="#2dd4bf" /><rect x="252" y="84" width="10" height="18" fill="#2dd4bf" opacity="0.7" /><rect x="266" y="78" width="10" height="24" fill="#2dd4bf" opacity="0.5" /><rect x="280" y="88" width="10" height="14" fill="#2dd4bf" opacity="0.6" />
		{/* 麥克風 + 波形 */}
		<circle cx="30" cy="146" r="13" fill="#2dd4bf" />
		<rect x="27" y="140" width="6" height="9" rx="3" fill="#07201d" /><rect x="25" y="151" width="10" height="2" fill="#07201d" />
		<g fill="#2dd4bf">
			{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
				const h = [8, 16, 24, 14, 28, 12, 20, 10, 18][i];
				return <rect key={i} x={54 + i * 10} y={146 - h / 2} width="4" height={h} rx="2" opacity={0.5 + (i % 3) * 0.2} />;
			})}
		</g>
		<text x="170" y="170" fontSize="8" fill="#6fcabd">看板數字與語音回答同源 · 短效憑證 · 稽核日誌</text>
	</svg>
);

export const SP_MOCKS = { monitor: MonitorWallMock, stay: StayJourneyMock, map: ChargeMapMock, filter: FilterMock, org: OrgAgentMock, voice: VoiceDashMock };
