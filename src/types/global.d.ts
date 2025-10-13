import type { SwaggerConfigs } from "swagger-ui-dist";
import type { ProtobufLibrary } from "./protobuf";

export {};

declare global {
	var SwaggerProtoBufUIBundle: (
		libraryObject: ProtobufLibrary,
		options: SwaggerConfigs
	) => void;

	var SwaggerUIBundle: (options: SwaggerConfigs) => void;
}
