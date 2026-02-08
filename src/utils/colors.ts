/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Color } from "../jsonLanguageTypes";

const Digit0 = 48;
const Digit9 = 57;
const A = 65;
const a = 97;
const f = 102;

export function hexDigit(charCode: number) {
	if (charCode < Digit0) {
		return 0;
	}
	if (charCode <= Digit9) {
		return charCode - Digit0;
	}
	if (charCode < a) {
		charCode += (a - A);
	}
	if (charCode >= a && charCode <= f) {
		return charCode - a + 10;
	}
	return 0;
}

export function colorFromHex(text: string): Color | undefined {
	if (text[0] !== '#') {
		return undefined;
	}
	switch (text.length) {
		case 4:
			return {
				red: (hexDigit(text.charCodeAt(1)) * 0x11) / 255.0,
				green: (hexDigit(text.charCodeAt(2)) * 0x11) / 255.0,
				blue: (hexDigit(text.charCodeAt(3)) * 0x11) / 255.0,
				alpha: 1
			};
		case 5:
			return {
				red: (hexDigit(text.charCodeAt(1)) * 0x11) / 255.0,
				green: (hexDigit(text.charCodeAt(2)) * 0x11) / 255.0,
				blue: (hexDigit(text.charCodeAt(3)) * 0x11) / 255.0,
				alpha: (hexDigit(text.charCodeAt(4)) * 0x11) / 255.0,
			};
		case 7:
			return {
				red: (hexDigit(text.charCodeAt(1)) * 0x10 + hexDigit(text.charCodeAt(2))) / 255.0,
				green: (hexDigit(text.charCodeAt(3)) * 0x10 + hexDigit(text.charCodeAt(4))) / 255.0,
				blue: (hexDigit(text.charCodeAt(5)) * 0x10 + hexDigit(text.charCodeAt(6))) / 255.0,
				alpha: 1
			};
		case 9:
			return {
				red: (hexDigit(text.charCodeAt(1)) * 0x10 + hexDigit(text.charCodeAt(2))) / 255.0,
				green: (hexDigit(text.charCodeAt(3)) * 0x10 + hexDigit(text.charCodeAt(4))) / 255.0,
				blue: (hexDigit(text.charCodeAt(5)) * 0x10 + hexDigit(text.charCodeAt(6))) / 255.0,
				alpha: (hexDigit(text.charCodeAt(7)) * 0x10 + hexDigit(text.charCodeAt(8))) / 255.0
			};
	}
	return undefined;
}

export function colorFrom256RGB(red: number, green: number, blue: number, alpha: number = 1.0) {
	return {
		red: red / 255.0,
		green: green / 255.0,
		blue: blue / 255.0,
		alpha
	};
}

/**
 * Assumes H is in the range 0-360, and S, L are in the range 0-1.
 */
function colorFromHSL(h: number, s: number, l: number, alpha: number = 1.0): Color {
	s = Math.max(0, Math.min(1, s)); // Saturation should be in [0, 1]
	l = Math.max(0, Math.min(1, l)); // Lightness should be in [0, 1]

	const c = (1 - Math.abs(2 * l - 1)) * s; // Chroma
	const x = c * (1 - Math.abs((h / 60) % 2 - 1)); // Second largest component
	const m = l - c / 2;

	let r = 0, g = 0, b = 0;

	if (h < 60) {
		r = c; g = x; b = 0;
	} else if (h < 120) {
		r = x; g = c; b = 0;
	} else if (h < 180) {
		r = 0; g = c; b = x;
	} else if (h < 240) {
		r = 0; g = x; b = c;
	} else if (h < 300) {
		r = x; g = 0; b = c;
	} else {
		r = c; g = 0; b = x;
	}

	return {
		red: r + m,
		green: g + m,
		blue: b + m,
		alpha,
	};
}

/**
 * Assumes H is in the range 0-360, and W, B are in the range 0-1.
 */
