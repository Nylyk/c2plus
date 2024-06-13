"use strict";
const script = document.createElement('script');
script.type = 'module';
script.src = chrome.runtime.getURL('js/index.js');
document.body.append(script);
