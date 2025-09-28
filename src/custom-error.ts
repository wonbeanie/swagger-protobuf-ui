export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NotFoundError";
	}
}

export class DeserializationError extends Error {
	constructor(message: string, options: ErrorOptions) {
		super(message, options);
		this.name = "DeserializationError";
	}
}

export class SerializationError extends Error {
	constructor(message: string, options: ErrorOptions) {
		super(message, options);
		this.name = "SerializationError";
	}
}

export class InvalidSetterError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidSetterError";
	}
}
