// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var reset = require("./__reset.js");
var QElement = require("./q_element.js");
var ElementEdge = require("./descriptors/element_edge.js");
var ElementCenter = require("./descriptors/element_center.js");

describe("QElement", function() {

	var frame;

	beforeEach(function() {
		frame = reset.frame;
	});

	describe("object", function() {
		it("converts to DOM element", function() {
			var q = new QElement(document.body, "body");
			var dom = q.toDomElement();

			assert.equal(dom, document.body);
		});

		it("compares to another QElement", function() {
			var head = new QElement(document.querySelector("head"), "head");    // WORKAROUND IE8: no document.head
			var body1 = new QElement(document.body, "body");
			var body2 = new QElement(document.body, "body");

			assert.objEqual(body1, body2, "equality");
			assert.objNotEqual(head, body1, "inequality");
		});

		it("element description does not affect equality", function() {
			var body1 = new QElement(document.body, "body description");
			var body2 = new QElement(document.body, "description can be anything");

			assert.objEqual(body1, body2, "should still be equal");
		});

		it("converts to string", function() {
			var element = new QElement(document.body, "nickname");
			assert.equal(element.toString(), "'nickname'");
		});
	});

	describe("property smoke tests", function() {

		var TOP = 10;
		var RIGHT = 150;
		var BOTTOM = 70;
		var LEFT = 20;

		var CENTER = 85;
		var MIDDLE = 40;

		var WIDTH = 130;
		var HEIGHT = 60;

		var element;

		beforeEach(function() {
			frame.addElement(
				"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>one</p>"
			);
			element = frame.getElement("#element");
		});

		it("edges", function() {
			assert.equal(element.top.diff(TOP), "", "top");
			assert.equal(element.right.diff(RIGHT), "", "right");
			assert.equal(element.bottom.diff(BOTTOM), "", "bottom");
			assert.equal(element.left.diff(LEFT), "", "left");
		});

		it("centers", function() {
			assert.equal(element.center.diff(CENTER), "", "center");
			assert.equal(element.middle.diff(MIDDLE), "", "middle");
		});

		it("sizes", function() {
			assert.equal(element.width.diff(WIDTH), "", "width");
			assert.equal(element.height.diff(HEIGHT), "", "height");
		});

		it("fails nicely when adding incompatible elements", function() {
			assert.exception(function() {
				element.width.plus(element.top).value();
			}, "Size isn't compatible with Position");
		});

		it("fails nicely when diffing incompatible elements", function() {
			assert.exception(function() {
				element.width.diff(element.top);
			}, "Can't compare width of '#element' to top edge of '#element': Size isn't compatible with Position");
		});

	});

	describe("raw styles and positions", function() {

		it("retrieves raw style", function() {
			var element = frame.addElement("<div style='font-size: 42px'></div>");
			assert.equal(element.getRawStyle("font-size"), "42px", "raw style");
		});

		it("returns empty string when raw style doesn't exist", function() {
			var element = frame.addElement("<div></div>");
			assert.equal(element.getRawStyle("non-existant"), "", "non-existant style");
		});

		it("retrieves raw element position", function() {
			var element = frame.addElement(
				"<div style='position: absolute; left: 30px; width: 60px; top: 20px; height: 50px;'></div>"
			);
			assert.deepEqual(element.getRawPosition(), {
				left: 30,
				right: 90,
				width: 60,

				top: 20,
				bottom: 70,
				height: 50
			});
		});

	});


	describe("diff", function() {
		var TOP = 20;
		var RIGHT = 90;
		var BOTTOM = 70;
		var LEFT = 30;

		var element;

		beforeEach(function() {
			element = frame.addElement(
				"<div style='position: absolute; left: 30px; width: 60px; top: 20px; height: 50px;'></div>"
			);
		});

		it("operates on edges", function() {
			assert.equal(element.top.diff(TOP), "", "top");
			assert.equal(element.right.diff(RIGHT), "", "right");
			assert.equal(element.bottom.diff(BOTTOM), "", "bottom");
			assert.equal(element.left.diff(LEFT), "", "left");
		});

		it("diffs one property", function() {
			var expected = element.top.diff(600);
			assert.equal(element.diff({ top: 600 }), expected, "difference");
			assert.equal(element.diff({ top: TOP }), "", "no difference");
		});

		it("diffs multiple properties", function() {
			var topDiff = element.top.diff(600);
			var rightDiff = element.right.diff(400);
			var bottomDiff = element.bottom.diff(200);

			assert.equal(
				element.diff({ top: 600, right: 400, bottom: 200 }),
				topDiff + "\n" + rightDiff + "\n" + bottomDiff,
				"three differences"
			);
			assert.equal(element.diff({ top: TOP, right: RIGHT, bottom: BOTTOM }), "", "no differences");
			assert.equal(
				element.diff({ top: 600, right: RIGHT, bottom: 200}),
				topDiff + "\n" + bottomDiff,
				"two differences, with middle one okay"
			);
			assert.equal(element.diff({ top: TOP, right: RIGHT, bottom: 200}), bottomDiff, "one difference");
		});

		it("fails fast when invalid property is provided", function() {
			assert.exception(function() {
				element.diff({ XXX: "non-existant" });
			}, /'XXX' is unknown and can't be used with diff()/);
		});

		it("supports relative comparisons", function() {
			var two = frame.addElement("<div style='position: absolute; top: 20px;'>two</div>");
			assert.equal(element.diff({ top: two.top }), "", "relative diff");
		});

		it("has variant that throws an exception when differences found", function() {
			var diff = element.diff({ top: 600 });

			assert.noException(function() {
				element.assert({ top: TOP });
			}, "same");

			assert.exception(function() {
				element.assert({ top: 600 });
			}, "Differences found:\n" + diff, "different");

			assert.exception(function() {
				element.assert({ top: 600 }, "a message");
			}, "a message:\n" + diff, "different, with a message");
		});

	});

});