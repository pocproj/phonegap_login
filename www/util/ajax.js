$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    //test for Hana login page
    options.success = function (data) {
        if (options.url.search("xsjs") && !!data.search && data.search("initLoginForm") > -1) {
            setTimeout(function () {
                location.href = app.config.loginPage;
            }, 200);
        }
        else {
            if (!!originalOptions.success)
                originalOptions.success.apply(originalOptions.context, arguments);
        }

    };
    options.error=function(xhr, status, error){
        try{
            var xhrStatus = xhr.status;
            console.log(xhrStatus.toString());
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