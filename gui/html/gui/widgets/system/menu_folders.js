// menu folders widget
class Menu_folders extends Widget {
    constructor(id, widget) {
        super(id, widget)
        this.folders = {}
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
            this.folders = {}
        }
        var body = "#"+this.id+"_body"
        $(body).html("")
        // add new folder button
        var button_html = '\
            <div class="form-group">\
                <button type="button" id="'+this.id+'_new" class="btn btn-block btn-outline-primary btn-lg"><i class="fas fa-plus"></i> Add a new menu folder</button>\
            </div>'
        $(body).append(button_html)
        $("#"+this.id+"_new").unbind().click(function() {
            return function () {
                window.location.hash = '#__menu_folder_wizard'
            };
        }());
        // add table
        // 1: page_id
        // 2: rows
        var table = '\
            <table id="'+this.id+'_table" class="table table-bordered table-striped">\
                <thead>\
                    <tr><th>Menu Folder</th><th>Order</th></tr>\
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
                    "className": "dt-center", 
                    "targets": [1]
                },
            ],
            "order": [[ 1, "asc" ]],
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
        // discover registered pages
        this.listener = this.add_configuration_listener("gui/menu/#", gui.menu_config_schema)
    }
    
    // receive data and load it into the widget
    on_message(message) {
    }
    
    // receive configuration
    on_configuration(message) {
        var folder_id = message.args.replace("gui/menu/","")
        if (folder_id.endsWith("_section")) {
            folder_id = folder_id.replace("/_section", "")
            // skip folders already received
            if (folder_id in this.folders) return
            var folder = message.get_data()
            var folder_tag = folder_id.replaceAll("/","_")
            this.folders[folder_id] = folder
            // add a line to the table
            var table = $("#"+this.id+"_table").DataTable()
            var icon = "icon" in folder ? folder["icon"] : "question"
            var description = '\
                <div>'+format_multiline('<i class="fas fa-'+icon+'"></i> '+folder["text"], 50)+'<br>\
                    <i>['+folder_id+']</i>\
                </div>\
                <div class="form-group" id="'+this.id+'_actions_'+folder_tag+'">\
                    <div class="btn-group">\
                        <button type="button" class="btn btn-sm btn-info">Actions</button>\
                        <button type="button" class="btn btn-sm btn-info dropdown-toggle" data-toggle="dropdown">\
                            <span class="caret"></span>\
                            <span class="sr-only">Toggle Dropdown</span>\
                        </button>\
                        <div class="dropdown-menu" role="menu">\
                            <a class="dropdown-item" id="'+this.id+'_edit_'+folder_tag+'" style="cursor: pointer"><i class="fas fa-edit"></i> Edit</a>\
                            <div class="dropdown-divider"></div>\
                            <a class="dropdown-item" id="'+this.id+'_delete_'+folder_tag+'" style="cursor: pointer"><i class="fas fa-trash"></i> Delete</a>\
                        </div>\
                    </div>\
                </div>\
            '
            // add the row
            table.row.add([
                description,
                folder["order"]
            ]).draw(false);
            table.responsive.recalc()
            if (table.data().count() == 0) $("#"+this.id+"_table_text").html('No data to display')
            // edit the selected folder
            $("#"+this.id+"_edit_"+folder_tag).unbind().click(function(folder_id) {
                return function () {
                    window.location.hash = '#__menu_folder_wizard='+folder_id;
                };
            }(folder_id));
            // delete the folder
            $("#"+this.id+"_delete_"+folder_tag).unbind().click(function(folder_id, config_schema) {
                return function () {
                    gui.confirm("Do you really want to delete folder "+folder_id+"?", function(result){ 
                        if (! result) return
                        // delete the page configuration file
                        var message = new Message(gui)
                        message.recipient = "controller/config"
                        message.command = "DELETE"
                        message.args = "gui/menu/"+folder_id+"/_section"
                        message.config_schema = config_schema
                        gui.send(message)
                        gui.notify("info", "Requesting to delete folder "+folder_id)
                    });
                };
            }(folder_id, message.config_schema));
        }
    }
}