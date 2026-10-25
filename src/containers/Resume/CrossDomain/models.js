import * as THREE from 'three';

// 具象 3D 模型：每個領域組出一眼認得出的物件（實心材質 + 自發光，吃泛光）
const solid = (color, { emissive, ei = 0.25, metal = 0.35, rough = 0.45 } = {}) =>
	new THREE.MeshStandardMaterial({
		color: new THREE.Color(color),
		emissive: new THREE.Color(emissive || color),
		emissiveIntensity: ei,
		metalness: metal,
		roughness: rough,
	});

const neon = (color, ei = 0.9) =>
	new THREE.MeshStandardMaterial({
		color: new THREE.Color(color),
		emissive: new THREE.Color(color),
		emissiveIntensity: ei,
		metalness: 0,
		roughness: 0.3,
	});

const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const sph = (r, m, s = 16) => new THREE.Mesh(new THREE.SphereGeometry(r, s, s), m);
const cyl = (rt, rb, h, m, s = 14) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), m);

// 前端：瀏覽器視窗 + 圖表
const frontend = (color) => {
	const g = new THREE.Group();
	const dark = solid('#0c2330', { emissive: color, ei: 0.12 });
	const screen = box(11, 7, 0.5, dark);
	g.add(screen);
	const bar = box(11, 1.1, 0.55, neon(color, 0.7));
	bar.position.y = 3.05;
	g.add(bar);
	[-4.9, -4.3, -3.7].forEach((x) => {
		const d = sph(0.2, neon('#0c2330', 0), 10);
		d.position.set(x, 3.05, 0.3);
		g.add(d);
	});
	// 內容列
	for (let i = 0; i < 3; i++) {
		const b = box(5 - i, 0.5, 0.15, neon(color, 0.45));
		b.position.set(-2.3, 1.2 - i * 1.1, 0.3);
		g.add(b);
	}
	// 長條圖
	[1.3, 2.2, 3.1, 1.8].forEach((h, i) => {
		const c = box(0.7, h, 0.35, neon(color, 0.9));
		c.position.set(1.6 + i * 1.0, -1.6 + h / 2, 0.3);
		g.add(c);
	});
	g.scale.setScalar(0.85);
	return g;
};

// 後端 × 雲端：伺服器機櫃 + 雲
const backend = (color) => {
	const g = new THREE.Group();
	const body = solid('#0c2a22', { emissive: color, ei: 0.1, metal: 0.6 });
	const rack = box(6, 8, 4, body);
	rack.position.y = -1.5;
	g.add(rack);
	for (let i = 0; i < 4; i++) {
		const slot = box(5.2, 0.9, 0.3, solid('#123a30'));
		slot.position.set(0, 1.2 - i * 1.6, 2.05);
		g.add(slot);
		const light = sph(0.22, neon(color, 1.6), 10);
		light.position.set(-2.2, 1.2 - i * 1.6, 2.2);
		g.add(light);
	}
	// 雲（幾顆球疊成）
	const cloud = new THREE.Group();
	const cm = neon(color, 0.5);
	[[-2, 0, 1.6], [0.6, 0.6, 1.9], [2.4, 0, 1.4], [0.3, -0.4, 2.2]].forEach(([x, y, r]) => {
		const s = sph(r, cm);
		s.position.set(x, y, 0);
		cloud.add(s);
	});
	cloud.position.set(0, 5, 0);
	cloud.scale.setScalar(0.9);
	g.add(cloud);
	g.scale.setScalar(0.8);
	return g;
};

