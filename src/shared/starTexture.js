import * as THREE from 'three';

// 產生一張圓形柔光貼圖，讓星點變成圓的（取代預設的方形點）
let cached = null;
export const makeStarTexture = () => {
	if (cached) return cached;
	const size = 64;
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext('2d');
	const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
	g.addColorStop(0, 'rgba(255,255,255,1)');
	g.addColorStop(0.25, 'rgba(255,255,255,0.85)');
	g.addColorStop(0.55, 'rgba(255,255,255,0.25)');
	g.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, size, size);
	cached = new THREE.CanvasTexture(canvas);
	return cached;
};
