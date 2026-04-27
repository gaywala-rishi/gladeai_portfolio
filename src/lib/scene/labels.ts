// labels.ts — World-space floating HTML labels that track 3D positions.
// The label DOM node lives OUTSIDE the canvas (overlaid via CSS position:absolute).

import * as THREE from 'three';

export type LabelConfig = {
	key: string;
	position: THREE.Vector3;
	emoji: string;
	text: string;
};

export const LABEL_CONFIGS: LabelConfig[] = [
	{ key: 'laptop',     position: new THREE.Vector3(-0.3, 2.0, -6.5),  emoji: '💻', text: 'Projects' },
	{ key: 'bookshelf',  position: new THREE.Vector3(4.5,  2.5, -7.0),  emoji: '📚', text: 'Skills'   },
	{ key: 'frame',      position: new THREE.Vector3(0.1,  2.2, -5.9),  emoji: '🖼️', text: 'About Me' },
	{ key: 'character',  position: new THREE.Vector3(-3.5, 2.8, -7.0),  emoji: '👨‍💻', text: 'Contact'  }
];

export function createLabelElements(container: HTMLElement): Map<string, HTMLElement> {
	const map = new Map<string, HTMLElement>();
	for (const cfg of LABEL_CONFIGS) {
		const el = document.createElement('div');
		el.className = 'scene-label';
		el.dataset.key = cfg.key;
		el.innerHTML = `<span class="label-emoji">${cfg.emoji}</span><span class="label-text">${cfg.text}</span>`;
		container.appendChild(el);
		map.set(cfg.key, el);
	}
	return map;
}

const _v = new THREE.Vector3();

export function updateLabels(
	labels: Map<string, HTMLElement>,
	camera: THREE.Camera,
	renderer: THREE.WebGLRenderer,
	hidden: boolean
) {
	const w = renderer.domElement.clientWidth;
	const h = renderer.domElement.clientHeight;

	for (const cfg of LABEL_CONFIGS) {
		const el = labels.get(cfg.key);
		if (!el) continue;

		if (hidden) {
			el.style.opacity = '0';
			continue;
		}

		_v.copy(cfg.position).project(camera);

		// Cull if behind camera
		if (_v.z > 1) {
			el.style.opacity = '0';
			continue;
		}

		const x = (_v.x * 0.5 + 0.5) * w;
		const y = (-_v.y * 0.5 + 0.5) * h;

		el.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
		el.style.opacity = '1';
	}
}
