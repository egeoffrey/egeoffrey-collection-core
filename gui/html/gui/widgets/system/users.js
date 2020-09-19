// Users widget
class Users extends Widget {
    constructor(id, widget) {
        super(id, widget)
        // add an empty box into the given column
        this.add_large_box(this.id, this.widget["title"])
    }
    
    // draw the widget's content
    draw() {
        // IDs Template: _box, _title, _refresh, _popup, _body, _loading
        // IDs Widget: 
        var body = "#"+this.id+"_body"
        $(body).html("")
        $(body).append('\
            <ul class="nav nav-tabs" id="'+this.id+'_tabs" role="tablist">\
                </li>\
                <li class="nav-item">\
                    <a class="nav-link active" id="'+this.id+'_tab_users" data-toggle="pill" href="#'+this.id+'_tab_users_content"  role="tab" aria-controls="'+this.id+'_tab_users_content" aria-selected="false"><i class="fas fa-user"></i> Users</a>\
                </li>\
                <li class="nav-item">\
                    <a class="nav-link" id="'+this.id+'_tab_groups" data-toggle="pill" href="#'+this.id+'_tab_groups_content"  role="tab" aria-controls="'+this.id+'_tab_groups_content" aria-selected="false"><i class="fas fa-users"></i> Groups</a>\
                </li>\
            </ul>\
            <div class="tab-content text-left">\
                <div class="tab-pane fade show active" id="'+this.id+'_tab_users_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_users">\
                    <form method="POST" role="form" id="'+this.id+'_form_users" class="needs-validation" novalidate>\
                        <div class="row">\
                            <div class="col-3">\
                                <div class="nav flex-column nav-tabs" role="tablist" aria-orientation="vertical" id="'+this.id+'_users_tabs">\
                                </div>\
                            </div>\
                            <div class="col-9">\
                                <div class="tab-content" id="'+this.id+'_users_tab_content">\
                                </div>\
                            </div>\
                        </div>\
                        <div class="float-right">\
                          <button type="button" class="btn btn-default" id="'+this.id+'_users_new">New User</button>\
                          <button type="button" class="btn btn-default text-red" id="'+this.id+'_users_delete">Delete User</button>\
                          <button type="button" class="btn btn-primary" id="'+this.id+'_users_save">Save</button>\
                        </div>\
                    </form>\
                </div>\
                <div class="tab-pane fade" id="'+this.id+'_tab_groups_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_groups">\
                    <form method="POST" role="form" id="'+this.id+'_form_groups" class="needs-validation" novalidate>\
                        <div class="row">\
                            <div class="col-3">\
                                <div class="nav flex-column nav-tabs" role="tablist" aria-orientation="vertical" id="'+this.id+'_groups_tabs">\
                                </div>\
                            </div>\
                            <div class="col-9">\
                                <div class="tab-content" id="'+this.id+'_groups_tab_content">\
                                </div>\
                            </div>\
                        </div>\
                        <div class="float-right">\
                          <button type="button" class="btn btn-default" id="'+this.id+'_groups_new_user">Add User</button>\
                          <button type="button" class="btn btn-default" id="'+this.id+'_groups_new">New Group</button>\
                          <button type="button" class="btn btn-default text-red" id="'+this.id+'_groups_delete">Delete Group</button>\
                          <button type="button" class="btn btn-primary" id="'+this.id+'_groups_save">Save</button>\
                        </div>\
                    </form>\
                </div>\
            </div>\
        ')
        var id = this.id
        var this_class = this
        
        // configure users form
        var id = this.id
        var this_class = this
        $('#'+this.id+'_users_delete').unbind().click(function(this_class) {
            return function () {
                var username
                $("#"+this_class.id+"_users_tab_content > div").each(function(e){
                    // identify the selected tab/user
                    if (! $("#"+this.id).hasClass("active")) return
                    username = this.id.replace(id+"_users_", "").replace("_tab_content", "")
                });
                // delete the tab
                $("#"+this_class.id+'_users_'+username+'_tab').remove()
                $("#"+this_class.id+'_users_'+username+'_tab_content').remove()
                // select the first user left
                var first = true
                $("#"+this_class.id+"_users_tabs > a").each(function(e){
                    if (! first) return
                    if (first) $("#"+this.id).trigger("click")
                });
            };
        }(this))
        $('#'+this.id+'_users_new').unbind().click(function(this_class) {
            return function () {
                // ask the fhe username
                bootbox.prompt("Type in the username of the new user", function(result){ 
                    if (result == null) return
                    var username = result
                    // add a new tab and focus on it
                    this_class.add_user(username, {fullname: "", icon: "", password: ""}, false)
                    $("#"+this_class.id+'_users_'+username+'_tab').trigger("click")
                });
            };
        }(this))
        $('#'+this.id+'_form_users').on('submit', function (e) {
            // form is validated
            if ($('#'+this_class.id+'_form_users')[0].checkValidity()) {
                // build up the configuration file
                var users = {}
                $("#"+this_class.id+"_users_tabs > a").each(function(e){
                    // for each username
                    var username = this.id.replace(id+"_users_", "").replace("_tab", "")
                    users[username] = {}
                    for (var key of ["fullname", "icon", "password"]) {
                        var value = $("#"+id+'_user_'+username+'_'+key).val()
                        if (value != null && value != "") users[username][key] = $.isNumeric(value) ? parseFloat(value) : value
                    }
                });
                // save configuration
                var message = new Message(gui)
                message.recipient = "controller/config"
                message.command = "SAVE"
                message.args = "gui/users"
                message.config_schema = gui.users_config_schema
                message.set_data(users)
                gui.send(message)
                // close the modal
                gui.notify("success","Users saved successfully")
                return false
            }
            else {
                e.preventDefault();
                e.stopPropagation();
            }
            $('#'+this_class.id+'_form_users').addClass("was-validated")
        })
        $('#'+this.id+'_users_save').unbind().click(function(this_class) {
            return function () {
                $("#"+this_class.id+"_form_users").submit()
            };
        }(this))
        
        // configure groups form
        var id = this.id
        var this_class = this
        $('#'+this.id+'_groups_delete').unbind().click(function(this_class) {
            return function () {
                var groupname
                // identify the selected group
                $("#"+this_class.id+"_groups_tab_content > div").each(function(e){
                    if (! $("#"+this.id).hasClass("active")) return
                    groupname = this.id.replace(id+"_groups_", "").replace("_tab_content", "")
                });
                // delete the tab
                $("#"+id+'_groups_'+groupname+'_tab').remove()
                $("#"+id+'_groups_'+groupname+'_tab_content').remove()
                // select the first user left
                var first = true
                $("#"+this_class.id+"_groups_tabs > a").each(function(e){
                    if (! first) return
                    if (first) $("#"+this.id).trigger("click")
                });
            };
        }(this))
        $('#'+this.id+'_groups_new').unbind().click(function(this_class) {
            return function () {
                // ask the fhe groupname
                bootbox.prompt("Type in the name of the new group", function(result){ 
                    if (result == null) return
                    var groupname = result
                    // add a new tab and focus on it
                    this_class.add_group(groupname, [], false)
                    $("#"+this_class.id+'_groups_'+groupname+'_tab').trigger("click")
                });
            };
        }(this))
        $('#'+this.id+'_groups_new_user').unbind().click(function(this_class) {
            return function () {
                var groupname
                // identify the selected group
                $("#"+this_class.id+"_groups_tab_content > div").each(function(e){
                    if (! $("#"+this.id).hasClass("active")) return
                    groupname = this.id.replace(id+"_groups_", "").replace("_tab_content", "")
                });
                this_class.add_user_to_group(groupname, "")
            };
        }(this))
        $('#'+this.id+'_form_groups').on('submit', function (e) {
            // form is validated
            if ($('#'+this_class.id+'_form_groups')[0].checkValidity()) {
                // build up the configuration file
                var groups = {}
                $("#"+this_class.id+"_groups_tabs > a").each(function(e){
                    // for each groupname
                    var groupname = this.id.replace(id+"_groups_", "").replace("_tab", "")
                    groups[groupname] = []
                    $("#"+this_class.id+"_groups_"+groupname+"_tab_content :input").each(function(e){
                        var value = $("#"+this.id).val()
                        if (value == "") return
                        groups[groupname].push(value)
                    });
                });
                // save configuration
                var message = new Message(gui)
                message.recipient = "controller/config"
                message.command = "SAVE"
                message.args = "gui/groups"
                message.config_schema = gui.groups_config_schema
                message.set_data(groups)
                gui.send(message)
                // close the modal
                gui.notify("success","Groups saved successfully")
                return false
            }
            else {
                e.preventDefault();
                e.stopPropagation();
            }
            $('#'+this_class.id+'_form_groups').addClass("was-validated")
        })
        $('#'+this.id+'_groups_save').unbind().click(function(this_class) {
            return function () {
                $("#"+this_class.id+"_form_groups").submit()
            };
        }(this))
        
        // request data
        this.add_configuration_listener("gui/users", gui.users_config_schema)
        this.add_configuration_listener("gui/groups", gui.groups_config_schema)
    }
    
        
    // close the widget
    close() {
    }    
    
