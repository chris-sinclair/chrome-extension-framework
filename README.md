Simple Chrome Extension Framework
==========================

## Overview
This is a really simple messaging framework for creating a Chrome Extension. 
It provides communication between all layers of Extension functionality.
For more information about Chrome Extension Development please visit the [Google Developer Website](http://developer.chrome.com/extensions/getstarted.html)

## Getting started
The framework is wrapped into a simple template for jump-starting a new Chrome Extension. The template consists
of a single script for each layer of the extension, that instantiates the appropriate class of the framework, and
listens then for any notifications about framework communication.

The manifest is configured to run this extension as is, so can be loaded unpacked in developer mode.
It currently references http://www.example.com/ for Content Script injection, so you will need to change this to match
the site where you would like this functionality to occur.

The framework will work fine with or without the Content Script being used, with messaging obviously only occurring between 
the Panel and the Background.

## Notes
At the moment this is really first pass kind of stuff, and I hope after a bit of use, it can become a bit more robust.

The commenting is a bit excessive, but good for [jsdocs](https://github.com/jsdoc3/jsdoc).