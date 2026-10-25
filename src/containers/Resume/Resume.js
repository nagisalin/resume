import { useEffect } from 'react';

import ResumeHeader from './ResumeHeader/ResumeHeader';
import InfoScene from 'containers/Resume/Information/InfoScene';
import Experience3D from 'containers/Resume/Experience/Experience3D';
import CrossDomain from 'containers/Resume/CrossDomain/CrossDomain';
import SideProject from 'containers/Resume/SideProject/SideProject';

import "./Resume.scss";

const Resume = () => {
	useEffect(() => {
		// 導覽列錨點：平滑捲到對應 section（原生 hash 跳轉對 sticky 3D 區塊失效）
		const onNavClick = (e) => {
			const a = e.target.closest('a[href^="#"]');
			if (!a) return;
			const id = a.getAttribute('href').slice(1);
			const el = document.getElementById(id);
			if (el) {
				e.preventDefault();
				const y = el.getBoundingClientRect().top + window.scrollY - 64;
				window.scrollTo({ top: y, behavior: 'smooth' });
			}
		};
		document.addEventListener('click', onNavClick);
		return () => document.removeEventListener('click', onNavClick);
	}, []);

	return (
		<div className="Resume">
			<ResumeHeader />
			<InfoScene />
			<Experience3D />
			<CrossDomain />
			<SideProject />
		</div>
	);
}

export default Resume;
