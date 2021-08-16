function getWikiModule(v) {
    var _xhr = () => {
        if(window.XMLHttpRequest){
            return new XMLHttpRequest();
        }
        if(window.ActiveXObject){
            try{
                return new ActiveXObject("Msxml2.XMLHTTP.6.0");
            }catch(e){}
            try{
                return new ActiveXObject("Msxml2.XMLHTTP.3.0");
            }catch(e){}
            try{
                return new ActiveXObject("Microsoft.XMLHTTP");
            }catch(e){}
        }
        return false;
    },
    xhr = _xhr(),
    site_id = v.site_id ? "&s=" + v.site_id : "",
    query = "&q=" + (v.query ? v.query : "_"),
    url = "/quickmodule.php?module=PageLookupQModule" + site_id + query;
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4){
            if(xhr.status != 200){
                return;
            }
            try{
                var res = JSON.parse(xhr.responseText);
                res = res[Object.keys(res)[0]];
                v.function(res);
            }catch(e){}
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}