function colorFromHWB(h: number, w: number, b: number, alpha: number = 1.0): Color {
	w = Math.max(0, Math.min(1, w)); // Saturation should be in [0, 1]
	b = Math.max(0, Math.min(1, b)); // Lightness should be in [0, 1]

	if (w + b >= 1) {
		let gray = w / (w + b);
		let rgbValue = Math.round(gray * 255);
		return {
			red: rgbValue,
			green: rgbValue,
			blue: rgbValue,
			alpha,
		}
	}

	// Convert HWB to an intermediate HSL for calculation.
	// The saturation and lightness calculation here is a common way to bridge models.
	let lightness = w + (1 - b - w) / 2;
	let saturation = (1 - b - w === 0) ? 0 : (lightness === 0 || lightness === 1) ? 0 : (1 - w - b) / (1 - Math.abs(2 * lightness - 1));
	return colorFromHSL(h, saturation, lightness, alpha);
}

const RE_ST_COLOR_HEX = /^\s*color\(\s*(?<hex>#[a-zA-Z0-9]+)(?:\s+alpha\(\s*(?<a>[\d.]+)\s*\)\s*\))/
const RE_ST_COLOR_RGB = /^\s*color\(\s*rgb\(\s*(?<r>\d+)\s*,\s*(?<g>\d+)\s*,\s*(?<b>\d+)\s*\)(?:\s+alpha\(\s*(?<a>[\d.]+)\s*\)\s*\))/
const RE_ST_COLOR_HSL = /^\s*color\(\s*hsl\(\s*(?<h>\d+)\s*,\s*(?<s>\d+%)\s*,\s*(?<l>\d+%)\s*\)(?:\s+alpha\(\s*(?<a>[\d.]+)\s*\)\s*\))/
const RE_ST_COLOR_HWB = /^\s*color\(\s*hwb\(\s*(?<h>\d+)\s*,\s*(?<w>\d+%)\s*,\s*(?<b>\d+%)\s*\)(?:\s+alpha\(\s*(?<a>[\d.]+)\s*\)\s*\))/
const RE_ST_RGB = /^\s*rgba?\(\s*(?<r>\d+)\s*,\s*(?<g>\d+)\s*,\s*(?<b>\d+)\s*(?:,\s*(?<a>[\d.]+))?\s*\)/;
const RE_ST_HSL = /^\s*hsla?\(\s*(?<h>\d+)\s*,\s*(?<s>\d+%)\s*,\s*(?<l>\d+%)\s*(?:,\s*(?<a>[\d.]+))?\s*\)/;
const RE_ST_HWB = /^\s*hwb\(\s*(?<h>\d+)\s*,\s*(?<w>\d+%)\s*,\s*(?<b>\d+%)\s*(?:,\s*(?<a>[\d.]+))?\s*\)/;

export function tryParseColor(text: string): Color | undefined {
	let color = colorFromHex(text);
	if (color) {
		return color
	}

	let m = RE_ST_COLOR_HEX.exec(text)
	if (m?.groups) {
		const hex = m.groups.hex
		let a = ''
		if (m.groups.a) {
			const alpha = Number.parseFloat(m.groups.a)
			if (hex.length === 4) {
				a = Math.round(alpha * 15.0).toString(16)
			} else {
				a = Math.round(alpha * 255.0).toString(16).padStart(2, '0')
			}
		}
		return colorFromHex(`${hex}${a}`)
	}

	m = RE_ST_COLOR_RGB.exec(text) || RE_ST_RGB.exec(text)
	if (m?.groups) {
		const r = Number.parseInt(m.groups.r)
		const g = Number.parseInt(m.groups.g)
		const b = Number.parseInt(m.groups.b)
		const a = m.groups.a ? Number.parseFloat(m.groups.a) : undefined
		return colorFrom256RGB(r, g, b, a)
	}

	m = RE_ST_COLOR_HSL.exec(text) || RE_ST_HSL.exec(text)
	if (m?.groups) {
		const h = Number.parseInt(m.groups.h)
		const s = Number.parseInt(m.groups.s) / 100
		const l = Number.parseInt(m.groups.l) / 100
		const a = m.groups.a ? Number.parseFloat(m.groups.a) : undefined
		return colorFromHSL(h, s, l, a)
	}

	m = RE_ST_COLOR_HWB.exec(text) || RE_ST_HWB.exec(text)
	if (m?.groups) {
		const h = Number.parseInt(m.groups.h)
		const w = Number.parseInt(m.groups.w) / 100
		const b = Number.parseInt(m.groups.b) / 100
		const a = m.groups.a ? Number.parseFloat(m.groups.a) : undefined
		return colorFromHWB(h, w, b, a)
	}

	return undefined
}
