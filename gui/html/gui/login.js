

// login screen and gui initialization
class Login {
    constructor() {
        this.watchdog = null
		this.connections = new Connections()
        // set to true when the login button is pressed
        this.login_in_progress = false
        this.login_in_progress_timestamp = 0
        this.login_in_progress_timeout = 3
        // set to true when we are waiting for the house configuration
        this.waiting_configuration_running = false
        this.waiting_configuration_timestamp = 0
        this.waiting_configuration_timeout = 5
        this.waiting_configuration_timeout = 5
        this.reconnect_timestamp = 0
        this.reconnect_timeout = 3
        this.database_reachable_timestamp = 0
        this.database_reachable_timeout = 4
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
				$("#saved_connections").append(new Option(connection["EGEOFFREY_ID"]+"/"+connection["EGEOFFREY_USERNAME"]+" ("+connection["EGEOFFREY_GATEWAY_HOSTNAME"]+":"+connection["EGEOFFREY_GATEWAY_PORT"]+")", connection_id));
			}
		}
	}
    
    // return a unix timestamp
    get_timestamp() {
        return Math.floor(Date.now() / 1000)
    }
    
    // set the login status message
    set_login_status(severity, message) {
        if (! $('#login').is(':visible')) return
        for (var value of ["info", "warning", "danger", "success"]) {
            if ($("#login_status").hasClass("callout-"+value)) $("#login_status").removeClass("callout-"+value)
        }            
        $("#login_status").removeClass("callout")
        if (severity != "") $("#login_status").addClass("callout callout-"+severity)
        $("#login_status").html(message)
    }
    
    // set to true/false when the login is in progress
    set_login_in_progress(in_progress) {
        this.login_in_progress = in_progress
        $("#login_button").prop("disabled", in_progress)
        if (in_progress) $("#login_button").html(locale("login.connecting"))
        else $("#login_button").html(locale("login.login_button"))
    }
    
    // log a message in console
    log(severity, message) {
        if (severity == "debug" && (window.EGEOFFREY_DEBUG == null || ! window.EGEOFFREY_DEBUG)) return
        console.log(format_log_line(severity, "gui/login", message))
    }
    
    // function to run when waiting for the house configuration
    waiting_configuration() {
        setTimeout(function(this_class) {
            return function() {
                // configuration received, the module is configured, check if database is reachable
                if (window.gui.configured) {
                    this_class.set_login_status("info", '<i class="fas fa-spin fa-spinner"></i> Checking backend connection...')
                    this_class.log("debug", "Checking backend connection...")
                    this_class.database_reachable_timestamp = this_class.get_timestamp()
                    this_class.database_reachable()
                } 
                // no configuration received yet
                else {
                    // wait for the timeout to expire
                    if (this_class.get_timestamp() - this_class.waiting_configuration_timestamp < this_class.waiting_configuration_timeout) {
                        this_class.waiting_configuration()
                        return
                    }
                    this_class.set_login_status("warning", "Unable to find the house configuration")
                    this_class.log("warning", "Unable to find the house configuration")
                    window.gui.join()
                }
            };
        }(this), 500);
    }
    
     // function to run for ensuring the database is reachable by the web interface
    database_reachable() {
        setTimeout(function(this_class) {
            return function() {
                // configuration received, the module is configured, login successful
                if (window.gui.database_reachable) {
                    $("#login").modal("hide")
                    this_class.set_login_status("", "")
                } 
                // no configuration received yet
                else {
                    // wait for the timeout to expire
                    if (this_class.get_timestamp() - this_class.database_reachable_timestamp < this_class.database_reachable_timeout) {
                        this_class.database_reachable()
                        return
                    }
                    this_class.set_login_status("warning", "Unable to reach the backend")
                    this_class.log("warning", "Unable to reach the backend")
                    window.gui.join()
                }
                this_class.waiting_configuration_running = false
                this_class.set_login_in_progress(false)
            };
        }(this), 500);
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
                        <div class="text-right"><a onClick=\'$("#login_gateway_help\").toggleClass(\"d-none\")\'><i class="fas fa-question-circle text-info fa-1x"></i></a></div>\
                        <div id="login_gateway_help" class="callout callout-info d-none">\
                            <p>The eGeoffrey Gateway is the main door for accessing eGeoffrey. All eGeoffrey components connects and interact via the gateway, ragardless where they are running:</p>\
                            <ul>\
                                <li>If eGeoffrey is installed in your local network, the hostname is the host or IP address where eGeoffrey is running and by default port is 443 and SSL is disabled;</li>\
                                <li>If connecting to <a class="text-primary" href="https://docs.egeoffrey.com/configure/remote/" target="_new">eGeoffrey Cloud Gateway</a>, the hostname is <code>gateway.egeoffrey.com</code>, port is 443 and SSL is enabled;</li>\
                            </ul>\
                        </div>\
                        <div class="form-group has-feedback">\
                            <input type="input" class="form-control" placeholder="'+locale("login.gateway.hostname")+'" id="egeoffrey_gateway_hostname">\
                        </div>\
                        <div class="form-group has-feedback">\
                            <input type="input" class="form-control" placeholder="'+locale("login.gateway.port")+'" id="egeoffrey_gateway_port">\
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
                        <div class="text-right"><a onClick=\'$("#login_house_help\").toggleClass(\"d-none\")\'><i class="fas fa-question-circle text-info fa-1x"></i></a></div>\
                        <div id="login_house_help" class="callout callout-info d-none">\
                            <p>An eGeoffrey instance can take care of multiple houses hence you want to specify which one you want to enter. House ID and passcode are eventually used as username and password for authenticating against the gateway:</p>\
                            <ul>\
                                <li>If eGeoffrey is installed in your local network, by default the House ID is <code>house</code> without any passcode;</li>\
                                <li>If connecting to <a class="text-primary" href="https://docs.egeoffrey.com/configure/remote/" target="_new">eGeoffrey Cloud Gateway</a>, the House ID is the e-mail address you used for registering your account and the passcode is your password;</li>\
                            </ul>\
                        </div>\
                        <div class="form-group has-feedback">\
                            <input type="input" class="form-control" placeholder="'+locale("login.house.id")+'" id="egeoffrey_id">\
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
                        <div class="text-right"><a onClick=\'$("#login_user_help\").toggleClass(\"d-none\")\'><i class="fas fa-question-circle text-info fa-1x"></i></a></div>\
                        <div id="login_user_help" class="callout callout-info d-none">\
                            <p>To each house can belong one or multiple users. By default you will be automatically logged in as guest user. The following two users are pre-configured:</p>\
                            <ul>\
                                <li><code>guest / &lt;no password&gt;</code></li>\
                                <li><code>admin / admin</code></li>\
                            </ul>\
                        </div>\
                        <div class="form-group has-feedback">\
                            <input type="input" class="form-control" placeholder="'+locale("login.user.username")+'" id="egeoffrey_username">\
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
                <div class="form-group has-feedback">\
                    <div class="checkbox icheck">\
                        <label>\
                            <input type="checkbox" id="egeoffrey_remember_me" checked> '+locale("login.remember_me")+'\
                        </label>\
                    </div>\
                </div>\
                <div id="login_status" class="text-center">&nbsp;</div>\
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
                // just return if no gateway is provided
                if (window.EGEOFFREY_GATEWAY_HOSTNAME == "") return
                this_class.set_login_status("info", '<i class="fas fa-spin fa-spinner"></i> Connecting to the eGeoffrey gateway...')
                this_class.log("debug", "Connecting to the eGeoffrey gateway...")
				// save user's connections
				this_class.connections.save()
				// redraw the saved connection select
				this_class.load_saved_connections()
				// create a new instance of the gui and run it
                window.gui = new Gui("gui", EGEOFFREY_USERNAME + "_" + this_class.generate_session_id())
                this_class.restore_page()
                window.gui.run()
                this_class.login_in_progress_timestamp = this_class.get_timestamp()
                this_class.set_login_in_progress(true)
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
        // configure reconnect abort button
        $("#reconnect_close").html("Cancel")
        $("#reconnect_close").unbind().click(function(this_class) {
            return function () {
                // setop the gui from reconnecting
                window.gui.join()
                // hide the reconnect popup
                $("#reconnect").modal("hide")
                // show the reconnect screen
                $("#login").modal()
            };
        }(this));
        // periodically check if the connection is established, otherwise show login page
        if (this.watchdog != null) clearInterval(this.watchdog)
        var this_class = this
        this.watchdog = setInterval(function(this_class) {
            return function() {
                // if connected and waiting for the configuration, just leave
                if (this_class.waiting_configuration_running) return
                // if the login screen is visible
                if ($('#login').is(':visible')) {
                    // login screen is visible and gui connected, time to hide the login screen
                    if (window.gui.connected) {
                        this_class.set_login_status("info", '<i class="fas fa-spin fa-spinner"></i> Connected. Looking for house configuration...')
                        this_class.log("debug", "Connected. Looking for house configuration...")
                        // wait for a the house configuration
                        this_class.waiting_configuration_running = true
                        this_class.waiting_configuration_timestamp = this_class.get_timestamp()
                        this_class.waiting_configuration()
                    } else {
                        // wait for a timeout before showing the unable to connect error message
                        if (this_class.get_timestamp() - this_class.login_in_progress_timestamp > this_class.login_in_progress_timeout) {
                            // login still visible but not connected, show error message
                            if (this_class.login_in_progress) {
                                this_class.set_login_status("danger", 'Unable to connect or invalid credentials')
                                this_class.log("error", "Unable to connect or invalid credentials")
                            }
                            this_class.set_login_in_progress(false)
                        }
                    }
                }
                // login not visible, we should be already logged in, ensure we are still connected
                else {
                    if (! window.gui.connected) {
                        // if the user intentionally logged out, just disconnect and show the login screen back again
                        if (! window.gui.logged_in) {
                            // not connected, stop the current instance of the gui from connecting
                            window.gui.join()
                            // if the user has selected a different connection, login immediately without showing the login screen
                            if (window.EGEOFFREY_AUTOLOGON != null) {
                                window.EGEOFFREY_AUTOLOGON = null
                                $("#login_button").click()
                            } 
                            // show up the login screen
                            else {
                                $("#login").modal()
                            }
                        // otherwise the user may have been disconnected (e.g. network change, timeout, mobile app in background, etc.), try to reconnect
                        } else {
                            // check if not running on mobile app or the mobile app is in foreground (no need to connect and reconnect if it is not)
                            if (window.EGEOFFREY_IN_FOREGROUND == null || window.EGEOFFREY_IN_FOREGROUND == true) {
                                $("#reconnect_body").html('<i class="fas fa-spin fa-spinner"></i> Reconnecting...')
                                $("#reconnect").modal()
                                if (this_class.get_timestamp() - this_class.reconnect_timestamp > this_class.reconnect_timeout) {
                                    // create a new instance of the gui and run it
                                    window.gui = new Gui("gui", EGEOFFREY_USERNAME + "_" + this_class.generate_session_id())
                                    // retrieve and set previously opened page if any
                                    this_class.restore_page()
                                    window.gui.logged_in = true
                                    this_class.reconnect_timestamp = this_class.get_timestamp()
                                    window.gui.run()
                                }
                            }
                        }
                    } else {
                        // we are connected but the login screen is not showing, ensure we are also fully configured
                        if (! window.gui.configured || ! window.gui.database_reachable) {
                            window.gui.join()
                            this_class.set_login_status("warning", "House not found or database unreachable")
                            this_class.log("warning", "House not found or database unreachable")
                            this_class.set_login_in_progress(false)
                            $("#reconnect").modal("hide")
                            $("#login").modal()
                        } else {
                            // connected and configured
                            $("#reconnect").modal("hide")
                            this_class.set_login_in_progress(false)
                        }
                    }
                }
            };
        }(this), 1000);
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
		var connection_id = this.connections.restore()
        // no saved connections found, load default credentials (set in env.js and env_custom.js)
        if (connection_id == null) {
            var connection = {
                "EGEOFFREY_GATEWAY_HOSTNAME": window.EGEOFFREY_GATEWAY_HOSTNAME,
                "EGEOFFREY_GATEWAY_PORT": window.EGEOFFREY_GATEWAY_PORT,
                "EGEOFFREY_GATEWAY_SSL": window.EGEOFFREY_GATEWAY_SSL,
                "EGEOFFREY_ID": window.EGEOFFREY_ID,
                "EGEOFFREY_PASSCODE": window.EGEOFFREY_PASSCODE,
                "EGEOFFREY_USERNAME": window.EGEOFFREY_USERNAME,
                "EGEOFFREY_PASSWORD": window.EGEOFFREY_PASSWORD,
                "EGEOFFREY_REMEMBER_PAGE": window.EGEOFFREY_REMEMBER_PAGE
            }
            this.connections.load_settings(connection)
        }
        // create a stub instance of the gui (will be used by the watchdog if a new one will not be created)
        window.gui = new Gui("gui", "guest_" + this.generate_session_id())
        // click login button
        $("#login_button").click()
     }
}