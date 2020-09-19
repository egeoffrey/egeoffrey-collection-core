// handle the left menu

class Menu extends Widget {
    constructor(id) {
        super(id, {})
        this.folders = []
        this.entries = {}
        this.listener = null
        this.persistent = true
        this.refresh_scheduled = false
        // welcome menu
        this.welcome_folders = []
        this.welcome_entries = {}
        this.welcome_folders[0] = { text: "Welcome", order: 0, section_id: "__welcome", icon: "concierge-bell"}
        this.welcome_entries["__welcome"] = []
        this.welcome_entries["__welcome"].push({section_id: "__welcome",  order: 0, entry_id: "__welcome", text: "Getting Started", icon: "book-open", page: "__welcome"})
        this.welcome_entries["__welcome"].push({section_id: "__welcome",  order: 1, entry_id: "__chatbot", text: "Chatbot", icon: "robot", page: "__chatbot"})
        this.welcome_entries["__welcome"].push({section_id: "__welcome",  order: 2, entry_id: "__notifications", text: "Notifications", icon: "comments", page: "__notifications"})
        this.welcome_entries["__welcome"].push({section_id: "__welcome",  order: 3, entry_id: "__measures", text: "Feed", icon: "exchange-alt", page: "__measures"})
        // house admin menu
        this.house_admin_folders = []
        this.house_admin_entries = {}
        this.house_admin_folders[0] = { text: "House", order: 0, section_id: "__house_admin", icon: "user-shield"}
        this.house_admin_entries["__house_admin"] = []
        this.house_admin_entries["__house_admin"].push({section_id: "__house_admin",  order: 0, entry_id: "setup", text: "Setup", icon: "home", page: "__setup"})
        this.house_admin_entries["__house_admin"].push({section_id: "__house_admin",  order: 1, entry_id: "sensors", text: "Sensors", icon: "microchip", page: "__sensors"})
        this.house_admin_entries["__house_admin"].push({section_id: "__house_admin",  order: 2, entry_id: "rules", text: "Rules", icon: "cogs", page: "__rules"})
        this.house_admin_entries["__house_admin"].push({section_id: "__house_admin",  order: 3, entry_id: "pages", text: "Pages", icon: "columns", page: "__pages"})
        this.house_admin_entries["__house_admin"].push({section_id: "__house_admin",  order: 4, entry_id: "menu", text: "Menu", icon: "sitemap", page: "__menu"})
        this.house_admin_entries["__house_admin"].push({section_id: "__house_admin",  order: 5, entry_id: "users", text: "Users", icon: "users", page: "__users"})
        // egeoffrey admin menu
        this.egeoffrey_admin_folders = []
        this.egeoffrey_admin_entries = {}
        this.egeoffrey_admin_folders[0] = { text: "eGeoffrey", order: 0, section_id: "__egeoffrey_admin", icon: "toolbox"}
        this.egeoffrey_admin_entries["__egeoffrey_admin"] = []
        this.egeoffrey_admin_entries["__egeoffrey_admin"].push({section_id: "__egeoffrey_admin",  order: 0, entry_id: "packages", text: "Packages", icon: "cubes", page: "__packages"})
        this.egeoffrey_admin_entries["__egeoffrey_admin"].push({section_id: "__egeoffrey_admin",  order: 1, entry_id: "modules", text: "Modules", icon: "server", page: "__modules"})
        this.egeoffrey_admin_entries["__egeoffrey_admin"].push({section_id: "__egeoffrey_admin",  order: 2, entry_id: "marketplace", text: "Marketplace", icon: "shopping-cart", page: "__marketplace", url: "https://marketplace.egeoffrey.com"})
        this.egeoffrey_admin_entries["__egeoffrey_admin"].push({section_id: "__egeoffrey_admin",  order: 3, entry_id: "logs", text: "Logs", icon: "align-justify", page: "__logs"})
        this.egeoffrey_admin_entries["__egeoffrey_admin"].push({section_id: "__egeoffrey_admin",  order: 4, entry_id: "database", text: "Database", icon: "database", page: "__database"})
        this.egeoffrey_admin_entries["__egeoffrey_admin"].push({section_id: "__egeoffrey_admin",  order: 5, entry_id: "gateway", text: "Gateway", icon: "project-diagram", page: "__gateway"})
        this.egeoffrey_admin_entries["__egeoffrey_admin"].push({section_id: "__egeoffrey_admin",  order: 6, entry_id: "configuration", text: "Advanced Editor", icon: "edit", page: "__configuration"})
        // help menu
        this.help_folders = []
        this.help_entries = {}
        this.help_folders[0] = { text: "Help", order: 0, section_id: "__help", icon: "question-circle"}
        this.help_entries["__help"] = []
        this.help_entries["__help"].push({section_id: "__help",  order: 0, entry_id: "__docs", text: "Docs", icon: "book-open", url: "https://docs.egeoffrey.com", page: "__docs"})
        this.help_entries["__help"].push({section_id: "__help",  order: 0, entry_id: "__forum", text: "Forum", icon: "comments", url: "https://forum.egeoffrey.com", page: "__forum"})
        this.help_entries["__help"].push({section_id: "__help",  order: 0, entry_id: "__developer", text: "Developers", icon: "code", url: "https://developer.egeoffrey.com", page: "__developer"})
        
    }
    
