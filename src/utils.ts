import DOMPurify from 'dompurify';
import type { JavaScriptObject, JavaScriptValue } from './core';

export function isBlank(str: string) {
	return typeof str !== "string" || str.trim().length === 0;
}

export function sanitizeObject(obj: JavaScriptObject | JavaScriptValue[])
: JavaScriptObject | JavaScriptValue[] {
	if (obj === null || typeof obj !== "object" || !DOMPurify.isSupported) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(item => sanitizeObject(item as JavaScriptObject)) as JavaScriptValue[];
	}

	const sanitizedObj: JavaScriptObject = {};
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const value = obj[key] as JavaScriptValue;
			if (typeof value === "string") {
				sanitizedObj[key] = DOMPurify.sanitize(value);
			} else if (typeof value === "object" && value !== null){
				sanitizedObj[key] = sanitizeObject(value as JavaScriptObject) as JavaScriptObject;
			} else {
				sanitizedObj[key] = value;
			}
		}
	}
	
	return sanitizedObj;
}
