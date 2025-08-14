window.onload = function() {
	window.ui = SwaggerProtoBufUIBundle(MyProto,{
		url : "http://127.0.0.1:5500/server.json",
		dom_id: '#swagger-ui',
		presets: [
			SwaggerUIBundle.presets.apis,
			SwaggerUIStandalonePreset
		],
	});
};