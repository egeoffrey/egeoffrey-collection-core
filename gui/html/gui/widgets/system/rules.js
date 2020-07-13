// rules widget
class Rules extends Widget {
    constructor(id, widget) {
        super(id, widget)
        this.rules = {}
        this.listener = null
        // add an empty box into the given column
        this.add_large_box(this.id, this.widget["title"])
    }
    
    // draw the widget's content
    draw() {
        // IDs Template: _box, _title, _refresh, _popup, _body, _loading
        // IDs Widget: _table
        // if refresh requested, we need to unsubscribe from the topics to receive them again
        if (this.listener != null) {
            this.remove_listener(this.listener)
            this.rules = {}
        }
        var body = "#"+this.id+"_body"
        $(body).html("")
        // add new rule button
        var button_html = '\
            <div class="form-group">\
                <button type="button" id="'+this.id+'_new" class="btn btn-block btn-primary btn-lg"><i class="fas fa-plus"></i> Add a new rule</button>\
            </div>'
        $(body).append(button_html)
        $("#"+this.id+"_new").unbind().click(function() {
            return function () {
                window.location.hash = '#__rule_wizard'
            };
        }());
        // add table
        // 0: rule_id (hidden)
        // 1: rule
        // 2: severity
        // 3: type (hidden)
		// 4: triggers
        // 5: definitions
        // 6: conditions
        // 7: actions
        // 8: disabled (hidden)
        var table = '\
            <table id="'+this.id+'_table" class="table table-bordered table-striped">\
                <thead>\
                    <tr><th>_rule_id_</th><th class="all">Rule</th><th>Severity</th><th>Type</th><th>Triggers</th><th>Definitions</th><th>Conditions</th><th>Additional Actions</th><th>Disabled</th></tr>\
                </thead>\
                <tbody></tbody>\
            </table>'
        $(body).append(table)
        // define datatables options
        var options = {
            "responsive": true,
            "dom": "Zlfrtip",
            "fixedColumns": false,
            "paging": false,
            "lengthChange": false,
            "searching": true,
            "ordering": true,
            "info": true,
            "autoWidth": false,
            "columnDefs": [ 
                {
                    "targets" : [0, 3, 8],
                    "visible": false,
                },
                {
                    "targets" : [8],
                    "width": 110,
                },
                {
                    "className": "dt-center", 
                    "targets": [2]
                }
            ],
            "language": {
                "emptyTable": '<span id="'+this.id+'_table_text"></span>'
            }
        };
        // create the table
        if (! $.fn.dataTable.isDataTable("#"+this.id+"_table")) {
            $("#"+this.id+"_table").DataTable(options);
        } else {
            var table = $("#"+this.id+"_table").DataTable()
            table.clear()
        }
        $("#"+this.id+"_table_text").html('<i class="fas fa-spinner fa-spin"></i> Loading')
        // discover registered rules
        this.listener = this.add_configuration_listener("rules/#", gui.supported_rules_config_schema)
    }
    
    // receive data and load it into the widget
    on_message(message) {
    }
    
    // if the item is disabled, gray out the text
    disabled_item(item, disabled) {
        if (! disabled) return item
        if (typeof item === 'object' && item.constructor === Array) {
            for (var i = 0; i < item.length; i++) item[i] = '<p class="text-muted">'+item[i]+'</p>'
            return item
        }
        else return '<p class="text-muted">'+item+'</p>'
    }
    
    // format an object for displaying
    format_object(object) {
        return "- "+JSON.stringify(object).replaceAll("{","").replaceAll("}","").replaceAll("\"","").replaceAll(":",": ").replaceAll(",","<br>- ")
    }
    
