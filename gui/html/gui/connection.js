
// handle saved connections
class Connections {
    constructor() {
		// local storage key to use
        this.key_connections = "EGEOFFREY_CONNECTIONS"
		// config schema
        this.config_schema = 1
    }

	// return saved connections
	get() {
		// get the configuration from the browser's local storage
		var connections = localStorage.getItem(this.key_connections)
		if (connections == null) return
		connections = JSON.parse(connections)
		// ensure the config schema is supported
		if (connections["config_schema"] != this.config_schema) return
		return connections
	}

	// restore the connection to a given one or to the last saved connection
	restore(requested_connection_id=null) {
		var connections = this.get()
		if (connections == null) return
		var connection_id = null
		// if requested to restore a specific connection
		if (requested_connection_id != null) connection_id = requested_connection_id
		// otherwise restore the last connection if any
		else if (connections["last_connection"] != null) connection_id = connections["last_connection"]
		// restore the connection
		if (connection_id != null) {
			if (! (connection_id in connections["connections"])) return
			var connection = connections["connections"][connection_id]
			// restore connection settings
            this.load_settings(connection)
            return connection_id
		}
	}
    
    // just load into the login form a raw connection data structure
    load_settings(connection) {
        if (connection["EGEOFFREY_GATEWAY_HOSTNAME"] != null) {
            window.EGEOFFREY_GATEWAY_HOSTNAME = connection["EGEOFFREY_GATEWAY_HOSTNAME"]
            $("#egeoffrey_gateway_hostname").val(connection["EGEOFFREY_GATEWAY_HOSTNAME"])
        }
        if (connection["EGEOFFREY_GATEWAY_PORT"] != null) {
            window.EGEOFFREY_GATEWAY_PORT = connection["EGEOFFREY_GATEWAY_PORT"]
            $("#egeoffrey_gateway_port").val(connection["EGEOFFREY_GATEWAY_PORT"])
        }
        if (connection["EGEOFFREY_GATEWAY_SSL"] != null) {
            window.EGEOFFREY_GATEWAY_SSL = parseInt(connection["EGEOFFREY_GATEWAY_SSL"])
            if (connection["EGEOFFREY_GATEWAY_SSL"]) $("#egeoffrey_gateway_ssl").iCheck('check')
            else $("#egeoffrey_gateway_ssl").iCheck('uncheck')
        }
        if (connection["EGEOFFREY_ID"] != null) {
            window.EGEOFFREY_ID = connection["EGEOFFREY_ID"]
            $("#egeoffrey_id").val(connection["EGEOFFREY_ID"])
        }
        if (connection["EGEOFFREY_PASSCODE"] != null) {
            window.EGEOFFREY_PASSCODE = connection["EGEOFFREY_PASSCODE"]
            $("#egeoffrey_passcode").val(connection["EGEOFFREY_PASSCODE"])
        }
        if (connection["EGEOFFREY_USERNAME"] != null) {
            window.EGEOFFREY_USERNAME = connection["EGEOFFREY_USERNAME"]
            $("#egeoffrey_username").val(connection["EGEOFFREY_USERNAME"])
        }
        if (connection["EGEOFFREY_PASSWORD"] != null) {
            window.EGEOFFREY_PASSWORD = connection["EGEOFFREY_PASSWORD"]
            $("#egeoffrey_password").val(connection["EGEOFFREY_PASSWORD"])
        }
        if (connection["EGEOFFREY_REMEMBER_PAGE"] != null) {
            window.EGEOFFREY_REMEMBER_PAGE = parseInt(connection["EGEOFFREY_REMEMBER_PAGE"])
            if (connection["EGEOFFREY_REMEMBER_PAGE"]) $("#egeoffrey_remember_page").iCheck('check')
            else $("#egeoffrey_remember_page").iCheck('uncheck')
        }
    }

	// save currently configured connections in the browser local storage
	save(reset_last_connection=false) {
		var connections = this.get()
		// if there are no saved connections, create the data structure
		if (connections == null) {
			connections = {
				"config_schema": this.config_schema,
				"last_connection": null,
				"connections": {}
			}
		}
		// reset last_connection but keep all the existing sessions
		if (reset_last_connection) {
			connections["last_connection"] = null
		}
		// remember this connection
		else {
			var connection_id = window.EGEOFFREY_GATEWAY_HOSTNAME+"_"+window.EGEOFFREY_GATEWAY_PORT+"_"+window.EGEOFFREY_ID+"_"+window.EGEOFFREY_USERNAME
			// save current connection information
			if (window.EGEOFFREY_REMEMBER_ME == 1) {
				var connection = {
					"EGEOFFREY_GATEWAY_HOSTNAME": window.EGEOFFREY_GATEWAY_HOSTNAME,
					"EGEOFFREY_GATEWAY_PORT": window.EGEOFFREY_GATEWAY_PORT,
					"EGEOFFREY_GATEWAY_SSL": window.EGEOFFREY_GATEWAY_SSL,
					"EGEOFFREY_ID": window.EGEOFFREY_ID,
					"EGEOFFREY_PASSCODE": window.EGEOFFREY_PASSCODE,
					"EGEOFFREY_USERNAME": window.EGEOFFREY_USERNAME,
					"EGEOFFREY_PASSWORD": window.EGEOFFREY_PASSWORD,
					"EGEOFFREY_REMEMBER_PAGE": window.EGEOFFREY_REMEMBER_PAGE,
				}
				// avoid overwriting the current page
				if (connection_id in connections["connections"]) {
					var old_connection = connections["connections"][connection_id]
					if ("EGEOFFREY_CURRENT_PAGE" in old_connection) connection["EGEOFFREY_CURRENT_PAGE"] = old_connection["EGEOFFREY_CURRENT_PAGE"]
				}
				// add the connection information to the sesssions (or overwrite existing one)
				connections["connections"][connection_id] = connection
				// keep track of the last connection
				connections["last_connection"] = connection_id
			} 
			// remove this connection from the saved connections
			else {
				if (connection_id in connections["connections"]) delete connections["connections"][connection_id]
			}
		}
		// save connection information into the browser storage
		localStorage.setItem(this.key_connections, JSON.stringify(connections))
	}
	
	// save last visited page to the current connection
	set_page(page_id) {
		var connections = this.get()
		if (connections == null) return
		var connection_id = connections["last_connection"]
		if (connection_id == null) return
		if (! (connection_id in connections["connections"])) return
		connections["connections"][connection_id]["EGEOFFREY_CURRENT_PAGE"] = page_id
		// save connection information into the browser storage
		localStorage.setItem(this.key_connections, JSON.stringify(connections))	
	}
	
	// get last visited page for the current connection
	get_page() {
		var connections = this.get()
		if (connections == null) return
		var connection_id = connections["last_connection"]
		if (connection_id == null) return
		if (! (connection_id in connections["connections"])) return
		var connection = connections["connections"][connection_id]
		if (! ("EGEOFFREY_CURRENT_PAGE" in connection)) return
		return connection["EGEOFFREY_CURRENT_PAGE"]
	}
}