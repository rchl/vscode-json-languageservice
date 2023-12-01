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

export function colorFromHsl(text: string): Color | undefined {
	if (!text.startsWith('hsl')) {
		return undefined;
	}
	const colorMatch = text.match(/hsl(a?)\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\)/i);
	if (!colorMatch) {
		return undefined;
	}
	const [_, hasAlpha, h, s, l, alpha] = colorMatch;
	if (hasAlpha && alpha === undefined || !hasAlpha && alpha) {
		return undefined;
	}
	const [red, green, blue] = HSLToRGB(Number.parseInt(h), Number.parseFloat(s), Number.parseFloat(l));
	return {
		red: red / 255.0,
		green: green / 255.0,
		blue: blue / 255.0,
		alpha: hasAlpha ? Number.parseFloat(alpha) : 1
	};
}

function HSLToRGB(h: number, s: number, l: number): [number, number, number] {
	s /= 100;
	l /= 100;
	const k = (n: number) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return [255 * f(0), 255 * f(8), 255 * f(4)];
}

export function colorFrom256RGB(red: number, green: number, blue: number, alpha: number = 1.0) {
	return {
		red: red / 255.0,
		green: green / 255.0,
		blue: blue / 255.0,
		alpha
	};
}
