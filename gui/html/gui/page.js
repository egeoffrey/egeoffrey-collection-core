// handle the page
class Page {
    constructor(type, page_id, page) {
        // keep track of page content and type
        this.page_id = page_id
        this.page = page
        this.type = type
        // map widget_id with the widget object
        this.widget_objects = {}
        // widget wizard object
        this.widget_wizard = null
        // map each widget_id to the widget configuration
        this.widgets = {}
        // draw the page structure
        $("#page_wrapper").html('\
            <div class="content-header">\
                <div class="container-fluid">\
                    <div class="row mb-2">\
                        <div class="col-sm-6" id="page_header">\
                            <div class="form-group"><input type="text" id="page_id" class="form-control d-none" placeholder="page identifier"></div>\
                        </div>\
                        <div class="col-sm-6">\
                            <ol class="breadcrumb float-sm-right d-none" id="page_buttons">\
                                <li class="breadcrumb-item">\
                                    <button class="btn btn-default btn-sm" id="page_edit"><i class="fas fa-edit"></i> '+locale("page.edit")+'</button>\
                                    <button class="btn btn-default btn-sm edit_page_item d-none" id="page_add_row"><i class="fas fa-plus"></i> '+locale("page.add_row")+'</button>\
                                    <button class="btn btn-default d-none btn-sm edit_page_item" id="page_edit_cancel"><i class="fas fa-undo"></i> '+locale("page.discard_changes")+'</button>\
                                    <button class="btn btn-default d-none btn-sm edit_page_item" id="page_edit_done"><i class="fas fa-save"></i> '+locale("page.save_changes")+'</button>\
                                </li>\
                            </ol>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <section class="content">\
                <div class="container-fluid">\
                    <div id="body"></div>\
                    <div style="padding: 10px 0px; text-align: center;">\
                        <div class="text-muted"><a href="javascript:window.scrollTo(0,0);">'+locale("page.go_to_top")+'</a></div>\
                    </div>\
                </div>\
            </section>\
        ')
        if ( ! page_id.startsWith("__") && ! page_id.startsWith("gui/pages/examples/") && gui.is_authorized(["house_admins"])) $("#page_buttons").removeClass("d-none")
        // if it is a user page, draw the page layout provided by the user
        if (type == "USER") this.draw(page)
        // if it is a system page, build the page layout and draw it
        else if (type == "SYSTEM") {
            var system = new System()
            var page_layout = system.get_layout(page_id)
            if (page_layout != null) this.draw(page_layout)
        }
    }
   
    // add a new row to the page
    add_row(row, title) {
        // add row
        $("#page").append('\
            <div class="row_block">\
                <h2 class="page-header" id="title_row_'+row+'">\
                    <center>\
                        <span id="title_text_row_'+row+'" class="no_edit_page_item">'+title+'</span> \
                        <input id="title_input_row_'+row+'" type="text" value="'+title+'" class="edit_page_item d-none" placeholder="give this row a title...">\
                        <button class="btn btn-default d-none btn-sm edit_page_item" id="delete_row_'+row+'"><i class="fas fa-trash-alt"></i> Delete Row</button>\
                        <button class="btn btn-default btn-sm edit_page_item d-none sortable_row" style="cursor: move;"><i class="fas fa-arrows-alt"></i> Move Row</button>\
                        <button class="btn btn-default btn-sm edit_page_item d-none" id="add_widget_row_'+row+'"><i class="fas fa-plus"></i> Add Widget</button>\
                    </center>\
                </h2>\
                <div class="row connected_widgets" id="row_'+row+'"></div>\
            </div>\
        ')
        // keep in sync section text and input
        $("#title_input_row_"+row).unbind().keyup(function(this_class, row) {
            return function (e) {
                var value = $("#title_input_row_"+row).val()
                $("#title_text_row_"+row).html(value)
            };
        }(this, row));
        // configure delete row button
        $("#delete_row_"+row).unbind().click(function(this_class, row) {
            return function () {
                gui.confirm("Do you really want to delete the row and all its the widgets?", function(result){ 
                    if (! result) return
                    // remove both the title and the entire row
                    $("#title_row_"+row).remove()
                    $("#row_"+row).remove()
                })
            };
        }(this, row));
        // configure add widget button
        $("#add_widget_row_"+row).unbind().click(function(this_class, row) {
            return function () {
                this.widget_wizard = new Widget_wizard("widget_wizard", null, this_class)
                this.widget_wizard.draw(row)
            };
        }(this, row));
        // make the widgets in the row sortable
        var this_class = this
        $("#row_"+row).sortable({
            placeholder: 'sort-highlight',
            connectWith: '.connected_widgets',
            handle: '.sortable_widget',
            tolerance: 'pointer',
            distance: 0.5,
            forcePlaceholderSize: false,
            cancel: '',
            dropOnEmpty: true,
            zIndex: 999999,
        })
    }
    
