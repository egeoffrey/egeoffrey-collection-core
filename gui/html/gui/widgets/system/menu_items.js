// menu items widget
class Menu_items extends Widget {
    constructor(id, widget) {
        super(id, widget)
        this.items = {}
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
            this.items = {}
        }
        var body = "#"+this.id+"_body"
        $(body).html("")
        // add new item button
        var button_html = '\
            <div class="form-group">\
                <button type="button" id="'+this.id+'_new" class="btn btn-block btn-outline-primary btn-lg"><i class="fas fa-plus"></i> Add a new menu item</button>\
            </div>'
        $(body).append(button_html)
        $("#"+this.id+"_new").unbind().click(function() {
            return function () {
                window.location.hash = '#__menu_item_wizard'
            };
        }());
        // add table
        // 1: folder
        // 2: menu_item
        // 3: page
        // 4: order
        var table = '\
            <table id="'+this.id+'_table" class="table table-bordered table-striped">\
                <thead>\
                    <tr><th>Menu Item</th><th>Folder</th><th>Page</th><th>Order</th></tr>\
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
                    "targets": [3]
                }
            ],
            "order": [[ 1, "asc" ], [ 3, "asc" ]],
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
        var item_id = message.args.replace("gui/menu/","")
        if (! item_id.endsWith("_section")) {
            // skip items already received
            if (item_id in this.items) return
            var item = message.get_data()
            var split = item_id.split("/")
            var folder_id = split[0]
            var item_name = split[1]
            var item_tag = item_id.replaceAll("/","_")
            this.items[item_id] = item
            // add a line to the table
            var table = $("#"+this.id+"_table").DataTable()
            var icon = "icon" in item ? item["icon"] : "question"
            var description = '\
                <div>'+format_multiline('<i class="fas fa-'+icon+'"></i> '+item["text"], 50)+'<br>\
                    <i>['+item_name+']</i>\
                </div>\
                <div class="form-group" id="'+this.id+'_actions_'+item_tag+'">\
                    <div class="btn-group">\
                        <button type="button" class="btn btn-sm btn-info">Actions</button>\
                        <button type="button" class="btn btn-sm btn-info dropdown-toggle" data-toggle="dropdown">\
                            <span class="caret"></span>\
                            <span class="sr-only">Toggle Dropdown</span>\
                        </button>\
                        <div class="dropdown-menu" role="menu">\
                            <a class="dropdown-item" id="'+this.id+'_edit_'+item_tag+'" style="cursor: pointer"><i class="fas fa-edit"></i> Edit</a>\
                            <div class="dropdown-divider"></div>\
                            <a class="dropdown-item" id="'+this.id+'_clone_'+item_tag+'" style="cursor: pointer"><i class="fas fa-copy"></i> Clone</a>\
                            <a class="dropdown-item" id="'+this.id+'_rename_'+item_tag+'" style="cursor: pointer"><i class="fas fa-font"></i> Rename</a>\
                            <a class="dropdown-item" id="'+this.id+'_delete_'+item_tag+'" style="cursor: pointer"><i class="fas fa-trash"></i> Delete</a>\
                        </div>\
                    </div>\
                </div>\
            '
            // add the row
            table.row.add([
                description,
                folder_id,
                item["page"],
                item["order"]
            ]).draw(false);
            table.responsive.recalc()
            if (table.data().count() == 0) $("#"+this.id+"_table_text").html('No data to display')
            // edit the selected section
            $("#"+this.id+"_edit_"+item_tag).unbind().click(function(item_id) {
                return function () {
                    window.location.hash = '#__menu_item_wizard='+item_id
                };
            }(item_id));
            // clone the item
            $("#"+this.id+"_clone_"+item_tag).unbind().click(function(this_class, folder_id, item_id, item_name, config_schema) {
                return function () {
                    bootbox.prompt("Give the menu item you want to clone a new identifier (must include the folder id as prefix, e.g. "+folder_id+"/"+"new_name)", function(result){ 
                        if (! result) return
                        // save the configuration file into the new position
                        var message = new Message(gui)
                        message.recipient = "controller/config"
                        message.command = "SAVE"
                        message.args = "gui/menu/"+result
                        message.config_schema = config_schema
                        message.set_data(this_class.items[item_id])
                        gui.send(message)
                        gui.notify("info","Cloning menu item "+item_id+" into "+result)
                    });
                };
            }(this, folder_id, item_id, item_name, message.config_schema));
            // rename the item
            $("#"+this.id+"_rename_"+item_tag).unbind().click(function(this_class, folder_id, item_id, item_name, config_schema) {
                return function () {
                    bootbox.prompt("Give the menu item "+item_name+" a new name (must include the folder id as prefix, e.g. "+folder_id+"/"+"new_name)", function(result){ 
                        if (! result) return
                        // delete the configuration file
                        var message = new Message(gui)
                        message.recipient = "controller/config"
                        message.command = "DELETE"
                        message.args = "gui/menu/"+item_id
                        message.config_schema = config_schema
                        gui.send(message)
                        // save the configuration file into the new position
                        var message = new Message(gui)
                        message.recipient = "controller/config"
                        message.command = "SAVE"
                        message.args = "gui/menu/"+result
                        message.config_schema = config_schema
                        message.set_data(this_class.items[item_id])
                        gui.send(message)
                        gui.notify("info","Renaming menu item "+item_id+" into "+result)
                    });
                };
            }(this, folder_id, item_id, item_name, message.config_schema));
            // delete the item
            $("#"+this.id+"_delete_"+item_tag).unbind().click(function(item_id, item_name, config_schema) {
                return function () {
                    gui.confirm("Do you really want to delete menu item "+item_name+"?", function(result){ 
                        if (! result) return
                        // delete the page configuration file
                        var message = new Message(gui)
                        message.recipient = "controller/config"
                        message.command = "DELETE"
                        message.args = "gui/menu/"+item_id
                        message.config_schema = config_schema
                        gui.send(message)
                        gui.notify("info", "Requesting to delete menu item "+item_name)
                    });
                };
            }(item_id, item_name, message.config_schema));
        }
    }
}