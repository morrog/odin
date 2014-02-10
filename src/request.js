var Base = require("./base"),

Request = Base.extend({

	defaults: {
		root: "/"
	},

	inject: {
		ajax: "ajax"
	}

});

module.exports = Request.defineMe();