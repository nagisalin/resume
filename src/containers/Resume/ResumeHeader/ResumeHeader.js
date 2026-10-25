import React, { useState, useEffect } from "react";

import './ResumeHeader.scss';

const ResumeHeader = () => {

	const [currentContent, setCurrentContent] = useState('Information')

	useEffect(() => {
		let ticking = false;

		const compute = () => {
			ticking = false;
			const sections = document.getElementsByTagName('section');
			const headerHeight = 60;
			const top = window.scrollY;

			for (let section of sections) {
				const offset = section.offsetTop - 3;
				const height = section.offsetHeight;
				const id = section.getAttribute('id');
				if (!id) continue; // 無 id 的 section（穿越場景等）不影響導覽高亮

				if (top >= offset && top < offset + height - headerHeight) {
					setCurrentContent(id);
				} else if (top >= offset + height - headerHeight && top < offset + height) {
					setCurrentContent('divider');
				}
			}
		};

		// rAF 節流：一個影格最多算一次版面，避免捲動時反覆 forced reflow
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
		<div className="ResumeHeader">
			<nav className={currentContent}>
				<a href="#Information" style={{ "--clr": getComputedStyle(document.body).getPropertyValue('--cream_color') }} className={(currentContent === 'Information') ? "active" : ""}>Information</a>
				<a href="#Experience" style={{ "--clr": getComputedStyle(document.body).getPropertyValue('--lightYellow_color') }} className={(currentContent === 'Experience') ? "active" : ""}>Experience</a>
				<a href="#CrossDomain" style={{ "--clr": getComputedStyle(document.body).getPropertyValue('--lavender_color') }} className={(currentContent === 'CrossDomain') ? "active" : ""}>CrossDomain</a>
				<a href="#SideProject" style={{ "--clr": getComputedStyle(document.body).getPropertyValue('--skyBlue_color') }} className={(currentContent === 'SideProject') ? "active" : ""}>SideProject</a>
			</nav>
		</div>
	);
}

export default ResumeHeader;