    // receive data and load it into the widget
    on_message(message) {
    }
    
    // add a new user
    add_user(username, user, active) {
        var is_active = active ? "active" : ""
        var selected = active ? "true" : "false"
        var tab = '\
            <a class="nav-link '+is_active+'" id="'+this.id+'_users_'+username+'_tab" data-toggle="pill" href="#'+this.id+'_users_'+username+'_tab_content" role="tab" aria-controls="'+this.id+'_users_'+username+'_tab_content" aria-selected="'+selected+'">'+username+'</a>\
        '
        $("#"+this.id+"_users_tabs").append(tab)
        var is_active = active ? "show active" : ""
        var password = user["password"] != null ? user["password"] : "" 
        var tab_content = '\
            <div class="tab-pane fade '+is_active+'" id="'+this.id+'_users_'+username+'_tab_content" role="tabpanel" aria-labelledby="'+this.id+'_users_'+username+'_tab">\
                <div class="form-group">\
                    <label>Fullname*</label>\
                    <input type="text" id="'+this.id+'_user_'+username+'_fullname" class="form-control" placeholder="Name Surname" value="'+user["fullname"]+'" required>\
                </div>\
                <div class="form-group">\
                    <label>Icon</label>\
                    <select id="'+this.id+'_user_'+username+'_icon" class="form-control"></select>\
                </div>\
                <div class="form-group">\
                    <label>Password</label>\
                    <input type="password" id="'+this.id+'_user_'+username+'_password" class="form-control" value="'+password+'">\
                </div>\
            </div>\
        '
        $("#"+this.id+"_users_tab_content").append(tab_content)
        gui.select_icon(this.id+'_user_'+username+'_icon')
        $("#"+this.id+'_user_'+username+'_icon').selectpicker("val", user["icon"])
    }
    
