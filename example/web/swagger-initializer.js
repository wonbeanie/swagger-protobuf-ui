window.onload = function() {
	window.ui = SwaggerProtoBufUIBundle(MyProto,{
		url : "http://localhost:5500/server.json",
		dom_id: '#swagger-ui'
	});
};