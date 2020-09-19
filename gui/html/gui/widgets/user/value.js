// single value widget
class Value extends Widget {
    constructor(id, widget) {
        super(id, widget)
        this.timestamp = null
		this.timestamp_tag = "#"+this.id+"_timestamp"
        this.timestamp_timer = null
        // add an empty box into the given column
        var icon = "icon" in this.widget ? this.widget["icon"] : "question"
        var color = "color" in this.widget ? this.widget["color"] : "blue"
        var link = "link" in this.widget ? this.widget["link"] : null
        if ("variant" in this.widget && this.widget["variant"] == 2) this.add_small_box_2(this.id, this.widget["title"], icon, color, link)
        else this.add_small_box(this.id, this.widget["title"], icon, color)
    }
    
    // request the data to the database
    request_data() {
        var sensor_id = this.widget["sensor"]
        // ask for the latest value
        var message = new Message(gui)
        message.recipient = "controller/db"
        message.command = "GET"
        message.args = sensor_id
        gui.sessions.register(message, {
            "component": "value",
            "sensor_id": sensor_id,
            "widget": this.widget
        })
        this.send(message)
        var timestamp_sensor = sensor_id
        // if for the timestamp we need to ask a different sensor
        if ("timestamp_sensor" in this.widget) timestamp_sensor = this.widget["timestamp_sensor"]
        // ask for the timestamp of the latest value
        var message = new Message(gui)
        message.recipient = "controller/db"
        message.command = "GET_TIMESTAMP"
        message.args = timestamp_sensor
        gui.sessions.register(message, {
            "component": "timestamp",
            "sensor_id": sensor_id,
			"widget": this.widget
        })
        this.send(message)
        // ask for the icon (if the icon points to a sensor)
        if ("icon_sensor" in this.widget) {
            var message = new Message(gui)
            message.recipient = "controller/db"
            message.command = "GET"
            message.args = this.widget["icon_sensor"]
            gui.sessions.register(message, {
                "component": "icon",
                "sensor_id": this.widget["icon_sensor"]
            })            
            this.send(message)
        }
    }
    
    // update the elapsed time based on the stored timestamp
    update_timestamp() {
        if (this.timestamp == null) $(this.timestamp_tag).html("");
        else $(this.timestamp_tag).html(gui.date.timestamp_difference(gui.date.now(), this.timestamp))
    }
    
    // schedule to update the timestamp
    schedule_update_timestamp() {
        var this_class = this
        this.timestamp_timer = setTimeout(function() {
            this_class.update_timestamp()
        }, 10000);
        gui.timers.push(this.timestamp_timer)
    }
    
    // draw the widget's content
    draw() {
        // IDs Template: _color, _icon, _value, _value_suffix, _timestamp
        // IDs Widget: 
        // TODO: change column attributes to col-md-3 col-sm-6 col-xs-12
        // for button widgets, just add the button and configure the action(s)
        if (this.widget["widget"] == "button") {
            var tag = "#"+this.id+"_value"
            $(tag.replace("_value","_timestamp")).addClass("d-none")
            var html = '\
            <center><div class="input-group">\
                <button type="button" id="'+this.id+'_button" class="btn btn-primary btn-lg">'+this.widget["text"]+'</button>\
            </div></center>'
            $(tag).html(html)
            // listen for click
            $("#"+this.id+"_button").unbind().click(function(actions) {
                return function () {
                    // trigger actions
                    for (var action of actions) {
                        gui.notify("info", "Requesting to execute "+action)
                        var action_split = action.split(" ")
                        var command = action_split[0]
                        // set the sensor to a value or poll it
                        if (command == "SET" || command == "POLL") {
                            var sensor_id = action_split[1]
                            var message = new Message(gui)
                            message.recipient = "controller/hub"
                            message.command = command
                            message.args = sensor_id
                            if (command == "SET") message.set_data(action_split[2])
                            gui.send(message)
                        }
                        // run a rule
                        else if (command == "RUN") {
                            var rule_to_run = action_split[1]
                            var message = new Message(gui)
                            message.recipient = "controller/alerter"
                            message.command = command
                            message.args = rule_to_run
                            gui.send(message)
                        }
                    }
                };
            }(this.widget["actions"]));
        }
        // otherwise request the data for this sensor
        else {
            var sensor_id = this.widget["sensor"]
            this.add_configuration_listener("sensors/"+sensor_id, gui.supported_sensors_config_schema)
            if (this.widget["widget"] == "value" && "icon_sensor" in this.widget) this.add_configuration_listener("sensors/"+this.widget["icon_sensor"], gui.supported_sensors_config_schema)
            if ("timestamp_sensor" in this.widget) this.add_configuration_listener("sensors/"+this.widget["timestamp_sensor"], gui.supported_sensors_config_schema)
            this.request_data()
        }
        // subscribe for acknoledgments from the database for saved values
        this.add_inspection_listener("controller/db", "*/*", "SAVED", "#")
    }
    
