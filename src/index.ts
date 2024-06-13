const script = document.createElement('script');
script.type = 'module';
script.src = chrome.runtime.getURL('injection.js');
document.body.append(script);
