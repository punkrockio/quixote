// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var Descriptor = require("./descriptor.js");
var PageSize = require("./page_size.js");
var Size = require("../values/size.js");

describe("PageSize", function() {

	var WIDTH = reset.WIDTH;
	var HEIGHT = reset.HEIGHT;

	var frame;
	var contentDoc;
	var width;
	var height;
	var fullWidthEl;

	beforeEach(function() {
		frame = reset.frame;
	});

	beforeEach(function() {
		contentDoc = frame.toDomElement().contentDocument;
		width = PageSize.x(frame);
		height = PageSize.y(frame);

		contentDoc.body.style.backgroundColor = "blue";
		//fullWidthEl = frame.add(
		//	"<div style='width: 100%; background-color: red;'>full width</div>"
		//);
	});

	afterEach(function() {
		//contentDoc.body.setAttribute("style", "");
		contentDoc.body.style.padding = "0";
		contentDoc.body.style.borderWidth = "0";
		contentDoc.body.style.margin = "0";
	});

	it("is a descriptor", function() {
		assert.implements(width, Descriptor);
	});

	it("matches frame size when everything fits in the window", function() {
		assert.objEqual(width.value(), Size.create(WIDTH), "width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	});

	it("accounts for body padding", function() {
		contentDoc.body.style.padding = "1px 2px 4px 8px";
		assert.objEqual(width.value(), Size.create(WIDTH), "width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	});

	it("accounts for body border", function() {
		contentDoc.body.style.borderWidth = "1px 2px 4px 8px";
		assert.objEqual(width.value(), Size.create(WIDTH), "width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	});

	it("accounts for body margin", function() {
		contentDoc.body.style.margin = "1px 2px 4px 8px";

		assert.objEqual(width.value(), Size.create(WIDTH), "width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	});

	it("ignores box model", function() {
		contentDoc.body.style.padding = "1px 2px 4px 8px";
		contentDoc.body.style.margin = "16px 32px 64px 128px";

		contentDoc.body.style.boxSizing = "border-box";
		assert.objEqual(width.value(), Size.create(WIDTH), "border-box width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "border-box height");

		contentDoc.body.style.boxSizing = "content-box";
		assert.objEqual(width.value(), Size.create(WIDTH), "content-box width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "content-box height");
	});

	it("accounts for elements outside width of frame", function() {
		frame.add(
			"<div style='position: absolute; left: " + (WIDTH + 100) + "px; " +
			"top: 100px; width: 100px; height: 100px; background-color: green'>force scrolling</div>"
		);
		var fullHeight = frame.add(
			"<div style='position: absolute; top: 0px; bottom: 0px; " +
			"width: 100px; background-color: red;'>full height</div>"
		);

		if (!quixote.browser.canScroll()) {
			// WORKAROUND Mobile Safari 7.0.0: ignores frame width and height
			assert.objEqual(width.value(), Size.create(WIDTH + 200), "Mobile Safari ignores frame width");
			return;
		}

		assert.objEqual(width.value(), Size.create(WIDTH), "width should not include element outside frame");
		assert.objEqual(height.value(), fullHeight.height.value(), "height should account for scrollbar");
	});

	it("accounts for elements outside height of frame ", function() {
		frame.add(
			"<div style='position: absolute; top: " + (HEIGHT + 100) + "px; " +
			"left: 100px; width: 100px; height: 100px; background-color: green'>force scrolling</div>"
		);
		var fullWidth = frame.add(
			"<div style='width: 100%; background-color: red;'>full width</div>"
		);

		if (!quixote.browser.canScroll()) {
			// WORKAROUND Mobile Safari 7.0.0: ignores frame width and height
			assert.objEqual(height.value(), Size.create(HEIGHT + 200), "Mobile Safari ignores frame height");
			return;
		}

		assert.objEqual(height.value(), Size.create(HEIGHT), "height should not include element outside frame");
		assert.objEqual(width.value(), fullWidth.width.value(), "width should account for scrollbar");
	});

	//it("accounts for elements wider than frame", function() {
	//	frame.add(
	//		"<div style='position: absolute; left: " + (WIDTH + 100) + "px; " +
	//		"top: 100px; width: 100px; height: 100px; background-color: green'>force scrollbar</div>"
	//	);
	//	var fullHeight = frame.add(
	//		"<div style='position: absolute; top: 0px; bottom: 0px; " +
	//		"width: 100px; background-color: red;'>full height</div>"
	//	);
	//
	//	assert.objEqual(height.value(), fullHeight.height.value());
	//});
	//
	//it.only("width includes content larger than frame", function() {
	//	reset.DEBUG = true;
	//
	//	frame.add(
	//		"<div style='position: absolute; top: " + (HEIGHT + 100) + "px; " +
	//		"left: 100px; width: 100px; height: 100px; background-color: green'>taller than frame</div>"
	//	);
	//	frame.add(
	//		"<div style='position: absolute; left: " + (WIDTH + 100) + "px; " +
	//		"top: 100px; width: 100px; height: 100px; background-color: green'>wider than frame</div>"
	//	);
	//	assert.objEqual(width.value(), Size.create(WIDTH + 200), "width");
	//	assert.objEqual(height.value(), Size.create(HEIGHT + 200), "height");
	//});

	//it("resolves to value", function() {
	//	assert.objEqual(width.value(), Size.create(WIDTH), "width");
	//	assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	//});
	//
	//it("converts comparison arguments", function() {
	//	assert.objEqual(width.convert(13, "number"), Size.create(13), "converts numbers to sizes");
	//});
	//
	//it("converts to string", function() {
	//	assert.equal(width.toString(), "width of " + element);
	//	assert.equal(height.toString(), "height of " + element);
	//});
	//
	//it("can be arithmaticated (yes, that's a word now)", function() {
	//	assert.objEqual(width.plus(10).value(), Size.create(WIDTH + 10), "bigger");
	//	assert.objEqual(width.minus(10).value(), Size.create(WIDTH - 10), "smaller");
	//	assert.objEqual(width.times(3).value(), Size.create(WIDTH * 3), "multiplied");
	//});
	//
	//it("can be modified (but not multiplied) by the size of another element", function() {
	//	assert.objEqual(width.plus(element.width).value(), Size.create(WIDTH + WIDTH), "plus");
	//	assert.objEqual(width.minus(element.height).value(), Size.create(WIDTH - HEIGHT), "minus");
	//});

});