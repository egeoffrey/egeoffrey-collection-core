// pages widget
class Pages extends Widget {
    constructor(id, widget) {
        super(id, widget)
        this.pages = {}
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
            this.pages = {}
        }
        var body = "#"+this.id+"_body"
        $(body).html("")
        // add new page button
        var button_html = '\
            <div class="form-group">\
                <button type="button" id="'+this.id+'_new" class="btn btn-block btn-outline-primary btn-lg"><i class="fas fa-plus"></i> Add a new page</button>\
            </div>'
        $(body).append(button_html)
        $("#"+this.id+"_new").unbind().click(function(this_class) {
            return function () {
                // clear up the modal
                $("#wizard_body").html("")
                $("#wizard_title").html("Create a new page")
                // show the modal
                $("#wizard").modal()
                // build the form
                $("#wizard_body").append('\
                    <form method="POST" role="form" id="'+this_class.id+'_form" class="needs-validation" novalidate>\
                        <div class="form-group">\
                            <label>Page Identifier*</label>\
                            <input type="text" id="'+this_class.id+'_page_id" class="form-control" pattern="[a-zA-Z0-9/_-]+" placeholder="Give the page an id. It will be its filename" required>\
                        </div>\
                    </form>\
                ')
                // configure what to do when submitting the form
                $('#'+this_class.id+'_form').on('submit', function (e) {
                    // form is validated
                    if ($('#'+this_class.id+'_form')[0].checkValidity()) {
                        // save the updated page
                        var page_id = $("#"+this_class.id+"_page_id").val()
                        var message = new Message(gui)
                        message.recipient = "controller/config"
                        message.command = "SAVE"
                        message.args = "gui/pages/"+page_id
                        message.config_schema = gui.page_config_schema
                        message.set_data([])
                        gui.send(message)
                        // open up the new page
                        gui.notify("success", "Page "+page_id+" saved successfully. Click on 'Edit Page' to add your favorite widgets")
                        $('#wizard').unbind('hidden.bs.modal')
                        $("#wizard").modal("hide")
                        gui.unload_page()
                        window.location.hash = "#"+page_id
                        return false
                    }
                    else {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    $('#'+this_class.id+'_form').addClass("was-validated")
                })
                // configure submit button
                $('#wizard_save').unbind().click(function(this_class) {
                    return function () {
                        $("#"+this_class.id+"_form").submit()
                    };
                }(this_class))
            };
        }(this));
        // add table
        // 1: page_id
        // 2: rows
        var table = '\
            <table id="'+this.id+'_table" class="table table-bordered table-striped">\
                <thead>\
                    <tr><th>Page</th><th>Rows</th></tr>\
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
        // discover registered pages
        this.listener = this.add_configuration_listener("gui/pages/#", gui.page_config_schema)
    }
    
    // receive data and load it into the widget
    on_message(message) {
    }
    
    // receive configuration
    on_configuration(message) {
        var page_id = message.args.replace("gui/pages/","")
        var is_example = page_id.startsWith("examples/")
        // skip pages already received
        if (page_id in this.pages) return
        var page = message.get_data()
        var page_tag = page_id.replaceAll("/","_")
        this.pages[page_id] = page
        // add a line to the table
        var table = $("#"+this.id+"_table").DataTable()
        var view_edit = is_example ? "View" : "View/Edit"
        var description = '\
            <div>'+page_id+'</div>\
            <div class="form-group" id="'+this.id+'_actions_'+page_tag+'">\
                <div class="btn-group">\
                    <button type="button" class="btn btn-sm btn-info">Actions</button>\
                    <button type="button" class="btn btn-sm btn-info dropdown-toggle" data-toggle="dropdown">\
                        <span class="caret"></span>\
                        <span class="sr-only">Toggle Dropdown</span>\
                    </button>\
                    <div class="dropdown-menu" role="menu">\
                        <a class="dropdown-item" id="'+this.id+'_view_'+page_tag+'" style="cursor: pointer"><i class="fas fa-eye"></i> '+(is_example ? "View" : "View/Edit")+'</a>\
                        <div class="dropdown-divider"></div>\
                        <a class="dropdown-item" id="'+this.id+'_clone_'+page_tag+'" style="cursor: pointer"><i class="fas fa-copy"></i> Clone</a>\
                        <a class="dropdown-item '+(is_example ? "d-none" : "")+'" id="'+this.id+'_rename_'+page_tag+'" style="cursor: pointer"><i class="fas fa-font"></i> Rename</a>\
                        <a class="dropdown-item" id="'+this.id+'_delete_'+page_tag+'" style="cursor: pointer"><i class="fas fa-trash"></i> Delete</a>\
                    </div>\
                </div>\
            </div>\
        '
        // add the row
        table.row.add([
            description,
            page.length
        ]).draw(false);
        table.responsive.recalc()
        if (table.data().count() == 0) $("#"+this.id+"_table_text").html('No data to display')
        // run the selected page
        $("#"+this.id+"_run_"+page_tag).unbind().click(function(page_id) {
            return function () {
                var message = new Message(gui)
                message.recipient = "controller/alerter"
                message.command = "RUN"
                message.args = page_id
                gui.send(message)
                gui.notify("info", "Requesting to run the page "+page_id)
            };
        }(page_id));
        // edit the selected page
        $("#"+this.id+"_view_"+page_tag).unbind().click(function(page_id) {
            return function () {
                window.location.hash = '#'+page_id;
            };
        }(page_id));
        // clone the page
        $("#"+this.id+"_clone_"+page_tag).unbind().click(function(this_class, page_id, config_schema) {
            return function () {
                bootbox.prompt("Give the page you want to clone a new identifier", function(result){ 
                    if (! result) return
                    // save the configuration file into the new position
                    var message = new Message(gui)
                    message.recipient = "controller/config"
                    message.command = "SAVE"
                    message.args = "gui/pages/"+result
                    message.config_schema = config_schema
                    message.set_data(this_class.pages[page_id])
                    gui.send(message)
                    gui.notify("info","Cloning page "+page_id+" into "+result)
                });
            };
        }(this, page_id, message.config_schema));
        // rename the page
        $("#"+this.id+"_rename_"+page_tag).unbind().click(function(this_class, page_id, config_schema) {
            return function () {
                bootbox.prompt("Give the page "+page_id+" a new name", function(result){ 
                    if (! result) return
                    // delete the configuration file
                    var message = new Message(gui)
                    message.recipient = "controller/config"
                    message.command = "DELETE"
                    message.args = "gui/pages/"+page_id
                    message.config_schema = config_schema
                    gui.send(message)
                    // save the configuration file into the new position
                    var message = new Message(gui)
                    message.recipient = "controller/config"
                    message.command = "SAVE"
                    message.args = "gui/pages/"+result
                    message.config_schema = config_schema
                    message.set_data(this_class.pages[page_id])
                    gui.send(message)
                    gui.notify("info","Renaming page "+page_id+" into "+result)
                });
            };
        }(this, page_id, message.config_schema));
        // delete the page
        $("#"+this.id+"_delete_"+page_tag).unbind().click(function(page_id, config_schema) {
            return function () {
                gui.confirm("Do you really want to delete page "+page_id+"?", function(result){ 
                    if (! result) return
                    // delete the page configuration file
                    var message = new Message(gui)
                    message.recipient = "controller/config"
                    message.command = "DELETE"
                    message.args = "gui/pages/"+page_id
                    message.config_schema = config_schema
                    gui.send(message)
                    gui.notify("info", "Requesting to delete page "+page_id)
                });
            };
        }(page_id, message.config_schema));
    }
}