// global variable to store current language
window.language = null

// for each language map the placeholder to a string
var languages = {} 
languages["en"] = {
    "login.gateway": "Gateway",
    "login.gateway.hostname": "Hostname",
    "login.gateway.port": "Port",
    "login.gateway.ssl": "Use SSL",
    "login.house": "House",
    "login.house.id": "House ID / e-mail address",
    "login.house.passcode": "Passcode",
    "login.user": "User",
    "login.user.username": "Username",
    "login.user.password": "Password",
    "login.remember_me": "Remember Connection",
    "login.login_button": "Login",
    "login.connecting": "Connecting...",
    
    "gui.connected": "Connected",
    "gui.popup.close": "Close",
    "gui.wizard.close": "Back",
    "gui.wizard.delete": "Delete",
    "gui.wizard.save": "Save",
    
    "toolbar.view_all": "View All",
    
    "page.edit": "Edit Page",
    "page.delete": "Delete Page",
    "page.add_row": "Add Row",
    "page.discard_changes": "Discard Changes",
    "page.save_changes": "Save Changes",
    "page.go_to_top": "Go to Top",
    
}

// return the locale of the provided placeholder
function locale(id, args=null) {
    // get the corresponding text
    var text = null
    if (id in languages[window.language]) text = languages[window.language][id]
    else if (id in languages["en"]) text = languages["en"][id]
    if (text == null) {
        console.log("unable to apply locale to "+id+" ("+window.language+")")
        return ""
    }
    // apply replacement if needed
    if (args != null) {
        for (var i = 0; i < args.length; i++) {
            text.replace("%"+(i+1), args[i])
        }
    }
    return text
}

// set current language
function set_language(language) {
    if (language in languages) window.language = language
    else window.language = "en"
}

// set the default language
set_language(window.EGEOFFREY_LANGUAGE)