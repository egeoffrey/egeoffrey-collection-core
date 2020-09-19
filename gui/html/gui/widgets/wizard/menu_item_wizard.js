// menu item wizard widget
class Menu_item_wizard extends Widget {
    constructor(id, widget) {
        super(id, widget)
        this.waiting_for_item = null
        this.menu_item = null
        this.pages = {}
        this.folders = {}
    }
    
    // draw the widget's content
    draw() {
        // extract requested menu item from URL
        var folder_id = null
        var menu_item_id = null
        if (location.hash.includes("=")) {
            var request = location.hash.split("=")
            var split = request[1].split("/")
            folder_id = split[0]
            menu_item_id = split[1]
        }
        // show up cancel button
        $("#menu_edit_button").addClass("d-none")
        $("#menu_edit_cancel").removeClass("d-none")
        // clear up the modal
        $("#wizard_body").html("")
        $("#wizard_title").html("Menu Item Configuration")
        // show the modal
        $("#wizard").modal()
        // build the form
        $("#wizard_body").append('\
            <form method="POST" role="form" id="'+this.id+'_form" class="needs-validation" novalidate>\
                <div class="form-group">\
                    <label>Folder identifier*</label>\
                    <select id="'+this.id+'_section_id" class="form-control" required><option value=""></option></select>\
                </div>\
                <div class="form-group">\
                    <label>Menu item identifier*</label>\
                    <input type="text" id="'+this.id+'_menu_item_id" class="form-control" placeholder="identifier of the menu item" pattern="[a-zA-Z0-9/_-]+" required>\
                </div>\
                <div class="form-group">\
                    <label>Text*</label>\
                    <input type="text" id="'+this.id+'_text" class="form-control" placeholder="text to show" required>\
                </div>\
                <div class="form-group">\
                    <label>Page*</label>\
                    <select id="'+this.id+'_page" class="form-control" required><option value=""></option></select>\
                </div>\
                <div class="form-group">\
                    <label>Icon</label>\
                    <select id="'+this.id+'_icon" class="form-control"></select>\
                </div>\
                <div class="form-group">\
                    <label>Order*</label>\
                    <input type="text" id="'+this.id+'_order" class="form-control" placeholder="order of this menu item in the folder" required>\
                </div>\
                <div class="form-group">\
                    <label>Authorized Groups</label>\
                    <div id="'+this.id+'_groups"></div>\
                    <br>\
                    <div class="form-group">\
                        <button type="button" class="btn btn-default float-right" id="'+this.id+'_groups_add"><i class="fas fa-plus"></i> Add Group</button>\
                    </div>\
                </div>\
            </form>\
        ')
        gui.select_icon(this.id+'_icon')
        // configure page select
        $("#"+this.id+'_page').attr("data-live-search", "true")
        $("#"+this.id+'_page').addClass("bootstrap-select")
        $('#'+this.id+'_page').selectpicker();
        // configure folder select
        $("#"+this.id+'_section_id').attr("data-live-search", "true")
        $("#"+this.id+'_section_id').addClass("bootstrap-select")
        $('#'+this.id+'_section_id').selectpicker();
        // configure order input
        $("#"+this.id+"_order").TouchSpin();
        // configure add group button
        $("#"+this.id+'_groups_add').unbind().click(function(this_class, id) {
            return function () {
                this_class.add_array_item(id)
            };
        }(this, this.id+'_groups'));
        // add link to advanced configuration
        var link = menu_item_id == null ? "__new__" : folder_id+"/"+menu_item_id
        $("#wizard_body").append('<br><a id="'+this.id+'_advanced_editor" class="float-right text-primary d-none">Advanced Editor</a>')
        $("#"+this.id+"_advanced_editor").unbind().click(function(this_class) {
            return function () {
                $('#wizard').unbind('hidden.bs.modal')
                $("#wizard").modal("hide")
                gui.unload_page()
                window.location.hash = "#__configuration=gui/menu/"+link 
            };
        }(this));
        // what to do when the form is submitted
        var id = this.id
        var this_class = this
        $('#'+this.id+'_form').on('submit', function (e) {
            // form is validated
            if ($('#'+this_class.id+'_form')[0].checkValidity()) {
                // get menu_item_id 
                var folder_id = $("#"+this_class.id+"_section_id").val()
                var menu_item_id = $("#"+this_class.id+"_menu_item_id").val()
                // build up the configuration file
                var menu_item = {}
                for (var item of ["text", "page", "icon", "order"]) {
                    var value = $("#"+this_class.id+"_"+item).val()
                    if (value == null || value == "") continue
                    menu_item[item] = $.isNumeric(value) ? parseFloat(value) : value
                }
                $("#"+this_class.id+"_groups :input[type=text]").each(function(e){
                    if (! ("allow" in menu_item)) menu_item["allow"] = []
                    menu_item["allow"].push(this.value)
                });
                // save new/updated configuration
                var message = new Message(gui)
                message.recipient = "controller/config"
                message.command = "SAVE"
                message.args = "gui/menu/"+folder_id+"/"+menu_item_id
                message.config_schema = gui.menu_config_schema
                message.set_data(menu_item)
                gui.send(message)
                // close the modal
                $("#wizard").modal("hide")
                gui.notify("success","Menu item "+folder_id+"/"+menu_item_id+" saved successfully")
                if (! (JSON.stringify(menu_item) === JSON.stringify(this.menu_item))) {
                    gui.wait_for_configuration("gui/menu/"+folder_id+"/"+menu_item_id, "Reloading the menu, please wait...")
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
        // // request content for editing the menu item
        if (menu_item_id != null) {
            setTimeout(function(this_class, folder_id, menu_item_id) {
                return function() {
                    this_class.waiting_for_item = folder_id+"/"+menu_item_id
                    this_class.add_configuration_listener("gui/menu/"+this_class.waiting_for_item, gui.menu_config_schema)
                };
            }(this, folder_id, menu_item_id), 100);
        }
        this.add_configuration_listener("gui/menu/#", gui.menu_config_schema)        
        this.add_configuration_listener("gui/pages/#", gui.page_config_schema)
    }
    
    // return a random number
    get_random() {
        var min = 1; 
        var max = 100000;
        return Math.floor(Math.random() * (+max - +min)) + +min;
    }
    
    // add an array item to the wizard form
    add_array_item(id, value="") {
        var i = this.get_random()
        var html = '\
            <div class="row" id="'+id+'_row_'+i+'">\
                <div class="col-11">\
                    <input type="text" id="'+id+'_value_'+i+'" class="form-control" value="'+value+'" required>\
                </div>\
                <div class="col-1">\
                    <button type="button" class="btn btn-default">\
                        <i class="fas fa-times text-red" id="'+id+'_remove_'+i+'"></i>\
                    </button>\
                </div>\
            </div>\
        '
        $("#"+id).append(html)
        // configure remove button
        $("#"+id+"_remove_"+i).unbind().click(function(id, i) {
            return function () {
                $("#"+id+"_row_"+i).remove()
            };
        }(id, i));
    }
    
    // receive data and load it into the widget
    on_message(message) {
    }
    
    // receive configuration
    on_configuration(message) {
        // receiving a menu item configuration to edit
        if (message.args.startsWith("gui/menu/"+this.waiting_for_item)) {
            var split = message.args.replace("gui/menu/","").split("/")
            var folder_id = split[0]
            var menu_item_id = split[1]
            if (this.waiting_for_item == folder_id+"/"+menu_item_id) this.waiting_for_item = null
            else return
            this.menu_item = message.get_data()
            $("#"+this.id+"_section_id").prop("disabled", true)
            $("#"+this.id+"_section_id").selectpicker("val", folder_id)
            $("#"+this.id+"_section_id").selectpicker("refresh")
            $("#"+this.id+"_menu_item_id").val(menu_item_id)
            $("#"+this.id+"_menu_item_id").prop("disabled", true)
            // populate the form
            for (var item of ["section_id", "text", "page", "icon", "order"]) {
                if (item in this.menu_item) {
                    if ($("#"+this.id+"_"+item).hasClass("bootstrap-select")) {
                        $("#"+this.id+"_"+item).selectpicker("val", this.menu_item[item])
                        $("#"+this.id+"_"+item).selectpicker("refresh")
                    }
                    $("#"+this.id+"_"+item).val(this.menu_item[item])
                }
            }
            if ("allow" in this.menu_item) {
                for (var i = 0; i < this.menu_item["allow"].length; i++) {
                    var value = this.menu_item["allow"][i]
                    this.add_array_item(this.id+'_groups', value)
                }
            }
        }
        // pages for the select input
        else if (message.args.startsWith("gui/pages/")) {
            var page_id = message.args.replace("gui/pages/", "")
            if (page_id in this.pages) return
            this.pages[page_id] = message.get_data()
            $('#'+this.id+"_page").append('<option val="'+page_id+'">'+page_id+'</option>')
            $('#'+this.id+"_page").selectpicker("refresh");
        }
        // menu folders for the select input
        else if (message.args.startsWith("gui/menu/")) {
            var folder_id = message.args.replace("gui/menu/", "")
            if (! folder_id.endsWith("_section")) return
            folder_id = folder_id.replace("/_section", "")
            if (folder_id in this.folders) return
            var folder = message.get_data()
            this.folders[folder_id] = folder
            $('#'+this.id+"_section_id").append('<option data-icon="fas fa-'+folder["icon"]+'" value="'+folder_id+'">'+folder["text"]+' ['+folder_id+']</option>')
            $('#'+this.id+"_section_id").selectpicker("refresh");
        }
    }
}