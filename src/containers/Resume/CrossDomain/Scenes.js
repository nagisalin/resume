// 沿途風景：每個技能一個扁平風格 SVG 場景插畫（自繪、無外部素材）

// 前端（本行）：瀏覽器視窗 + 手機 RWD + 圖表卡片
export const FrontendScene = () => (
	<svg viewBox="0 0 480 320" className="RoadScene-svg" role="img" aria-label="前端">
		<rect x="60" y="70" width="300" height="190" rx="14" fill="#0f2634" stroke="#17c0eb" strokeWidth="3" />
		<rect x="60" y="70" width="300" height="34" rx="14" fill="#17c0eb" />
		<circle cx="82" cy="87" r="6" fill="#0f2634" />
		<circle cx="102" cy="87" r="6" fill="#0f2634" />
		<circle cx="122" cy="87" r="6" fill="#0f2634" />
		{/* 長條圖 */}
		<rect x="84" y="200" width="22" height="40" rx="3" fill="#7fe3ff" />
		<rect x="114" y="175" width="22" height="65" rx="3" fill="#7fe3ff" />
		<rect x="144" y="150" width="22" height="90" rx="3" fill="#17c0eb" />
		<rect x="174" y="185" width="22" height="55" rx="3" fill="#7fe3ff" />
		{/* 卡片文字列 */}
		<rect x="220" y="128" width="120" height="12" rx="6" fill="#2b5468" />
		<rect x="220" y="150" width="96" height="12" rx="6" fill="#2b5468" />
		<rect x="220" y="172" width="110" height="12" rx="6" fill="#2b5468" />
		<rect x="220" y="208" width="120" height="30" rx="8" fill="#17c0eb" />
		{/* 手機 RWD */}
		<rect x="372" y="150" width="56" height="100" rx="10" fill="#0f2634" stroke="#17c0eb" strokeWidth="3" />
		<rect x="380" y="166" width="40" height="60" rx="4" fill="#17c0eb" opacity="0.5" />
		<circle cx="400" cy="238" r="4" fill="#17c0eb" />
	</svg>
);

// 後端 × 雲端：雲 + 伺服器機櫃 + AWS EC2 / GoDaddy 告示牌
export const BackendScene = () => (
	<svg viewBox="0 0 480 320" className="RoadScene-svg" role="img" aria-label="後端與雲端">
		{/* 雲 */}
		<g fill="#34d399">
			<ellipse cx="150" cy="70" rx="46" ry="28" />
			<ellipse cx="195" cy="78" rx="38" ry="24" />
			<ellipse cx="110" cy="82" rx="34" ry="22" />
			<rect x="108" y="78" width="92" height="22" />
		</g>
		{/* 連線 */}
		<path d="M155 100 L155 150" stroke="#34d399" strokeWidth="3" strokeDasharray="6 6" />
		{/* 伺服器機櫃 */}
		<rect x="110" y="150" width="90" height="120" rx="8" fill="#0f2a22" stroke="#34d399" strokeWidth="3" />
		<rect x="122" y="164" width="66" height="22" rx="4" fill="#15382d" />
		<rect x="122" y="194" width="66" height="22" rx="4" fill="#15382d" />
		<rect x="122" y="224" width="66" height="22" rx="4" fill="#15382d" />
		<circle cx="134" cy="175" r="4" fill="#6ee7b7" />
		<circle cx="134" cy="205" r="4" fill="#6ee7b7" />
		<circle cx="134" cy="235" r="4" fill="#6ee7b7" />
		{/* 告示牌 AWS EC2 */}
		<rect x="250" y="150" width="130" height="40" rx="6" fill="#34d399" />
		<text x="315" y="175" textAnchor="middle" fontSize="18" fontWeight="700" fill="#07241b">AWS EC2</text>
		<rect x="312" y="190" width="6" height="40" fill="#1f6b52" />
		{/* 告示牌 GoDaddy */}
		<rect x="250" y="236" width="130" height="38" rx="6" fill="#0f2a22" stroke="#34d399" strokeWidth="2" />
		<text x="315" y="260" textAnchor="middle" fontSize="16" fontWeight="700" fill="#6ee7b7">GoDaddy</text>
	</svg>
);

// Python 爬蟲：蜘蛛網 + 機器蜘蛛 + 抓回來的文件
export const CrawlerScene = () => (
	<svg viewBox="0 0 480 320" className="RoadScene-svg" role="img" aria-label="爬蟲">
		{/* 網 */}
		<g stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.7">
			<path d="M240 40 L240 300 M120 90 L360 250 M360 90 L120 250 M120 170 L360 170" />
			<path d="M240 90 Q300 120 320 170 Q300 220 240 250 Q180 220 160 170 Q180 120 240 90 Z" />
			<path d="M240 60 Q320 100 350 170 Q320 240 240 280 Q160 240 130 170 Q160 100 240 60 Z" opacity="0.6" />
		</g>
		{/* 機器蜘蛛 */}
		<g>
			<ellipse cx="240" cy="170" rx="30" ry="26" fill="#7a3d00" stroke="#f59e0b" strokeWidth="3" />
			<circle cx="231" cy="164" r="6" fill="#ffd166" />
			<circle cx="249" cy="164" r="6" fill="#ffd166" />
			<g stroke="#f59e0b" strokeWidth="4" strokeLinecap="round">
				<path d="M212 158 L188 142 M212 170 L184 170 M212 182 L188 198" />
				<path d="M268 158 L292 142 M268 170 L296 170 M268 182 L292 198" />
			</g>
		</g>
		{/* 抓回的文件 */}
		<g>
			<rect x="372" y="120" width="44" height="54" rx="4" fill="#fff8ec" stroke="#f59e0b" strokeWidth="2" />
			<rect x="380" y="132" width="28" height="4" fill="#f59e0b" />
			<rect x="380" y="142" width="28" height="4" fill="#d4973b" />
			<rect x="380" y="152" width="20" height="4" fill="#d4973b" />
		</g>
	</svg>
);

