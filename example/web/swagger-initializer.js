window.onload = function() {
	window.ui = SwaggerProtoBufUIBundle(MyProto,{
		url : "http://localhost:8080/server.json",
		dom_id: '#swagger-ui',
		presets: [
			SwaggerUIBundle.presets.apis,
			SwaggerUIStandalonePreset
		],
	});
};