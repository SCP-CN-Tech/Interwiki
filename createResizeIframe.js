document.addEventListener("DOMContentLoaded",function(){
    var mySite = document.referrer.replace(/(https?:\/\/[^/]*)\/?.*/, '$1/');

    var iframeSet = document.getElementById('iframeset');
    var oldHeight = 0;

    var url = location.href;
    url = url.replace(/^.*\//,'/');

    createResizeIframe();

    function createResizeIframe(){

        var Height = getMyHeight();
        var iframe = document.createElement("iframe");
        var CacheBreak = String(Math.floor(Math.random() * 10000));

        if(Height != oldHeight){
            iframeSet.innerHTML = '';
            iframe.src = mySite + "common--javascript/resize-iframe.html?" + CacheBreak + "#" + Height + url;
            iframe.style.display = "none";

            iframeSet.appendChild(iframe);
            oldHeight = Height;
        }
        setTimeout(createResizeIframe,50);
   }

    function getMyHeight() {

        return iframeSet.getBoundingClientRect().top;
    };
});