    // add column
   add_column(row, column, size, offset) {
        var id = "widget_"+row+"_"+column
        $("#row_"+row).append('<section class="col-lg-'+size+' offset-md-'+offset+'" id="'+id+'"></section>')
        return id
    }
    
    // start editing the page
    page_edit_start() {
        $(".edit_page_item").removeClass("d-none")
        $(".no_edit_page_item").addClass("d-none")
        $("#page_edit").addClass("d-none")
        $("#page_edit_done").removeClass("d-none")
    }
    
    // stop editing the page
    page_edit_end() {
        $(".edit_page_item").addClass("d-none")
        $(".no_edit_page_item").removeClass("d-none")
        $("#page_edit").removeClass("d-none")
        $("#page_edit_done").addClass("d-none")
    }
    
    // draw the page
    draw(page) {
        // clear up the page
        $("#body").empty()
        // build up the page
        if (this.page_id != null) {
            $("#page_id").val(this.page_id.replace("gui/pages/", ""))
            $("#page_id").prop("disabled", true)
        }
        $("#body").append('<div id="page" class="connected_rows"></div>');
        // configure sortable rows
        $("#page").sortable({
            placeholder: 'sort-highlight',
            connectWith: '.connected_rows',
            handle: '.sortable_row',
            tolerance: 'pointer',
            items: '.row_block',
            axis: 'y',
            distance: 0.5,
            forcePlaceholderSize: false,
            cancel: '',
            dropOnEmpty: true,
            zIndex: 999999,
        })
        // draw the page
        for (var row = 0; row < page.length; row++) {
            // add a row
            for (var section in page[row]) {
                // add a row/subtitle
                this.add_row(row, section)
                // add columns
                for (var column = 0; column < page[row][section].length; column++) {
                    var widget = page[row][section][column]
                    if ("allow" in widget && ! gui.is_authorized(widget["allow"])) continue
                    var offset = "offset" in widget ? widget["offset"] : 0
                    // add a new column
                    var id = this.add_column(row, column, widget["size"], offset)
                    // add the widget to the page
                    this.add_widget(id, widget)
                }
            }
        }
        // configure page edit button
        $("#page_edit").unbind().click(function(this_class) {
            return function () {
                this_class.page_edit_start()
            };
        }(this));
        // configure page edit cancel button
        $("#page_edit_cancel").unbind().click(function(this_class) {
            return function () {
                // restore the page layout
                this_class.page_edit_end()
                gui.load_page()
            };
        }(this));
        // configure page edit done button
        $("#page_edit_done").unbind().click(function(this_class) {
            return function () {
                // rebuild the page data structure
                var page = []
                // for each row of the page
                $("#page > div > div").each(function(e){
                    var row_id = this.id
                    var row_num = parseInt(row_id.replace("row_", ""))
                    var columns = []
                    // for each column
                    $("#page > div> #"+row_id+" > section").each(function(e){
                        // build up the new row with previously stored widgets' configuration
                        columns.push(this_class.widgets[this.id])
                    });
                    var row = {}
                    row[$('#title_text_row_'+row_num).html()] = columns
                    // add the column to the 
                    page.push(row)
                })
                // save the updated page
                var message = new Message(gui)
                message.recipient = "controller/config"
                message.command = "SAVE"
                message.args = "gui/pages/"+$("#page_id").val()
                message.config_schema = gui.page_config_schema
                message.set_data(page)
                gui.send(message)
                // restore the page layout
                this_class.page_edit_end()
                gui.notify("success", "Page "+this_class.page_id+" saved successfully")
                if (! (JSON.stringify(page) === JSON.stringify(this_class.page))) {
                    gui.load_page()
                    gui.wait_for_configuration(this_class.page_id, 'Reloading page, please wait...')
                }
            };
        }(this));
        // configure add row button
        $("#page_add_row").unbind().click(function(this_class) {
            return function () {
                var row = this_class.page.length
                this_class.add_row(row, "")
                $("#title_row_"+row+" .edit_page_item").removeClass("d-none")
                $("#title_row_"+row+" .no_edit_page_item").addClass("d-none")
                window.scrollTo(0, document.body.scrollHeight);
            };
        }(this));
        // if editing another page, clean it up
        this.page_edit_end()
    }
    
    // close the current page
    close() {
        if (this.widget_wizard != null) this.widget_wizard.close()
        // close all the widget of the page
        for (var id in this.widget_objects) {
            var widget_object = this.widget_objects[id]
            if(typeof widget_object.close === 'function')
            widget_object.close()
        }
    }
    