// Unity XR：遊戲世界 + 方塊角色 + 金幣 + 旗子 + VR 頭盔
export const UnityScene = () => (
	<svg viewBox="0 0 480 320" className="RoadScene-svg" role="img" aria-label="Unity 與 XR">
		{/* 地面山丘 */}
		<path d="M40 250 Q140 200 240 240 Q340 280 440 230 L440 300 L40 300 Z" fill="#4c3a85" />
		<path d="M40 268 Q160 240 280 262 Q380 280 440 258 L440 300 L40 300 Z" fill="#5b47a0" />
		{/* 方塊角色 */}
		<g>
			<rect x="120" y="186" width="56" height="56" rx="8" fill="#a78bfa" stroke="#d6c7ff" strokeWidth="3" />
			<circle cx="138" cy="208" r="6" fill="#2a1a52" />
			<circle cx="158" cy="208" r="6" fill="#2a1a52" />
			<path d="M136 224 Q148 232 160 224" stroke="#2a1a52" strokeWidth="3" fill="none" />
		</g>
		{/* 金幣 */}
		<g fill="#ffd166" stroke="#e0a800" strokeWidth="2">
			<circle cx="230" cy="150" r="12" />
			<circle cx="266" cy="128" r="12" />
			<circle cx="302" cy="150" r="12" />
		</g>
		{/* 旗子 */}
		<rect x="392" y="150" width="4" height="90" fill="#d6c7ff" />
		<path d="M396 152 L432 164 L396 178 Z" fill="#a78bfa" />
		{/* VR 頭盔 */}
		<g transform="translate(190 210)">
			<rect x="0" y="0" width="70" height="34" rx="16" fill="#2a1a52" stroke="#a78bfa" strokeWidth="3" />
			<rect x="10" y="8" width="20" height="18" rx="6" fill="#a78bfa" opacity="0.7" />
			<rect x="40" y="8" width="20" height="18" rx="6" fill="#a78bfa" opacity="0.7" />
		</g>
	</svg>
);

// Edge AI：地端相機裝置 + 掃描光束 + 偵測框 + 神經節點
export const EdgeAIScene = () => (
	<svg viewBox="0 0 480 320" className="RoadScene-svg" role="img" aria-label="Edge AI">
		{/* 掃描光束 */}
		<path d="M110 150 L300 80 L300 240 Z" fill="#22d3ee" opacity="0.12" />
		{/* 裝置 */}
		<rect x="60" y="120" width="60" height="60" rx="10" fill="#07323a" stroke="#22d3ee" strokeWidth="3" />
		<circle cx="90" cy="150" r="16" fill="#0a4a56" stroke="#22d3ee" strokeWidth="3" />
		<circle cx="90" cy="150" r="7" fill="#22d3ee" />
		<rect x="72" y="184" width="36" height="8" rx="4" fill="#22d3ee" opacity="0.6" />
		{/* 偵測框 + 小人 */}
		<g stroke="#22d3ee" strokeWidth="2.5" fill="none" strokeDasharray="7 5">
			<rect x="250" y="110" width="60" height="80" rx="4" />
			<rect x="330" y="140" width="52" height="62" rx="4" />
		</g>
		<g fill="#22d3ee" opacity="0.85">
			<circle cx="280" cy="132" r="9" /><rect x="270" y="146" width="20" height="30" rx="6" />
			<circle cx="356" cy="158" r="8" /><rect x="347" y="170" width="18" height="24" rx="5" />
		</g>
		{/* 神經節點 */}
		<g>
			<g stroke="#22d3ee" strokeWidth="1.5" opacity="0.6">
				<path d="M400 90 L430 120 M400 90 L430 70 M430 120 L430 70 M430 120 L400 150 M430 70 L400 150" />
			</g>
			<g fill="#7df0ff">
				<circle cx="400" cy="90" r="6" /><circle cx="430" cy="120" r="6" />
				<circle cx="430" cy="70" r="6" /><circle cx="400" cy="150" r="6" />
			</g>
		</g>
	</svg>
);

export const SCENE_COMPONENTS = {
	frontend: FrontendScene,
	backend: BackendScene,
	crawler: CrawlerScene,
	unity: UnityScene,
	edgeai: EdgeAIScene,
};
