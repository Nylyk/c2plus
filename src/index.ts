const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = chrome.runtime.getURL('injection.css');
document.head.append(stylesheet);

const script = document.createElement('script');
script.type = 'module';
script.src = chrome.runtime.getURL('injection.js');
document.body.append(script);
