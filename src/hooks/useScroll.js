import { useEffect, useRef, useState } from 'react';

// 元素進入視窗時觸發一次，回傳 [ref, 是否已顯示]，用來做淡入/滑入
export const useScrollReveal = (options = {}) => {
	const ref = useRef(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		// 不支援 IntersectionObserver 或使用者偏好減少動態 → 直接顯示
		if (typeof IntersectionObserver === 'undefined') {
			setVisible(true);
			return;
		}

		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					io.unobserve(el);
				}
			},
			{ threshold: 0.15, rootMargin: '0px 0px -10% 0px', ...options }
		);

		io.observe(el);
		return () => io.disconnect();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return [ref, visible];
};

// 回傳一個「高容器」被捲過的進度 0~1（搭配內層 sticky 場景使用）
export const useScrollProgress = (ref) => {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let raf = 0;

		const update = () => {
			const el = ref.current;
			if (!el) return;
			const rect = el.getBoundingClientRect();
			// 容器高度超過一個視窗的部分，就是可捲動的進度距離
			const total = rect.height - window.innerHeight;
			const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
			setProgress(total > 0 ? scrolled / total : 0);
		};

		const onScroll = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(update);
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		update();

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			cancelAnimationFrame(raf);
		};
	}, [ref]);

	return progress;
};
