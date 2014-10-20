// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./assert.js");
var oop = require("./oop.js");
var shim = require("./shim.js");

describe("OOP module", function() {

	it("determines name of class", function() {
		function Me() {}
		var Anon = function() {};

		assert.equal(oop.className(Me), "Me", "named class");
		assert.equal(oop.className(Anon), "<anon>", "unnamed class");

		assert.exception(function() {
			console.log(oop.className({}));
		}, /Not a constructor/, "not a class");
	});

	it("determines name of object's class", function() {
		// WORKAROUND IE 8: The IE 8 getPrototypeOf shim is incomplete, so we skip this test
		if (!Object.getPrototypeOf) return;

		function Me() {}
		assert.equal(oop.instanceName(new Me()), "Me", "named class");

		var Anon = function() {};
		assert.equal(oop.instanceName(new Anon()), "<anon>", "unnamed class");

		function BadConstructor() {}
		BadConstructor.prototype.constructor = undefined;
		assert.equal(oop.instanceName(new BadConstructor()), "<anon>", "undefined constructor");
		BadConstructor.prototype.constructor = null;
		assert.equal(oop.instanceName(new BadConstructor()), "<anon>", "null constructor");
		BadConstructor.prototype.constructor = "foo";
		assert.equal(oop.instanceName(new BadConstructor()), "<anon>", "non-function constructor");

		var noPrototype = shim.Object.create(null);
		assert.equal(oop.instanceName(noPrototype), "<no prototype>", "no prototype");
	});

	it("creates extend function", function() {
		// WORKAROUND IE 8: The IE 8 getPrototypeOf shim is incomplete, so we skip this test
		// The production code works fine on IE 8, but the test relies on getPrototypeOf().
		if (!Object.getPrototypeOf) return;

		function Parent() {}
		Parent.extend = oop.extendFn(Parent);

		function Child() {}
		Parent.extend(Child);

		assert.equal(shim.Object.getPrototypeOf(Child.prototype).constructor, Parent, "prototype chain");
		assert.equal(Child.prototype.constructor, Child, "constructor property");
	});

});