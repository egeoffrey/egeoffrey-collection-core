// menu folder wizard widget
class Menu_folder_wizard extends Widget {
    constructor(id, widget) {
        super(id, widget)
        this.waiting_for_item = null
        this.folder = null
    }
    
    // draw the widget's content
    draw() {
        // extract requested folder item from URL
        var folder_id = null
        if (location.hash.includes("=")) {
            var request = location.hash.split("=")
            folder_id = request[1]
        }
        // clear up the modal
        $("#wizard_body").html("")
        $("#wizard_title").html("Menu Folder Configuration")
        // show the modal
        $("#wizard").modal()
        // build the form
        $("#wizard_body").append('\
            <form method="POST" role="form" id="'+this.id+'_form" class="needs-validation" novalidate>\
                <div class="form-group">\
                    <label>Folder identifier*</label>\
                    <input type="text" id="'+this.id+'_section_id" class="form-control" placeholder="folder identifier" pattern="[a-zA-Z0-9/_-]+" required>\
                </div>\
                <div class="form-group">\
                    <label>Text*</label>\
                    <input type="text" id="'+this.id+'_text" class="form-control" placeholder="text to show" required>\
                </div>\
                <div class="form-group">\
                    <label>Icon</label>\
                    <select id="'+this.id+'_icon" class="form-control"></select>\
                </div>\
                <div class="form-group">\
                    <label>Order*</label>\
                    <input type="text" id="'+this.id+'_order" class="form-control" placeholder="order of this folder" required>\
                </div>\
            </form>\
        ')
        gui.select_icon(this.id+'_icon')
        $("#"+this.id+"_order").TouchSpin();
        // add link to advanced configuration
        var link = folder_id == null ? "__new__" : folder_id
        $("#wizard_body").append('<a id="'+this.id+'_advanced_editor" class="float-right text-primary d-none">Advanced Editor</a>')
        $("#"+this.id+"_advanced_editor").unbind().click(function(this_class) {
            return function () {
                $('#wizard').unbind('hidden.bs.modal')
                $("#wizard").modal("hide")
                gui.unload_page()
                window.location.hash = "#__configuration=gui/menu/"+link+"/_section"
            };
        }(this));
        // what to do when the form is submitted
        var id = this.id
        var this_class = this
        $('#'+this.id+'_form').on('submit', function (e) {
            // form is validated
            if ($('#'+this_class.id+'_form')[0].checkValidity()) {
                // get folder_id 
                var folder_id = $("#"+this_class.id+"_section_id").val()
                // build up the configuration file
                var folder = {}
                for (var item of ["text", "icon", "order"]) {
                    var value = $("#"+this_class.id+"_"+item).val()
                    if (value == null || value == "") continue
                    folder[item] = $.isNumeric(value) ? parseFloat(value) : value
                }
                // save new/updated configuration
                var message = new Message(gui)
                message.recipient = "controller/config"
                message.command = "SAVE"
                message.args = "gui/menu/"+folder_id+"/_section"
                message.config_schema = gui.menu_config_schema
                message.set_data(folder)
                gui.send(message)
                // close the modal
                $("#wizard").modal("hide")
                gui.notify("success","Menu folder "+folder_id+" saved successfully")
                if (! (JSON.stringify(folder) === JSON.stringify(this.folder))) {
                    gui.wait_for_configuration("gui/menu/"+folder_id+"/_section", "Reloading the menu, please wait...")
                }
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
        }(this))
        // what to do when the modal is closed
        $('#wizard').one('hidden.bs.modal', function () {
            $('#wizard_delete').addClass("d-none")
            $("#menu_edit_button").removeClass("d-none")
            $("#menu_edit_cancel").addClass("d-none")
            gui.menu.refresh()
            window.history.back()
        })
        // // request content for editing the menu folder
        if (folder_id != null) {
            setTimeout(function(this_class, folder_id) {
                return function() {
                    this_class.waiting_for_item = folder_id
                    this_class.add_configuration_listener("gui/menu/"+this_class.waiting_for_item, gui.menu_config_schema)
                };
            }(this, folder_id), 100);
        }
    }
    
    // receive data and load it into the widget
    on_message(message) {
    }
    
    // receive configuration
    on_configuration(message) {
        // assuming we are receiving a configuration (edit)
        var folder_id = message.args.replace("gui/menu/","").replace("/_section", "")
        if (this.waiting_for_item == folder_id) this.waiting_for_item = null
        else return
        this.folder = message.get_data()
        $("#"+this.id+"_section_id").val(folder_id)
        $("#"+this.id+"_section_id").prop("disabled", true)
        // populate the form
        for (var item of ["text", "icon", "order"]) {
            if (item in this.folder) {
                if ($("#"+this.id+"_"+item).hasClass("bootstrap-select")) $("#"+this.id+"_"+item).selectpicker("val", this.folder[item])
                $("#"+this.id+"_"+item).val(this.folder[item])
            }
        }
    }
}