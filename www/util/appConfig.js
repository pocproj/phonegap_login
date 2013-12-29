app = $.extend((typeof(app) === 'object' && app || {}),
    (function(){
        var config = {
            host: 'iltlvl1640.dhcp.tlv.sap.corp:8000',
            loginServicesPath: '/sap/hana/xs/formLogin/',
            mainPage:'index.html',
            loginPage: 'login.html',
            protocol: 'http',
            user: 'myUser',
            password: 'Intial1234'
        };

        // complex properties
        config.loginServicesURL = 'http://'+config.host+config.loginServicesPath;
        config.baseUrl = config.protocol+'://'+config.host;
        return {config: config};
    })()
);