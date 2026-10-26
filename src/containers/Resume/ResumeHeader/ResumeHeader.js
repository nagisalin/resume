import React, { useState, useEffect } from "react";

import './ResumeHeader.scss';

const SECTIONS = [
	{ id: 'Information', label: '關於', clr: '#58d68d' },
	{ id: 'Experience', label: '經歷', clr: '#ffd166' },
	{ id: 'CrossDomain', label: '跨領域', clr: '#a78bfa' },
	{ id: 'SideProject', label: '作品', clr: '#22d3ee' },
];

const ResumeHeader = () => {
	const [current, setCurrent] = useState('Information');

	useEffect(() => {
		let ticking = false;
		const compute = () => {
			ticking = false;
			// 以視窗 40% 高度為判定線，挑最後一個已通過的 section
			const line = window.scrollY + window.innerHeight * 0.4;
			let best = SECTIONS[0].id;
			for (const s of SECTIONS) {
				const el = document.getElementById(s.id);
				if (el && line >= el.offsetTop) best = s.id;
			}
			setCurrent(best);
		};
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(compute);
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		compute();
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<nav className="SideNav" aria-label="章節導覽">
			<span className="SideNav-line" />
			{SECTIONS.map((s) => (
				<a
					key={s.id}
					href={`#${s.id}`}
					className={current === s.id ? 'active' : ''}
					style={{ '--clr': s.clr }}
					aria-label={s.label}>
					<span className="SideNav-label">{s.label}</span>
					<span className="SideNav-dot" />
				</a>
			))}
		</nav>
	);
}

export default ResumeHeader;