    // create the requested widget and return it
    create_widget(id, widget) {
        var widget_object = null
        // user widgets
        if (widget["widget"] == "summary") widget_object = new Summary(id, widget)
        else if (widget["widget"] == "timeline") widget_object = new Timeline(id, widget)
        else if (widget["widget"] == "range") widget_object = new Range(id, widget)
        else if (widget["widget"] == "value") widget_object = new Value(id, widget)
        else if (widget["widget"] == "status") widget_object = new Value(id, widget)
        else if (widget["widget"] == "control") widget_object = new Value(id, widget)
        else if (widget["widget"] == "input") widget_object = new Value(id, widget)
        else if (widget["widget"] == "button") widget_object = new Value(id, widget)
        else if (widget["widget"] == "calendar") widget_object = new Calendar(id, widget)
        else if (widget["widget"] == "image") widget_object = new Images(id, widget)
        else if (widget["widget"] == "map") widget_object = new Maps(id, widget)
        else if (widget["widget"] == "text") widget_object = new Text(id, widget)
        else if (widget["widget"] == "table") widget_object = new Table(id, widget)
        else if (widget["widget"] == "counter") widget_object = new Counter(id, widget)
        else if (widget["widget"] == "tasks") widget_object = new Tasks(id, widget)
        else if (widget["widget"] == "notifications") widget_object = new Notifications(id, widget)
        else if (widget["widget"] == "chatbot") widget_object = new Chatbot(id, widget)
        else if (widget["widget"] == "slider") widget_object = new Value(id, widget)
		else if (widget["widget"] == "heartbeat") widget_object = new Value(id, widget)
        // system widgets
        else if (widget["widget"] == "__packages") widget_object = new Packages(id, widget)
        else if (widget["widget"] == "__modules") widget_object = new Modules(id, widget)
        else if (widget["widget"] == "__sensors") widget_object = new Sensors(id, widget)
        else if (widget["widget"] == "__logs") widget_object = new Logs(id, widget)
        else if (widget["widget"] == "__rules") widget_object = new Rules(id, widget)
        else if (widget["widget"] == "__configuration") widget_object = new Configuration(id, widget)
        else if (widget["widget"] == "__database") widget_object = new Database(id, widget)
        else if (widget["widget"] == "__gateway") widget_object = new Gateway(id, widget)
        else if (widget["widget"] == "__setup") widget_object = new Setup(id, widget)
        else if (widget["widget"] == "__users") widget_object = new Users(id, widget)
        else if (widget["widget"] == "__pages") widget_object = new Pages(id, widget)
        else if (widget["widget"] == "__menu_folders") widget_object = new Menu_folders(id, widget)
        else if (widget["widget"] == "__menu_items") widget_object = new Menu_items(id, widget)
        else gui.log_error("unknown widget "+JSON.stringify(widget))
        if (widget_object != null) this.widget_objects[id] = widget_object
        return widget_object
    }
    
    // add the widget to the page
    add_widget(id, widget) {
        // keep track of the widget configuration
        this.widgets[id] = widget
        // if there is already something at the position, remove it first
        if (id in this.widget_objects) {
            var widget_object = this.widget_objects[id]
            if(typeof widget_object.close === 'function')
            widget_object.close()
            delete this.widget_objects[id]
        }
        // create the requested widget
        var widget_object = this.create_widget(id, widget)
        if (widget_object != null) {
            // resize the widget if necessary
            var offset = "offset" in widget ? widget["offset"] : 0
            $("#"+id).removeClass().addClass("col-lg-"+widget["size"]).addClass("offset-md-"+offset)
            // load the data
            widget_object.draw()
            // configure the refresh button
            $("#"+id+"_refresh").unbind().click(function(widget_object) {
                return function () {
                    widget_object.draw()
                };
            }(widget_object));
            // configure the expand button
            $("#"+id+"_popup").unbind().click(function(this_class, widget) {
                return function () {
                    // clear the modal and load it
                    $("#popup_body").html("")
                    var widget_object = this_class.create_widget("popup_body", widget)
                    if (widget_object != null) widget_object.draw()
                    $("#popup").modal()
                };
            }(this, widget));
            // configure the delete button
            $("#"+id+"_delete").unbind().click(function(this_class, id) {
                return function () {
                    // remove the widget
                    $("#"+id).remove()
                };
            }(this, id));
            // configure the edit button
            $("#"+id+"_edit").unbind().click(function(this_class, id, widget) {
                return function () {
                    this.widget_wizard = new Widget_wizard(id, widget, this_class)
                    this.widget_wizard.draw()
                };
            }(this, id, widget));
        }
    }
}