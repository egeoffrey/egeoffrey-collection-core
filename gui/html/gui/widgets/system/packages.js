// Packages widget
class Packages extends Widget {
    constructor(id, widget) {
        super(id, widget)
        this.listener = null
        this.manifests = {}
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
            this.manifests = {}
        }
        var body = "#"+this.id+"_body"
        $(body).html("")
        // add table
        // 0: package
        // 1: description
        // 2: modules
        // 3: version
        // 4: sdk
        // 5: up to date
        var table = '\
            <table id="'+this.id+'_table" class="table table-bordered table-striped">\
                <thead>\
                    <tr><th data-priority="1">Package</th><th>Description</th><th>Modules</th><th>Version</th><th>SDK</th><th>Up to Date</th></tr>\
                </thead>\
                <tbody></tbody>\
            </table>'
        $(body).html(table)
        
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
            "autoWidth": true,
            "columnDefs": [ 
                {
                    "className": "dt-center",
                    "targets": [3, 4, 5]
                }
            ],
            "language": {
                "emptyTable": '<span id="'+this.id+'_table_text"></span>'
            }
        };
        // create the table
        $("#"+this.id+"_table").DataTable(options);
        $("#"+this.id+"_table_text").html('<i class="fas fa-spinner fa-spin"></i> Loading')
        // ask for manifest files
        this.listener = this.add_broadcast_listener("+/+", "MANIFEST", "#")
    }
    
    // receive data and load it into the widget
    on_message(message) {
        if (message.command == "MANIFEST") {
            var table = $("#"+this.id+"_table").DataTable()
            var manifest = message.get_data()
            if (manifest["package"] in this.manifests) return
            if (manifest["manifest_schema"] != gui.supported_manifest_schema) return
            // add a new row for this package
            var icon = "icon" in manifest ? manifest["icon"] : "cube"
            var manifest_tag = manifest["package"].replaceAll("/", "_").replaceAll("-", "_")
            var package_name = '\
                <div>\
                    <i class="fas fa-'+icon+'"></i> '+manifest["package"]+'\
                </div>\
                <div class="form-group" id="'+this.id+'_actions_'+manifest_tag+'">\
                    <div class="btn-group">\
                        <button type="button" class="btn btn-sm btn-info">Actions</button>\
                        <button type="button" class="btn btn-sm btn-info dropdown-toggle" data-toggle="dropdown">\
                            <span class="caret"></span>\
                            <span class="sr-only">Toggle Dropdown</span>\
                        </button>\
                        <div class="dropdown-menu" role="menu">\
                            <a class="dropdown-item" id="'+this.id+'_manifest_'+manifest_tag+'" style="cursor: pointer"><i class="fas fa-newspaper"></i> View Manifest</a>\
                            <a class="dropdown-item" id="'+this.id+'_delete_examples_'+manifest_tag+'" style="cursor: pointer"><i class="fas fa-trash"></i> Delete Examples</a>\
                        </div>\
                    </div>\
                </div>\
            '
            var description =  format_multiline(manifest["description"], 50)
            var update_id = this.id+'_'+manifest["package"]+'_update'
            var modules = ""
            for (var module_object of manifest["modules"]) {
                for (var module in module_object) modules = modules+module+"<br>"
            }
            var version = manifest["version"].toFixed(1)+"-"+manifest["revision"]+" ("+manifest["branch"]+")"
            var sdk = manifest["sdk"]["version"].toFixed(1)+"-"+manifest["sdk"]["revision"]+" ("+manifest["sdk"]["branch"]+")"
            var up_to_date = '<span id="'+update_id+'"><i class="fas fa-spinner fa-spin"></i></span>'
            var row = table.row.add([
                package_name, 
                description, 
                modules, 
                version, 
                sdk, 
                up_to_date
            ]).draw(false);
            table.responsive.recalc()
            // show the manifest
            $("#"+this.id+'_manifest_'+manifest_tag).unbind().click(function(this_class, manifest) {
                return function () {
                    // clear the modal and load it
                    $("#wizard_body").html("")
                    $("#wizard_title").html(manifest["package"]+" manifest")
                    $("#wizard_body").append('\
                        <div class="form-group text-left">\
                            <textarea rows=15 class="form-control" id="manifest_textarea">'+jsyaml.dump(manifest)+'</textarea>\
                            </div>\
                    ')
                    // CodeMirror doesn't work with hidden tabs, refresh it when a new tab is open
                    $('#wizard').one('show.bs.modal', function () {
                        // Prettify the textarea with CodeMirror
                        var codemirror_options = {
                                lineNumbers: false,
                                readOnly: true,
                                mode: "yaml",
                                indentWithTabs: true,
                                tabSize: 2,
                        }
                        var codemirror = CodeMirror.fromTextArea(document.getElementById("manifest_textarea"), codemirror_options);
                        // TODO: despite this, the textarea shows up only on click
                        $('#manifest_textarea').trigger("click")
                    })
                    $('#wizard_save').addClass("d-none")
                    $('#wizard').one('hidden.bs.modal', function () {
                        $('#wizard_save').removeClass("d-none")
                    })
                    $("#wizard").modal()                                        
                };
            }(this, manifest));
            // delete examples
            $("#"+this.id+'_delete_examples_'+manifest_tag).unbind().click(function(this_class, manifest) {
                return function () {
                    gui.confirm("Do you really want to delete all the example sensors/rules/pages/menu installed by the package "+manifest["package"]+"?", function(result){ 
                        if (! result) return
                        var count = 0
                        if ("default_config" in manifest) {
                            for (var entry of manifest["default_config"]) {
                                for (var filename in entry) {
                                    // identify examples file only
                                    if (filename.startsWith("sensors/examples/") || filename.startsWith("rules/examples/") || filename.startsWith("gui/pages/examples/") || filename.startsWith("gui/menu/examples/")) {
                                        var config_schema = filename.charAt(filename.length-1)
                                        filename = filename.substring(0, filename.length-2);
                                        if (filename.endsWith("/_section")) continue
                                        var message = new Message(gui)
                                        message.recipient = "controller/config"
                                        message.command = "DELETE"
                                        message.args = filename
                                        message.config_schema = config_schema
                                        gui.send(message)
                                        count++
                                    }
                                }
                            }
                        }
                        gui.notify("info", "Requesting the to delete "+count+" example files.If the package is restarted, examples will be re-deployed")
                    });
                };
            }(this, manifest));
            if (table.data().count() == 0) $("#"+this.id+"_table_text").html('No data to display')
            // check for update
            var url = "https://raw.githubusercontent.com/"+manifest["github"]+"/"+manifest["branch"]+"/manifest.yml?timestamp="+new Date().getTime()
            $.get(url, function(data) {
                var remote_manifest = jsyaml.load(data)
                var status
                if (remote_manifest["manifest_schema"] != gui.supported_manifest_schema) {
                    $("#"+update_id).html('<i class="fas fa-question"></i>')
                    return
                }
                if (remote_manifest["version"] > manifest["version"] || (remote_manifest["version"] == manifest["version"] && remote_manifest["revision"] > manifest["revision"])) $("#"+update_id).html('<a href="https://github.com/'+manifest["github"]+'/tree/'+manifest["branch"]+'" target="_blank" ><i class="fas fa-external-link-alt"></i></a>')
                else {
                    $("#"+update_id).html('<i class="fas fa-check text-success"></i>')
                }
            });
            this.manifests[manifest["package"]] = manifest
        }
    }
    
    // receive configuration
    on_configuration(message) {
    }
}