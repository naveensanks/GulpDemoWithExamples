var getTimeoutValue = function () {
    return 2000;
};

// font loader
var WebFontConfig = {
  google: {
    families: [
      'Bitter:700:latin',
      'Raleway:400:latin'
    ]
  },
  timeout: getTimeoutValue()
};

(function() {
  "use strict";
  var wf = document.createElement('script');
  wf.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
  wf.async = 'true';
  document.head.appendChild(wf);
  console.log('fonts loading');
})();