// Python 爬蟲：蜘蛛機器人
const crawler = (color) => {
	const g = new THREE.Group();
	const bodyMat = solid(color, { emissive: color, ei: 0.4, metal: 0.5, rough: 0.3 });
	const body = sph(2.4, bodyMat);
	body.scale.set(1.2, 0.9, 1.2);
	g.add(body);
	const head = sph(1.3, bodyMat);
	head.position.set(0, 0.3, 2.3);
	g.add(head);
	// 眼睛
	[[-0.5, 0.6, 3.1], [0.5, 0.6, 3.1]].forEach(([x, y, z]) => {
		const e = sph(0.32, neon('#fff2cc', 1.4), 10);
		e.position.set(x, y, z);
		g.add(e);
	});
	// 八隻腳
	const legMat = neon(color, 0.7);
	for (let i = 0; i < 8; i++) {
		const side = i < 4 ? -1 : 1;
		const idx = i % 4;
		const leg = cyl(0.14, 0.14, 4, legMat, 8);
		leg.position.set(side * 2.2, -0.2, 1.4 - idx * 1.1);
		leg.rotation.z = side * 1.0;
		leg.rotation.x = 0.2;
		g.add(leg);
	}
	g.scale.setScalar(0.95);
	return g;
};

// Unity：遊戲角色方塊 + 金幣 + 平台
const unity = (color) => {
	const g = new THREE.Group();
	const charMat = solid(color, { emissive: color, ei: 0.35, rough: 0.35 });
	const char = box(4, 4, 4, charMat);
	char.position.y = 0.5;
	g.add(char);
	// 眼睛
	[[-0.9, 1.2, 2.05], [0.9, 1.2, 2.05]].forEach(([x, y, z]) => {
		const e = box(0.5, 0.8, 0.2, neon('#ffffff', 1.2));
		e.position.set(x, y, z);
		g.add(e);
	});
	// 平台
	const plat = cyl(3.2, 3.6, 0.8, solid('#2a1a52', { emissive: color, ei: 0.15 }), 20);
	plat.position.y = -2.4;
	g.add(plat);
	// 金幣（分散兩側、面向鏡頭的扁圓盤）
	const coinMat = solid('#ffd166', { emissive: '#ffb300', ei: 0.55, metal: 0.8, rough: 0.25 });
	[[-5.5, 1.2], [5.5, 1.2]].forEach(([x, y]) => {
		const coin = cyl(1.1, 1.1, 0.3, coinMat, 22);
		coin.rotation.x = Math.PI / 2; // 圓面朝鏡頭
		coin.position.set(x, y, 1);
		g.add(coin);
	});
	// 上方寶石
	const gem = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), neon('#7df9ff', 0.7));
	gem.position.set(0, 5.2, 0);
	g.add(gem);
	g.scale.setScalar(0.9);
	return g;
};

// Edge AI：相機 + 鏡頭 + 掃描光束 + 偵測框
const edgeai = (color) => {
	const g = new THREE.Group();
	const body = box(5, 3.5, 3, solid('#07323a', { emissive: color, ei: 0.12, metal: 0.6 }));
	g.add(body);
	const lens = cyl(1.3, 1.6, 1.6, solid('#0a4a56', { emissive: color, ei: 0.3 }), 22);
	lens.rotation.x = Math.PI / 2;
	lens.position.z = 2.2;
	g.add(lens);
	const iris = cyl(0.7, 0.7, 1.7, neon(color, 1.5), 22);
	iris.rotation.x = Math.PI / 2;
	iris.position.z = 2.4;
	g.add(iris);
	// 掃描光束（半透明錐）
	const beam = new THREE.Mesh(
		new THREE.ConeGeometry(4.5, 9, 24, 1, true),
		new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false })
	);
	beam.rotation.x = -Math.PI / 2;
	beam.position.z = 7;
	g.add(beam);
	// 偵測框
	const frameMat = neon(color, 1.2);
	[[6, 2.5], [-6, -1]].forEach(([x, y]) => {
		const f = new THREE.Mesh(
			new THREE.TorusGeometry(1.6, 0.08, 6, 4),
			frameMat
		);
		f.position.set(x, y, 6);
		f.rotation.z = Math.PI / 4;
		g.add(f);
	});
	g.scale.setScalar(0.95);
	return g;
};

const BUILDERS = { frontend, backend, crawler, unity, edgeai };

export const buildModel = (key, color) => (BUILDERS[key] || frontend)(color);
