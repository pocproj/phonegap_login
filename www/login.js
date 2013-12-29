
/********************************************************************
 *							Global functions						*
 *******************************************************************/ 
 
var CSRFToken = null;
 
var USERNAME_REGEX_HARD = /^[a-zA-Z][a-zA-Z0-9_-]{3,15}$/;
var PASSWORD_REGEX_HARD = /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])).{6,12}$/;
var USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]{3,15}$/;
var PASSWORD_REGEX = /^[a-zA-Z0-9_-].{6,12}$/;
var MESSAGES = {
	INVALID_USERNAME: 'Invalid username : the username must be 4 to 16 characters long and start with a letter.',
	INVALID_PASSWORD: 'Invalid password : the password must be 6 to 12 characters long.',
	INVALID_CONFIRM: 'Invalid confirm : the passwords are not identical.',
	LOGIN_FAILED: 'Login failed : wrong credentials.',
	LOGIN_SUCCESS: 'Login successful.',
	PWD_CHANGE: 'Password change : your current password is the initial password.'
};


function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && match[1].replace(/\+/g, ' ');
}

function checkSession() {
    $.get("checkSession.xsjs", function(resp) {
        if (resp) {
            if (resp.login == true) {
                if (resp.pwdChange == true) {
                    initChangePwdForm();
                }
                else {
                    initLogout(resp.username);
                }
            }
            else {
                initLoginForm();
            }
        }        
    });
}

function checkUsernameValue(fieldID) {
	var usernameField = sap.ui.getCore().getControl(fieldID);
	var testUsername = USERNAME_REGEX.test(usernameField.getValue());
	if (testUsername) {
		usernameField.setValueState(sap.ui.core.ValueState.None);
	} else {
		usernameField.setValueState(sap.ui.core.ValueState.Error);
		addNotification(MESSAGES.INVALID_USERNAME, sap.ui.core.MessageType.Error);
	}
	return testUsername;
}

function checkPasswordValue(fieldID) {
	var passwordField = sap.ui.getCore().getControl(fieldID);
	var testPassword = PASSWORD_REGEX.test(passwordField.getValue());
	if (testPassword) {
		passwordField.setValueState(sap.ui.core.ValueState.None);
	} else {
		passwordField.setValueState(sap.ui.core.ValueState.Error);
		addNotification(MESSAGES.INVALID_PASSWORD, sap.ui.core.MessageType.Error);
	}
	return testPassword;
}

function checkPasswordsEquals(pwd1FieldID, pwd2FieldID) {
	var pwd1Field = sap.ui.getCore().getControl(pwd1FieldID);
	var pwd2Field = sap.ui.getCore().getControl(pwd2FieldID);
	if (pwd1Field.getValue() === pwd2Field.getValue()) {
		pwd2Field.setValueState(sap.ui.core.ValueState.None);
        return true;
	} else {
		pwd2Field.setValueState(sap.ui.core.ValueState.Error);
        addNotification(MESSAGES.INVALID_CONFIRM, sap.ui.core.MessageType.Error);
        return false;
	}
}

function checkLoginValues() {
	//var messageNotifier = sap.ui.getCore().getControl("messageNotifier");
	//messageNotifier.removeAllMessages();

	// Check the username value
	var testUsername = checkUsernameValue("username")

	// Check the password value
	var testPassword = checkPasswordValue("password");

	return (testUsername && testPassword);
}

function checkPwdChangeValues() {
	var messageNotifier = sap.ui.getCore().getControl("messageNotifier");
	messageNotifier.removeAllMessages();
	
	// Check the new password
	var testPassword = checkPasswordValue("newPwd1");
	
	// Check the values are the same
    var testSamePassword = checkPasswordsEquals("newPwd1", "newPwd2");

    return testPassword && testSamePassword;
}

function checkPwdInitial(body) {
    if (body) {
        try {
            var messageNotifier = sap.ui.getCore().getControl("messageNotifier");
            if (body.pwdChange) {
                var oMessage = createMessage(MESSAGES.PWD_CHANGE, sap.ui.core.MessageType.Warning);
                messageNotifier.addMessage(oMessage);
                initChangePwdForm();
                return true;
            }
        }
        catch(exp) {
        }
    }
    return false;
}

function handleLoginResponse(body) {
    /* If no redirect is needed this peace of code is being executed */
	var messageNotifier = sap.ui.getCore().getControl("messageNotifier"); 
	if (!body.login) { 
		addNotification(MESSAGES.LOGIN_FAILED, sap.ui.core.MessageType.Error); 
	}
    else {
        if (checkPwdInitial(body)) {
            return;
        }
        if (getParameterByName("x-sap-origin-location") != null) {
            var hashValue = self.document.location.hash.substring(1);
            if (hashValue != "") {
                hashValue = "#" + hashValue;
            }
            location.href = decodeURIComponent(getParameterByName("x-sap-origin-location")) + hashValue;
            return;
        }
        initLogout(body.username);
    }
}

function handleLogoutResponse() {
    initLoginForm();
}

function checkOriginLocation(successFunction, error) {
    var data = {
        "x-sap-origin-location": decodeURIComponent(getParameterByName("x-sap-origin-location"))
    };
    $.ajax({
        url: "checkLocation.xsjs",
        type: "POST",
        dataType: "json",
        data: data,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("X-CSRF-Token", CSRFToken);
        },
        success: successFunction
    });
}

function sendForm() {
    var send = function() {
        var locationAllowed = function(xhr) {
            var data = {
                "xs-username": sap.ui.getCore().getControl("username").getValue(),
                "xs-password": sap.ui.getCore().getControl("password").getValue()
            };

            $.ajax({
                url: "login.xscfunc",
                type: "POST",
                dataType: "json",
                data: data,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("X-CSRF-Token", CSRFToken);
                },
                success: handleLoginResponse
            });
        };
       
        if (getParameterByName("x-sap-origin-location") != null) {
            checkOriginLocation(locationAllowed);    
        }
        else {
            locationAllowed();
        }

    };

    getCSRFToken(send);
}

function sendChangePwdForm() {
    if (checkPasswordsEquals("newPwd1", "newPwd2")) { 
        var send = function() {
            var data = {
                "xs-password-old": sap.ui.getCore().getControl("prevPwd").getValue(),
                "xs-password-new": sap.ui.getCore().getControl("newPwd1").getValue()
            };

            $.ajax({
                url: "pwchange.xscfunc",
                type: "POST",
                dataType: "json",
                data: data,
                    beforeSend: function(xhr) {
                    xhr.setRequestHeader("X-CSRF-Token", CSRFToken);
                },
                success: handleLoginResponse
            });		
        };
        getCSRFToken(send);
	}
}

function sendLogout() {
    var send = function() {
        $.ajax({
           url: "logout.xscfunc",
           type: "POST",
           dataType: "json",
           beforeSend: function(xhr) {
                xhr.setRequestHeader("X-CSRF-Token", CSRFToken);
           },
           success: handleLogoutResponse
       });		
    };
    getCSRFToken(send);
}
  
function getCSRFToken(callback) {
	$.ajax({
		url: "token.xsjs",
		type: "GET",
		beforeSend: function(xhr) {
			xhr.setRequestHeader("X-CSRF-Token", "Fetch");
		},
		success: function(data, textStatus, XMLHttpRequest) {
			CSRFToken = XMLHttpRequest.getResponseHeader('X-CSRF-Token');
            callback();
		}
	});
}
 