    // draw the widget's content
    draw() {
        // get the menu contents
        this.listener = this.add_configuration_listener("gui/menu/#", gui.menu_config_schema)
    }
    
    // redraw the menu
    redraw() {
        if (this.listener == null) return
        this.folders = []
        this.entries = {}
        this.remove_listener(this.listener)
        this.draw()
    }
    
    // add menu section to the menu
    add_menu_section(section) {
        $("#"+this.id).append('<li class="nav-header">'+section+'</li>')
    }
    
    // add menu folders to the menu
    add_menu_folders(folders, entries, examples=false){
        // draw the menu
        for (var folder of folders) {
            if (folder == null) continue
            if (! (folder["section_id"] in entries)) continue
            // show only the examples
            if (examples && ! folder["section_id"].includes("examples")) continue
            // show everything but examples
            if (! examples && folder["section_id"].includes("examples")) continue
            // add the folder
            var folder_icon = "icon" in folder ? "fas fa-"+folder["icon"] : "far fa-circle"
            var folder_html = '\
                <li class="nav-item has-treeview" id="menu_section_'+folder["section_id"]+'_tree">\
                    <a href="#" class="nav-link" id="menu_section_'+folder["section_id"]+'_name">\
                        <input type="text" value="'+folder["section_id"]+'" class="d-none" id="menu_section_'+folder["section_id"]+'_id">\
                        <i class="'+folder_icon+' nav-icon" id="menu_section_'+folder["section_id"]+'_icon"></i> \
                        <p>\
                            '+folder["text"]+'\
                            <i class="fa fa-angle-left right" id="menu_section_'+folder["section_id"]+'_arrow"></i>\
                        </p>\
                    </a>\
                    <ul class="nav nav-treeview" id="menu_section_'+folder["section_id"]+'">\
                    </ul>\
                </li>'
            $("#"+this.id).append(folder_html)
            // add the entries to the folder
            var items = 0
            for (var entry of entries[folder["section_id"]]) {
                if (entry == null) continue
                if (entry["section_id"] != folder["section_id"]) continue
                // add the entry to the menu
                if ("allow" in entry && ! gui.is_authorized(entry["allow"])) continue
                this.add_menu_item(entry)
                items++
            }
            // hide the folder if it has no items
            if (items == 0) $("#menu_section_"+entry["section_id"]).addClass("d-none")
        }
    }
    