    // add a new group
    add_group(groupname, group, active) {
        var is_active = active ? "active" : ""
        var selected = active ? "true" : "false"
        var tab = '\
            <a class="nav-link '+is_active+'" id="'+this.id+'_groups_'+groupname+'_tab" data-toggle="pill" href="#'+this.id+'_groups_'+groupname+'_tab_content" role="tab" aria-controls="'+this.id+'_groups_'+groupname+'_tab_content" aria-selected="'+selected+'">'+groupname+'</a>\
        '
        $("#"+this.id+"_groups_tabs").append(tab)
        var is_active = active ? "show active" : ""
        var tab_content = '\
            <div class="tab-pane fade '+is_active+'" id="'+this.id+'_groups_'+groupname+'_tab_content" role="tabpanel" aria-labelledby="'+this.id+'_groups_'+groupname+'_tab">\
            </div>\
        '
        $("#"+this.id+"_groups_tab_content").append(tab_content)
        for (var username of group) {
            this.add_user_to_group(groupname, username)
        }
    }
    
    // add a user to a group
    add_user_to_group(groupname, username) {
        var i = Math.floor(Math.random() * 100)
        var html = '\
            <div class="row" id="'+this.id+'_group_'+groupname+'_row_'+i+'">\
                <div class="col-11">\
                    <input type="text" id="'+this.id+'_group_'+groupname+'_user_'+i+'" class="form-control" placeholder="username" value="'+username+'" required>\
                </div>\
                <div class="col-1">\
                    <button type="button" id="'+this.id+'_group_'+groupname+'_remove_'+i+'" class="btn btn-default">\
                        <i class="fas fa-times text-red"></i>\
                    </button>\
                </div>\
            </div>\
        '
        $("#"+this.id+'_groups_'+groupname+'_tab_content').append(html)
        // configure remove button
        $("#"+this.id+'_group_'+groupname+'_remove_'+i).unbind().click(function(this_class) {
            return function () {
                $("#"+this_class.id+'_group_'+groupname+'_row_'+i).remove()
            };
        }(this));
    }
    
    // receive configuration
    on_configuration(message) {
        // receiving users configuration
        if (message.args == "gui/users") {
            var data = message.get_data()
            // populate the form
            var first = true
            $("#"+this.id+"_users_tabs").empty()
            $("#"+this.id+"_users_tab_content").empty()
            for (var username in data) {
                this.add_user(username, data[username], first)
                if (first) first = false
            }
        }
        // receiving groups configuration
        else if (message.args == "gui/groups") {
            var data = message.get_data()
            // populate the form
            var first = true
            $("#"+this.id+"_groups_tabs").empty()
            $("#"+this.id+"_groups_tab_content").empty()
            for (var groupname in data) {
                this.add_group(groupname, data[groupname], first)
                if (first) first = false
            }
        }
    }
}