    // receive configuration
    on_configuration(message) {
        var rule_id = message.args.replace("rules/","")
        // skip rules already received
        if (rule_id in this.rules) return
        var rule = message.get_data()
        var rule_tag = rule_id.replaceAll("/","_")
        this.rules[rule_id] = rule
        // add a line to the table
        var table = $("#"+this.id+"_table").DataTable()
        var disabled = "disabled" in rule && rule["disabled"]
        var icon = ""
        if (rule["type"] == "recurrent") icon = "calendar-alt"
        else if (rule["type"] == "on_demand") icon = "sliders-h"
        else if (rule["type"] == "realtime") icon = "magic"
        var description = '\
            <div>\
                '+this.disabled_item(format_multiline('<i class="fas fa-'+icon+'"></i> '+rule["text"], 50), disabled)+'<br>\
                <i>'+this.disabled_item("["+rule_id+"]", disabled)+'</i>\
            </div>\
            <div class="form-group" id="'+this.id+'_actions_'+rule_tag+'">\
                <div class="btn-group">\
                    <button type="button" class="btn btn-sm btn-info">Actions</button>\
                    <button type="button" class="btn btn-sm btn-info dropdown-toggle" data-toggle="dropdown">\
                        <span class="caret"></span>\
                        <span class="sr-only">Toggle Dropdown</span>\
                    </button>\
                    <div class="dropdown-menu" role="menu">\
                        <a class="dropdown-item" id="'+this.id+'_run_'+rule_tag+'" style="cursor: pointer"><i class="fas fa-play"></i> Run Rule</a>\
                        <a class="dropdown-item" id="'+this.id+'_edit_'+rule_tag+'" style="cursor: pointer"><i class="fas fa-edit"></i> Edit Rule</a>\
                        <div class="dropdown-divider"></div>\
                        <a class="dropdown-item" id="'+this.id+'_delete_'+rule_tag+'" style="cursor: pointer"><i class="fas fa-trash"></i> Delete Rule</a>\
                    </div>\
                </div>\
            </div>\
        '
        var severity = rule["severity"]
        if (severity == "info") severity = '<i class="fas fa-info text-blue"></i>'
        else if (severity == "warning") severity = '<i class="fas fa-exclamation-triangle text-yellow"></i>'
        else if (severity == "alert") severity = '<i class="fas fa-ban text-red"></i>'
        else if (severity == "none") severity = '<i class="fas fa-sticky-note text-gray"></i>'
        else if (severity == "debug") severity = '<i class="fas fa-bug text-gray"></i>'
        var conditions = ""
        if ("conditions" in rule) {
            for (var i = 0; i < rule["conditions"].length; i++) {
                var or_condition = rule["conditions"][i]
                for (var and_condition of or_condition) {
                    conditions = conditions+and_condition+"<br>"
                }
                if (i != rule["conditions"].length-1) conditions = conditions+"OR<br>"
            }
        }
        var actions = ""
        if ("actions" in rule) {
            for (var action of rule["actions"]) actions = actions+action+"<br>"
        }
		var triggers = ""
		if (rule["type"] == "realtime" && "triggers" in rule) {
			triggers = "<u>Sensor:</u><br>"
			for (var trigger of rule["triggers"]) triggers = triggers+trigger+"<br>"
		}
		if (rule["type"] == "recurrent" && "schedule" in rule) {
			if (rule["schedule"]["trigger"] == "cron") {
				triggers = "<u>Cron:</u><br>"
				if ("day" in rule["schedule"]) triggers = triggers+rule["schedule"]["day"]+" day<br>"
				if ("hour" in rule["schedule"]) triggers = triggers+rule["schedule"]["hour"]+" hour<br>"
				if ("minute" in rule["schedule"]) triggers = triggers+rule["schedule"]["minute"]+" minute<br>"
				if ("second" in rule["schedule"]) triggers = triggers+rule["schedule"]["hour"]+" second<br>"
			}
			if (rule["schedule"]["trigger"] == "interval") {
				triggers = "<u>Interval:</u><br>"
				if ("days" in rule["schedule"]) triggers = triggers+rule["schedule"]["days"]+" days<br>"
				if ("hours" in rule["schedule"]) triggers = triggers+rule["schedule"]["hours"]+" hours<br>"
				if ("minutes" in rule["schedule"]) triggers = triggers+rule["schedule"]["minutes"]+" minutes<br>"
				if ("seconds" in rule["schedule"]) triggers = triggers+rule["schedule"]["hours"]+" seconds<br>"
			}
		}
        var definitions = ""
        if ("macros" in rule) {
            definitions = definitions+"<u>%i%</u>:<br>"
            for (var i of rule["macros"]) definitions = definitions+i+"<br>"
        }
        if ("variables" in rule) {
            if ("macros" in rule) definitions = definitions+"<br>"
            definitions = definitions+"<u>Variables</u>:<br>"
            for (var variable in rule["variables"]) definitions = definitions+variable+": <i>"+rule["variables"][variable]+"</i><br>"
        }
        if ("constants" in rule) {
            if ("macros" in rule || "variables" in rule) definitions = definitions+"<br>"
            definitions = definitions+"<u>Constants</u>:<br>"
            for (var constant in rule["constants"]) definitions = definitions+constant+": <i>"+rule["constants"][constant]+"</i><br>"
        }
        var run_html = '<button type="button" id="'+this.id+'_run_'+rule_tag+'" class="btn btn-default"><i class="fas fa-play"></i></button>'
        var edit_html = '<button type="button" id="'+this.id+'_edit_'+rule_tag+'" class="btn btn-default"><i class="fas fa-edit"></i></button>'
        var delete_html = '<button type="button" id="'+this.id+'_delete_'+rule_tag+'" class="btn btn-default" ><i class="fas fa-trash"></i></button>'
        // add the row
        table.row.add([
            rule_id, 
            description, 
            severity,
            rule["type"], 
			this.disabled_item(triggers, disabled),
            this.disabled_item(definitions, disabled), 
            this.disabled_item(conditions, disabled), 
            format_multiline(this.disabled_item(actions, disabled), 30), 
            disabled,
        ]).draw(false);
        table.responsive.recalc()
        if (table.data().count() == 0) $("#"+this.id+"_table_text").html('No data to display')
        // run the selected rule
        $("#"+this.id+"_run_"+rule_tag).unbind().click(function(rule_id) {
            return function () {
                var message = new Message(gui)
                message.recipient = "controller/alerter"
                message.command = "RUN"
                message.args = rule_id
                gui.send(message)
                gui.notify("info", "Requesting to run the rule "+rule_id)
            };
        }(rule_id));
        // edit the selected rule
        $("#"+this.id+"_edit_"+rule_tag).unbind().click(function(rule_id) {
            return function () {
                window.location.hash = '#__rule_wizard='+rule_id;
            };
        }(rule_id));
        // delete the rule
        $("#"+this.id+"_delete_"+rule_tag).unbind().click(function(rule_id, version) {
            return function () {
                gui.confirm("Do you really want to delete rule "+rule_id+"?", function(result){ 
                    if (! result) return
                    // delete the rule configuration file
                    var message = new Message(gui)
                    message.recipient = "controller/config"
                    message.command = "DELETE"
                    message.args = "rules/"+rule_id
                    message.config_schema = version
                    gui.send(message)
                    gui.notify("info", "Requesting to delete rule "+rule_id)
                });
            };
        }(rule_id, message.config_schema));
        // disable run if rule is disabled
        if (disabled) $("#"+this.id+"_run_"+rule_tag).remove();
    }
}