    // add a menu item to the menu
    add_menu_item(entry, add_to_folder=true) {
        var selected = null
        // check if the user selected already a page
        if (location.hash != null) selected = location.hash.replace('#','')
        // add the entry
        var page_tag = entry["page"].replaceAll("/","_")
        var tag = add_to_folder ? "#menu_section_"+entry["section_id"] : "#"+this.id
        var href = "url" in entry ? entry["url"] : "#"+entry["page"]
        var target = "url" in entry ? "target=_blank" : ""
        $(tag).append('\
        <li class="nav-item">\
            <a class="nav-link" id="menu_user_item_'+page_tag+'" href="'+href+'" '+target+'>&nbsp;\
                <input type="text" value="'+entry["section_id"]+'/'+entry["entry_id"]+'" class="d-none" id="menu_user_item_'+page_tag+'_id">\
                <i class="nav-icon fas fa-'+entry["icon"]+'" id="menu_user_item_'+page_tag+'_icon"></i>\
                <p>'+capitalizeFirst(entry["text"])+'</p>\
            </a>\
        </li>');
        // open the page on click
        if (! ("url" in entry)) {
            $("#menu_user_item_"+page_tag).unbind().click(function(page, folder_id, page_tag){
                return function () {
                    // if clicking on the current page, explicitly reload it since hash will not change
                    if (location.hash.replace("#","") == page) gui.load_page(page)
                    window.scrollTo(0,0)
                    // close active folder
                    $("#menu li").removeClass("active menu-open")
                    // remove active folder
                    $("#menu li a").removeClass("active")
                    // open new folder
                    $("#menu_section_"+folder_id+"_tree").addClass("active menu-open")
                    // make new section as active
                    $("#menu_section_"+folder_id+"_name").addClass("active")
                    // set item as active
                    $("#menu_user_item_"+page_tag).addClass("active")
                    // collapse the sidebar if open on mobile
                    if ($("body").hasClass('sidebar-open')) $("body").removeClass('sidebar-open').removeClass('sidebar-collapse').trigger('collapsed.pushMenu');
                }
            }(entry["page"], entry["section_id"], page_tag));
        }
        // open up the folder containing the selected menu item
        if (selected != null && selected == entry["page"]) {
            // set folder as active
            $("#menu_section_"+entry["section_id"]+"_name").addClass("active")
            // open the section menu
            $("#menu_section_"+entry["section_id"]+"_tree").addClass("active menu-open")
            // set item as active
            $("#menu_user_item_"+page_tag).addClass("active")
        }
    }
    
    // refresh the menu
    refresh() {
        $("#"+this.id).empty()
        this.add_menu_folders(this.welcome_folders, this.welcome_entries)
        this.add_menu_folders(this.folders, this.entries, true)
        this.add_menu_section("MY PLACE")
        this.add_menu_folders(this.folders, this.entries)
        if (gui.is_authorized(["house_admins"]) || gui.is_authorized(["egeoffrey_admins"])) {
            this.add_menu_section("ADMINISTRATION")
            if (gui.is_authorized(["house_admins"])) this.add_menu_folders(this.house_admin_folders, this.house_admin_entries)
            if (gui.is_authorized(["egeoffrey_admins"])) this.add_menu_folders(this.egeoffrey_admin_folders, this.egeoffrey_admin_entries)
        }
        this.add_menu_section("")
        this.add_menu_folders(this.help_folders, this.help_entries)
        this.refresh_scheduled = false
    }
    
    // receive data and load it into the widget
    on_message(message) {
    }
    
    // receive configuration
    on_configuration(message) {
        if (message.config_schema != gui.menu_config_schema) {
            return false
        }
        if (message.args.endsWith("_section")) {
            var folder_id = message.args.replace("gui/menu/","").replace("/_section","")
            var folder = message.get_data()
            folder["section_id"] = folder_id
            var is_existing_folder = false
            // if there is another folder with the same name name, update it
            for (var existing_folder of this.folders) {
                if (existing_folder == null) continue
                if (existing_folder["section_id"] == folder["section_id"]) {
                    is_existing_folder = true
                    folder["order"] = existing_folder["order"]
                    break
                }
            }
            // if there is another folder in the same position, shift this ahead
            if (! is_existing_folder) {
                while (this.folders[folder["order"]] != null) folder["order"]++
            }
            this.folders[folder["order"]] = folder
        }
        else {
            var split = message.args.replace("gui/menu/","").split("/")
            var folder_id = split[0]
            var entry_id = split[1]
            var entry = message.get_data()
            entry["entry_id"] = entry_id
            entry["section_id"] = folder_id
            // this is the first entry in the folder
            var is_existing_entry = false
            if (! (folder_id in this.entries)) this.entries[folder_id] = []
            else {
                // if there is already another entry in this folder with the same name name, update it
                for (var existing_entry of this.entries[folder_id]) {
                    if (existing_entry == null) continue
                    if (existing_entry["entry_id"] == entry["entry_id"]) {
                        is_existing_entry = true
                        entry["order"] = existing_entry["order"]
                        break
                    }
                }
                // if there is another entry in the same position, shift this ahead
                if (! is_existing_entry) {
                    while (this.entries[folder_id][entry["order"]] != null) entry["order"]++
                }
            }
            this.entries[folder_id][entry["order"]] = entry
        }
        // to avoid recreating the menu upon the receiving of every item, let's schedule its refresh in a short while
        if (! this.refresh_scheduled) {
            this.refresh_scheduled = true
            setTimeout(function(this_class) {
                return function() {
                this_class.refresh()
                };
            }(this), 500);
        }
    }
}