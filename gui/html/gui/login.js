

// login screen and gui initialization
class Login {
    constructor() {
        this.watchdog = null
		this.connections = new Connections()
        this.draw()
    }
	
	// reload the saved connection select
	load_saved_connections() {
		var connections = this.connections.get()
		$("#saved_connections").empty()
		$("#saved_connections").append(new Option("Load saved connection...", "__select__"));
		if (connections != null) {
			for (var connection_id in connections["connections"]) {
				var connection = connections["connections"][connection_id]
				$("#saved_connections").append(new Option(connection["EGEOFFREY_USERNAME"]+"@"+connection["EGEOFFREY_ID"]+" ("+connection["EGEOFFREY_GATEWAY_HOSTNAME"]+":"+connection["EGEOFFREY_GATEWAY_PORT"]+")", connection_id));
			}
		}
	}
    
    // draw the login form
    draw() {
        // draw login box
        $("#login_box").empty()
        $("#login_box").html('\
            <span id="login_disclaimer"></span>\
            <form id="login_form">\
                <div class="card card-primary">\
                    <div class="has-feedback">\
                        <select class="form-control" id="saved_connections">\
                        </select>\
                    </div>\
                </div>\
                <div class="card card-primary">\
                    <div class="card-header with-border">\
                        <h3 class="card-title"><i class="fas fa-project-diagram"></i> '+locale("login.gateway")+'</h3>\
                        <div class="card-tools pull-right">\
                            <button type="button" class="btn btn-card-tool" data-widget="collapse"><i class="fa fa-minus"></i>\
                            </button>\
                        </div>\
                    </div>\
                    <div class="card-body">\
                        <div class="form-group has-feedback">\
                            <input type="input" class="form-control" placeholder="'+locale("login.gateway.hostname")+'" id="egeoffrey_gateway_hostname">\
                        </div>\
                        <div class="form-group has-feedback">\
                            <input type="input" class="form-control" placeholder="'+locale("login.gateway.port")+'" id="egeoffrey_gateway_port" value="443">\
                        </div>\
                        <div class="form-group has-feedback">\
                            <div class="checkbox icheck">\
                                <label>\
                                    <input type="checkbox" id="egeoffrey_gateway_ssl"> '+locale("login.gateway.ssl")+'\
                                </label>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <div class="card card-primary">\
                    <div class="card-header with-border">\
                        <h3 class="card-title"><i class="fas fa-home"></i> '+locale("login.house")+'</h3>\
\
                        <div class="card-tools pull-right">\
                            <button type="button" class="btn btn-card-tool" data-widget="collapse"><i class="fa fa-minus"></i>\
                            </button>\
                        </div>\
                    </div>\
                    <div class="card-body">\
                        <div class="form-group has-feedback">\
                            <input type="input" class="form-control" placeholder="'+locale("login.house.id")+'" id="egeoffrey_id" value="house">\
                        </div>\
                        <div class="form-group has-feedback">\
                            <input type="password" class="form-control" placeholder="'+locale("login.house.passcode")+'" id="egeoffrey_passcode">\
                        </div>\
                    </div>\
                </div>\
                <div class="card card-primary">\
                    <div class="card-header with-border">\
                        <h3 class="card-title"><i class="fas fa-user"></i> '+locale("login.user")+'</h3>\
\
                        <div class="card-tools pull-right">\
                            <button type="button" class="btn btn-card-tool" data-widget="collapse"><i class="fa fa-minus"></i>\
                            </button>\
                        </div>\
                    </div>\
                    <div class="card-body">\
                        <div class="form-group has-feedback">\
                            <input type="input" class="form-control" placeholder="'+locale("login.user.username")+'" id="egeoffrey_username" value="guest">\
                        </div>\
                        <div class="form-group has-feedback">\
                            <input type="password" class="form-control" placeholder="'+locale("login.user.password")+'" id="egeoffrey_password">\
                        </div>\
                    </div>\
                </div>\
                <div class="card card-primary collapsed-card">\
                    <div class="card-header with-border">\
                        <h3 class="card-title"><i class="fas fa-cogs"></i> Advanced</h3>\
\
                        <div class="card-tools pull-right">\
                            <button type="button" class="btn btn-card-tool" data-widget="collapse"><i class="fa fa-plus"></i>\
                            </button>\
                        </div>\
                    </div>\
                    <div class="card-body">\
                        <div class="form-group has-feedback">\
                            <div class="checkbox icheck">\
                                <label>\
                                    <input type="checkbox" id="egeoffrey_debug"> Enable Debug\
                                </label>\
                            </div>\
                        </div>\
                        <div class="form-group has-feedback">\
                            <div class="checkbox icheck">\
                                <label>\
                                    <input type="checkbox" id="egeoffrey_logging_remote"> Enable Remote Logging\
                                </label>\
                            </div>\
                        </div>\
                        <div class="form-group has-feedback">\
                            <div class="checkbox icheck">\
                                <label>\
                                    <input type="checkbox" id="egeoffrey_remember_page" checked> Remember Last Opened Page\
                                </label>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <center>\
                    <p class="text-red" id="login_error"></p>\
                </center>\
                <div class="form-group has-feedback">\
                    <div class="checkbox icheck">\
                        <label>\
                            <input type="checkbox" id="egeoffrey_remember_me" checked> '+locale("login.remember_me")+'\
                        </label>\
                    </div>\
                </div>\
                <div class="form-group has-feedback">\
                    <button type="button" class="btn btn-primary btn-block btn-flat" id="login_button">'+locale("login.login_button")+'</button>\
                </div>\
            </form>\
        ')
        // submit form on enter keypress
        $('#login_form :input').keypress(function (e) {
          if (e.which == 13) {
            $("#login_button").trigger("click")
            return false;
          }
        });
        // set to true when the login button is pressed
        var login_submit = false
        // setup checkboxes
        $(":checkbox").iCheck({
            checkboxClass: 'icheckbox_square-blue',
            radioClass: 'iradio_square-blue',
            increaseArea: '20%'
        });
        // show disclaimer if needed
        if ("EGEOFFREY_LOGIN_DISCLAIMER" in window) {
            $("#login_disclaimer").html('\
                <div class="callout callout-info">\
                    <p>'+window.EGEOFFREY_LOGIN_DISCLAIMER+'</p>\
                </div>\
            ')
        }
        // configure login button
        $("#login_button").unbind().click(function(this_class) {
            return function() {
                // disable the login button
                $("#login_button").prop("disabled", true)
                $("#login_button").html(locale("login.connecting"))
                $("#login_error").html("")
				// pull out the user's data from the form and set the variables the Gui class needs to access
                window.EGEOFFREY_GATEWAY_HOSTNAME = $("#egeoffrey_gateway_hostname").val()
                window.EGEOFFREY_GATEWAY_PORT = $("#egeoffrey_gateway_port").val()
                window.EGEOFFREY_GATEWAY_SSL = $("#egeoffrey_gateway_ssl").is(":checked") ? 1 : 0
                window.EGEOFFREY_ID = $("#egeoffrey_id").val()
                window.EGEOFFREY_PASSCODE = $("#egeoffrey_passcode").val()
                window.EGEOFFREY_USERNAME = $("#egeoffrey_username").val()
                window.EGEOFFREY_PASSWORD = $("#egeoffrey_password").val()
                window.EGEOFFREY_REMEMBER_ME = $("#egeoffrey_remember_me").is(":checked") ? 1 : 0
                window.EGEOFFREY_DEBUG = $("#egeoffrey_debug").is(":checked") ? 1 : 0
                window.EGEOFFREY_LOGGING_REMOTE = $("#egeoffrey_logging_remote").is(":checked") ? 1 : 0
				window.EGEOFFREY_REMEMBER_PAGE = $("#egeoffrey_remember_page").is(":checked") ? 1 : 0
				// save user's connections
				this_class.connections.save()
				// reload the saved connection select
				this_class.load_saved_connections()
				// create a new instance of the gui and run it
                window.gui = new Gui("gui", EGEOFFREY_USERNAME + "_" + this_class.generate_session_id())
                this_class.restore_page()
                window.gui.run()
                login_submit = true
            };
        }(this));
        // configure language selector
        $('#language').val(window.language)
        $('#language').unbind().change(function(this_class) {
            return function () {
                var language = $('#language').val()
                set_language(language)
                localStorage.setItem("EGEOFFREY_LANGUAGE", language)
                this_class.draw()
            };
        }(this))
        // configure saved connection selector
		this.load_saved_connections()
        $('#saved_connections').unbind().change(function(this_class) {
            return function () {
				var connection_id = $('#saved_connections').val()
				if (connection_id == "__select__") return
				// get the selected connection and restore it
				this_class.connections.restore(connection_id)
            };
        }(this))
        // configure logout button
        $("#user_logout").unbind().click(function(this_class) {
            return function () {
                // clear last connection
                this_class.connections.save(true)
                // disconnect
                window.gui.logout()
            };
        }(this));
        // periodically check if the connection is established, otherwise show login page
        if (this.watchdog != null) clearInterval(this.watchdog)
        var this_class = this
        this.watchdog = setInterval(function() {
            $("#login_button").prop("disabled", false)
            $("#login_button").html(locale("login.login_button"))
            var login_screen = $('#login').is(':visible');
            // when the login screen is shown
            if (login_screen) {
                // check if connected and if so hide the login screen
                if (window.gui.connected) {
                    // connected
                    $("#login_error").html("")
                    $("#login").modal("hide")
                    login_submit = false
                } else {
                    if (login_submit) $("#login_error").html(locale("login.login_error"))
                    login_submit = false
                }
            }
            // already logged in, ensure we are still connected
            else {
                if (! window.gui.connected) {
                    // if the user intentionally logged out, just disconnect and show the login screen back again
                    if (! window.gui.logged_in) {
                        // not connected, stop the current instance of the gui from connecting
                        window.gui.join()
						// if the user has selected a different connection login immediately without showing the login screen
						if (window.EGEOFFREY_AUTOLOGON != null) {
							window.EGEOFFREY_AUTOLOGON = null
							$("#login_button").click()
						} 
						// show up the login screen
						else {
							$("#login").modal()
						}
                    // otherwise the user may have been disconnected (e.g. network change, timeout, app in background, etc.)
                    } else {
                        // check if the gui is in foreground (no need to connect and connect if it is not)
                        if (window.EGEOFFREY_IN_FOREGROUND == null || window.EGEOFFREY_IN_FOREGROUND == true) {
                            // create a new instance of the gui and run it
                            window.gui = new Gui("gui", EGEOFFREY_USERNAME + "_" + this_class.generate_session_id())
                            // retrieve and set previously opened page if any
                            this_class.restore_page()
                            window.gui.logged_in = true
                            window.gui.run()
                        }
                    }
                }
            }
        }, 3000);
    }
    
    // restore last opened page
    restore_page() {
		var last_page = this.connections.get_page()
		if (last_page == null) last_page = ""
        window.location.hash = '#'+last_page
    }    
    
    // generate a random session_id
    generate_session_id() {
        var min = 1;
        var max = 100000;
        return Math.floor(Math.random() * (+max - +min)) + +min;
    }
    
    // load the gui
    load() {
        // restore language setting
        if (localStorage.getItem("EGEOFFREY_LANGUAGE") != null) {
            set_language(localStorage.getItem("EGEOFFREY_LANGUAGE"))
            this.draw()
        }
        // restore saved connection 
		this.connections.restore()
        // create a gui and start it. This will automatically login if there is a valid session loaded
        window.gui = new Gui("gui", "guest_" + this.generate_session_id())
        this.restore_page()
        window.gui.run()
    }
}