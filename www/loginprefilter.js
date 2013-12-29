$.ajaxPrefilter(function(options,originalOptions, jqXHR) {
    var origO = originalOptions;
    if(options.url.search(/^\w+\.xs\w+$/mg)>-1){
        var username = getPropertyByPath(origO,'data.xs-username');
        if(!!username){
            // replace all '@' and '.' with '_'
            options.data = options.data.replace(encodeURIComponent(username),encodeURIComponent(username.replace(/[@,\.]/g,"_")));
            alert(options.data);
        }
        // go to app main page on login success
        if(!!origO.success){
            options.success = function(data){
                if(!!data.login && !data.pwdChange){
                    location.href = app.config.mainPage;
                }else{
                    origO.success.apply(originalOptions.context, arguments);
                }
            };
        }

        // redirect all calls to login services to the hana server formLogin location
        options.url = app.config.loginServicesURL + encodeURIComponent( options.url );
    }
});
