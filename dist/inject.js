"use strict";
const script = document.createElement('script');
script.type = 'module';
script.src = browser.runtime.getURL('js/index.js');
document.body.append(script);
