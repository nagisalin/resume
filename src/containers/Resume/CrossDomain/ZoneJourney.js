import { useRef } from 'react';
import { useScrollProgress } from 'hooks/useScroll';
import './ZoneJourney.scss';

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const smooth = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

// 固定一組粒子位置（避免每次 render 跳動）
const DOTS = Array.from({ length: 16 }, (_, i) => ({
	left: (i * 61) % 100,
	bottom: (i * 37) % 60,
	size: 3 + ((i * 7) % 5),
	dur: 5 + ((i * 3) % 6),
	delay: (i * 0.6) % 5,
}));

const Ambient = () => (
	<>
		<div className="amb-glow" />
		<div className="amb-grid" />
		<div className="amb-rings">
			<span />
			<span />
			<span />
		</div>
		{DOTS.map((d, i) => (
			<span
				key={i}
				className="amb-dot"
				style={{
					left: `${d.left}%`,
					bottom: `${d.bottom}%`,
					width: `${d.size}px`,
					height: `${d.size}px`,
					animationDuration: `${d.dur}s`,
					animationDelay: `${d.delay}s`,
				}}
			/>
		))}
	</>
);

const Zone = ({ lm }) => {
	const ref = useRef(null);
	const p = useScrollProgress(ref);

	const appear = smooth(p, 0.1, 0.4);
	const leave = smooth(p, 0.64, 0.96);
	const opacity = appear * (1 - leave);
	// 進來時由小變正常，離開時再放大 → 穿過去的感覺
	const scale = 0.86 + appear * 0.14 + leave * 0.22;
	const y = (1 - appear) * 70 - leave * 90;

	const Scene = lm.scene;

	return (
		<section className="Zone" ref={ref}>
			<div className="Zone-sticky" style={{ '--p': p, '--clr': lm.color }}>
				<div className="Zone-ambient">
					<Ambient />
				</div>
				<div className="Zone-vignette" />

				<div
					className="Zone-content"
					style={{ opacity, transform: `translateY(${y}px) scale(${scale})` }}>
					<div className="Zone-hero">
						<Scene />
					</div>
					<div className="Zone-info">
						<div className="Zone-tag">{lm.tag}</div>
						<div className="Zone-title">{lm.title}</div>
						<div className="Zone-desc">{lm.description}</div>
					</div>
				</div>
			</div>
		</section>
	);
};

const ZoneJourney = ({ landmarks }) => (
	<div className="ZoneJourney">
		{landmarks.map((lm) => (
			<Zone key={lm.key} lm={lm} />
		))}
	</div>
);

export default ZoneJourney;
