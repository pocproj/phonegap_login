$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    //test for Hana login page
    options.success = function (data) {
        if(options.url.search("xsjs")>-1){
            alert('Ajax success from Hana');
            console.log('Ajax success from Hana');
        }
        if (options.url.search("xsjs")>-1 && !!data.search && data.search("initLoginForm") > -1) {
            location.href = app.config.loginPage;
        }
        else {
            if (!!originalOptions.success)
                originalOptions.success.apply(originalOptions.context, arguments);
        }

    };
    options.error=function(xhr, status, error){
        try{
            var xhrStatus = xhr.status;
            alert('Ajax Error: '+xhrStatus.toString()+error.toString());
            console.log('Ajax Error: '+status.toString()+error.toString());
            if(inArray(xhrStatus, [401])){
                location.href = app.config.loginPage;
            }
//            else if(inArray(xhrStatus, [408])){
//                jQuery.sap.require("sap.ui.commons.MessageBox");
//                sap.ui.commons.MessageBox.alert('Your session has expired; please log on again', fnCallbackTimeout, 'Session Expired');
//            }
//            else{
//                if(!!originalOptions.error)
//                    originalOptions.error.apply(originalOptions.context, arguments);
//            }
        }catch(e){
            alert(e);
        }
    };
});