    // close the widget
    close() {
        if (this.timestamp_timer != null) clearInterval(this.timestamp_timer)
    }
    
    // receive data and load it into the widget
    on_message(message) {
        // database just saved a value check if our sensor is involved and if so refresh the data
        if (message.sender == "controller/db" && message.command == "SAVED") {
            if (message.args == this.widget["sensor"]) this.request_data()
            if ("icon_sensor" in this.widget && message.args == this.widget["icon_sensor"]) this.request_data()
            if ("timestamp_sensor" in this.widget && message.args == this.widget["timestamp_sensor"]) this.request_data()
        }
        // database returned a requested value
        else if (message.sender == "controller/db" && message.command.startsWith("GET")) {
            var session = gui.sessions.restore(message)
            if (session == null) return
            var data = message.get("data")
            if (gui.configurations["sensors/"+session["sensor_id"]] == null) {
                gui.log_warning("configuration of sensor "+session["sensor_id"]+" not found")
                return
            }
            var sensor = gui.configurations["sensors/"+session["sensor_id"]].get_data()
            // add value
            if (session["component"] == "value") {
                var tag = "#"+this.id+"_value"
                if (session["widget"]["widget"] == "value") {
                    // add value and suffix
					if (data.length == 1) {
						var value = data[0]
                        // normalize the value if needed
                        if ("normalize" in session["widget"]) {
                            var split = session["widget"]["normalize"].split("-")
                            min = split[0]
                            max = split[1]
                            var range = max - min
                            var corrected_start_value = data[0] - min
                            var percentage = (corrected_start_value * 100) / range 
                            value = Math.round(percentage)
                        } 
                        // set the value to the widget
						var text_color = "black"
						for (var color of ["success", "warning", "danger"]) {
							if ("color_"+color in session["widget"]) {
								var min, max
								if (session["widget"]["color_"+color].includes("-")) {
                                    var match = session["widget"]["color_"+color].match(/^(-?[^-]+)-(-?[^-]+)$/)
									min = match[1]
									max = match[2]
								}
								else {
									min = max = session["widget"]["color_"+color]
								}
								if (jQuery.isNumeric(min) && jQuery.isNumeric(max) && jQuery.isNumeric(value)) {
                                    if (min < value == value <= max) text_color = color
								} else {
									if (value == min) text_color = color
								}
							}
						}
						$(tag).html('<span class="text-'+text_color+'">'+value+'</span>');
                        // set the unit
                        var unit = null
						if ("unit" in sensor) unit = sensor["unit"]
                        if ("normalize" in session["widget"]) unit = "%"
                        if (unit != null) $(tag+"_suffix").html('<span class="text-'+text_color+'">'+unit+'</span>');
					}
					else $(tag).html(data.length == 1 ? data[0] : "N/A");
                }
                // this is a status box, set the status
                else if (session["widget"]["widget"] == "status") {
                    tag = tag.replace("_value","")
                    if (data.length == 1) {
                        var target = "info-box-icon"
                        var icon_class = "info-box-icon"
                        var icon_on = "icon_on" in this.widget ? this.widget["icon_on"] : "plug"
                        var color_on = "color_on" in this.widget ? this.widget["color_on"] : "green"
                        var text_on = "text_on" in this.widget ? this.widget["text_on"] : "ON"
                        var icon_off = "icon_off" in this.widget ? this.widget["icon_off"] : "power-off"
                        var color_off = "color_off" in this.widget ? this.widget["color_off"] : "red"
                        var text_off = "text_off" in this.widget ? this.widget["text_off"] : "OFF"
                        if ("variant" in this.widget && this.widget["variant"] == 2) {
                            target = "small-box"
                            icon_class = "small-box"
                        }
                        if (data[0] == 0) {
                            $(tag+"_icon").removeClass().addClass("fa fa-"+icon_off)
                            if ($(tag+"_color").hasClass(target)) $(tag+"_color").removeClass().addClass(icon_class+" bg-"+color_off)
                            // TODO: localize
                            $(tag+"_value").html(text_off)
                        }
                        else if (data[0] == 1) {
                            $(tag+"_icon").removeClass().addClass("fa fa-"+icon_on)
                            if ($(tag+"_color").hasClass(target)) $(tag+"_color").removeClass().addClass(icon_class+" bg-"+color_on)
                            $(tag+"_value").html(text_on)
                        }
                    } else {
                        $(tag+"_value").html("N/A")
                    }
                }
                // this is a heartbeat box
				else if (session["widget"]["widget"] == "heartbeat") {
					$(tag.replace("_value","_timestamp")).addClass("d-none")
                    tag = tag.replace("_value","")
                    if (data.length == 1) {
                        var target = "info-box-icon"
                        var icon_class = "info-box-icon"
                        if ("variant" in this.widget && this.widget["variant"] == 2) {
                            target = "small-box"
                            icon_class = "small-box"
                        }
                        if (data[0] == 0) {
                            $(tag+"_icon").removeClass().addClass("fa fa-heartbeat text-gray")
                            if ($(tag+"_color").hasClass(target)) $(tag+"_color").removeClass().addClass(icon_class+" bg-white")
                        }
                        else if (data[0] == 1) {
                            $(tag+"_icon").removeClass().addClass("fa text-green fa-heartbeat")
                            if ($(tag+"_color").hasClass(target)) $(tag+"_color").removeClass().addClass(icon_class+" bg-white")
                        }
                    } else {
                        $(tag+"_value").html("N/A")
                    }
                }
                // this is a control box, configure the checkbox
                else if (session["widget"]["widget"] == "control") {
                    var id = tag.replace("#","")
                    var text_on = "text_on" in this.widget ? this.widget["text_on"] : "On"
                    var text_off = "text_off" in this.widget ? this.widget["text_off"] : "Off"
                    var icon_on = "icon_on" in this.widget ? this.widget["icon_on"] : null
                    var color_on = "color_on" in this.widget ? this.widget["color_on"] : null
                    var icon_off = "icon_off" in this.widget ? this.widget["icon_off"] : null
                    var color_off = "color_off" in this.widget ? this.widget["color_off"] : null
                    var target = "info-box-icon"
                    var icon_class = "info-box-icon"
                    if ("variant" in this.widget && this.widget["variant"] == 2) {
                        target = "small-box"
                        icon_class = "small-box"
                    }
                    var html = '\
                    <center>\
                        <div class="input-group">\
                            <input type="checkbox" id="'+id+'_toggle" data-on="'+text_on+'" data-off="'+text_off+'" data-width="100">\
                        </div>\
                    </center>'
                    $(tag).html(html)
                    $(tag+"_toggle").bootstrapToggle()
                    if (data.length == 1) {
                        var tag_icon = tag.replace("_value","")
                        if (data[0] == 0) {
                            if (icon_off != null) $(tag_icon+"_icon").removeClass().addClass("fa fa-"+icon_off)
                            if (color_off != null && $(tag_icon+"_color").hasClass(target)) $(tag_icon+"_color").removeClass().addClass(icon_class+" bg-"+color_off)
                        }
                        else if (data[0] == 1) {
                            if (icon_on != null) $(tag_icon+"_icon").removeClass().addClass("fa fa-"+icon_on)
                            if (color_on != null && $(tag_icon+"_color").hasClass(target)) $(tag_icon+"_color").removeClass().addClass(icon_class+" bg-"+color_on)
                        }
                        $(tag+"_toggle").prop("checked", data[0]).change()
                    }
                    else $(tag+"_toggle").prop("checked", false)
                    // listen for changes
                    var actions = "actions" in this.widget ? this.widget["actions"] : null
                    $(tag+"_toggle").unbind().change(function(tag, sensor_id, actions) {
                        return function () {
                            var value = $(tag).is(':checked') ? 1 : 0
                            gui.log_debug("Setting "+sensor_id+"="+value)
                            var message = new Message(gui)
                            message.recipient = "controller/hub"
                            message.command = "SET"
                            message.args = sensor_id
                            message.set("value", value)
                            gui.send(message)
                            // TODO: update timestamp
                            // TODO: trigger update of other elements where sensor_id is used
                            // trigger additional actions
                            if (actions != null) {
                                for (var action of actions) {
                                    var action_split = action.split(" ")
                                    var command = action_split[0]
                                    // set the sensor to a value or poll it
                                    if (command == "SET" || command == "POLL") {
                                        sensor_id = action_split[1]
                                        message = new Message(gui)
                                        message.recipient = "controller/hub"
                                        message.command = command
                                        message.args = sensor_id
                                        if (command == "SET") message.set_data(value)
                                        gui.send(message)
                                    }
                                    // run a rule
                                    else if (command == "RUN") {
                                        rule_to_run = action_split[1]
                                        message = Message(gui)
                                        message.recipient = "controller/alerter"
                                        message.command = command
                                        message.args = rule_to_run
                                        gui.send(message)
                                    }
                                }
                            }
                        };
                    }(tag+"_toggle", session["sensor_id"], actions));
                }
                // this is an input box, populate the input
                else if (session["widget"]["widget"] == "input") {
                    var id = tag.replace("#","")
                    $(tag.replace("_value","_timestamp")).addClass("d-none")
                    // allowed values are set, draw a select input
                    if ("allowed_values" in session["widget"]) {
                        var html = '\
                            <select id="'+id+'_input" class="form-control">\
                            </select>\
                        '
                        $(tag).html(html)
                        var options = session["widget"]["allowed_values"].split(",")
                        $('#'+id+'_input').find('option').remove()
                        $('#'+id+'_input').append($('<option>', { value: "", text: "" }));
                        for (var value of options) {
                            $('#'+id+'_input').append($('<option>', {
                                value: value,
                                text: value
                            }));
                        }
                        if (data.length == 1) $(tag+"_input").val(data[0])
                    }
                    // otherwise draw a standard text input
                    else {
                        var html = '\
                        <div class="input-group input-group">\
                            <input style="text-align:center;" id="'+id+'_input" class="form-control input" type="text" value="">\
                        </div>'
                        $(tag).html(html)
                        if (data.length == 1) $(tag+"_input").val(data[0])
                        // if a number, add +/- buttons
                        if ("format" in sensor && sensor["format"] != "string") {
                            var decimals = 0
                            var steps = 1
                            var min = -1000000000
                            var max = 1000000000
                            if (sensor["format"] == "float_1") {
                                decimals = 1
                                steps = 0.1
                            } 
                            else if (sensor["format"] == "float_2") {
                                decimals = 2
                                steps = 0.01
                            }
                            if ("allowed_range" in session["widget"]) {
                                var match = session["widget"]["allowed_range"].match(/^(-?[^-]+)-(-?[^-]+)$/)
                                min = match[1]
                                max = match[2]
                            }
                            $(tag+"_input").TouchSpin({
                                min: min,
                                max: max,
                                step: steps,
                                decimals: decimals,
                                boostat: 5,
                                maxboostedstep: 10,
                            });
                        }
                    }
                    // listen for changes
                    $(tag+"_input").unbind().change(function(tag, sensor_id) {
                        return function () {
                            var value = $(tag).val()
                            if (value == null || value == "") return
                            gui.log_debug("Setting "+sensor_id+"="+value)
                            var message = new Message(gui)
                            message.recipient = "controller/hub"
                            message.command = "SET"
                            message.args = sensor_id
                            message.set("value", value)
                            gui.send(message)
                        };
                    }(tag+"_input", session["sensor_id"]));
                }
                // this is a slider
                else if (session["widget"]["widget"] == "slider") {
                    var id = tag.replace("#","")
                    $(tag.replace("_value","_timestamp")).addClass("d-none")
                    // add the slider
                    $(tag).html('<input id="'+id+'_slider" type="text" name="" value="" />')
                    // configure it
                    var options = {
                        skin: "round",
                        grid: false,
                        onFinish: function (data) {
                            var value = data["from"]
                            if (session["widget"]["show_percentage"]) {
                                value = (value * (session["widget"]["max_value"] - session["widget"]["min_value"]) / 100) + session["widget"]["min_value"]
                            }
                            gui.log_debug("Setting "+session["sensor_id"]+"="+value)
                            var message = new Message(gui)
                            message.recipient = "controller/hub"
                            message.command = "SET"
                            message.args = session["sensor_id"]
                            message.set("value", value)
                            gui.send(message)
                        },
                    }
                    // set the value
                    if (data.length == 1) {
                        // normalize to percentage if needed
                        if (session["widget"]["show_percentage"]) {
                            options["min"] = 0
                            options["max"] = 100
                            options["postfix"] = "%"
                            var range = session["widget"]["max_value"] - session["widget"]["min_value"]
                            var corrected_start_value = data[0] - session["widget"]["min_value"]
                            var percentage = (corrected_start_value * 100) / range 
                            options["from"] = percentage
                            
                        } 
                        // just set the raw value
                        else {
                            if ("min_value" in session["widget"]) options["min"] = session["widget"]["min_value"]
                            if ("max_value" in session["widget"]) options["max"] = session["widget"]["max_value"]
                            if ("step" in session["widget"]) options["step"] = session["widget"]["step"]
                            if ("unit" in sensor) options["postfix"] = sensor["unit"]
                            options["from"] = data[0]
                        }
                    }
                    $("#"+id+"_slider").ionRangeSlider(options);
                }
            }
            // add timestamp
            else if (session["component"] == "timestamp") {
				this.timestamp = data.length != 1 ? null : data[0]
				if (session["widget"]["widget"] == "heartbeat") {
					var tag = "#"+this.id+"_value"
					this.timestamp_tag = "#"+this.id+"_value"
					$(tag).html(gui.date.timestamp_difference(gui.date.now(), this.timestamp))
				}
                // update the timestamp value
                this.update_timestamp()
                // periodically refresh the elapsed time
                if (this.timestamp_timer != null) clearInterval(this.timestamp_timer)
                this.schedule_update_timestamp()
            }
            // add icon
            else if (session["component"] == "icon") {
                if (data.length != 1) return
                $("#"+this.id+"_icon").removeClass()
                $("#"+this.id+"_icon").addClass("fas fa-"+data[0])
            }
        }
    }
    
    // receive configuration
    on_configuration(message) {
    }
}