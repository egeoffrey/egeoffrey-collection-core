// setup widget
class Setup extends Widget {
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
                <li class="nav-item">\
                    <a class="nav-link active" id="'+this.id+'_tab_house" data-toggle="pill" href="#'+this.id+'_tab_house_content" role="tab" aria-controls="'+this.id+'_tab_house_content" aria-selected="true"><i class="fas fa-home"></i> House</a>\
                </li>\
                <li class="nav-item">\
                    <a class="nav-link" id="'+this.id+'_tab_gui" data-toggle="pill" href="#'+this.id+'_tab_gui_content"  role="tab" aria-controls="'+this.id+'_tab_gui_content" aria-selected="false"><i class="fas fa-columns"></i> Web Interface</a>\
                </li>\
            </ul>\
            <div class="tab-content text-left">\
                <div class="tab-pane fade show active" id="'+this.id+'_tab_house_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_house">\
                    <form method="POST" role="form" id="'+this.id+'_form_house" class="needs-validation" novalidate>\
                        <div class="form-group">\
                            <label>Name of your House - used in notifications and as web interface title*</label>\
                            <input type="text" id="'+this.id+'_house_name" class="form-control" placeholder="House Name" required>\
                        </div>\
                        <div class="form-group">\
                            <label>UTC Offset - used to run your rules or poll your sensors at the right time* (<a target="_blank" href="https://www.timeanddate.com/">find out your timezone offset</a>)</label>\
                            <select id="'+this.id+'_house_timezone" class="form-control" required>\
                                <option value="-12">-12:00</option>\
                                <option value="-11">-11:00</option>\
                                <option value="-10">-10:00</option>\
                                <option value="-9">-09:00</option>\
                                <option value="-8">-08:00</option>\
                                <option value="-7">-07:00</option>\
                                <option value="-6">-06:00</option>\
                                <option value="-5">-05:00</option>\
                                <option value="-4">-04:00</option>\
                                <option value="-3">-03:00</option>\
                                <option value="-2">-02:00</option>\
                                <option value="-1">-01:00</option>\
                                <option value="1">+01:00</option>\
                                <option value="2">+02:00</option>\
                                <option value="3">+03:00</option>\
                                <option value="4">+04:00</option>\
                                <option value="5">+05:00</option>\
                                <option value="6">+06:00</option>\
                                <option value="7">+07:00</option>\
                                <option value="8">+08:00</option>\
                                <option value="9">+09:00</option>\
                                <option value="10">+10:00</option>\
                                <option value="11">+11:00</option>\
                                <option value="12">+12:00</option>\
                                <option value="13">+13:00</option>\
                                <option value="14">+14:00</option>\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Language* - used for localizing the information coming from your services</label>\
                            <input type="text" id="'+this.id+'_house_language" class="form-control" placeholder="en" required>\
                        </div>\
                        <div class="form-group">\
                            <label>Units* - used for providing you the measures in the right format</label>\
                            <select id="'+this.id+'_house_units" class="form-control" required>\
                                <option value="metric">Metric (e.g. °C, km, etc.)</option>\
                                <option value="imperial">Imperial (e.g. °F, miles, etc.)</option>\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Latitude* - used by e.g. weather and earthquake services (<a target="_blank" href="https://gps-coordinates.org/">find out my position</a>)</label>\
                            <input type="text" id="'+this.id+'_house_latitude" class="form-control" placeholder="48.85" required>\
                        </div>\
                        <div class="form-group">\
                            <label>Longitude* - used by e.g. weather and earthquake services (<a target="_blank" href="https://gps-coordinates.org/">find out my position</a>)</label>\
                            <input type="text" id="'+this.id+'_house_longitude" class="form-control" placeholder="2.35" required>\
                        </div>\
                        <div class="float-right">\
                          <button type="button" class="btn btn-primary" id="'+this.id+'_house_save">Save</button>\
                        </div>\
                    </form>\
                </div>\
                <div class="tab-pane fade" id="'+this.id+'_tab_gui_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_gui">\
                    <form method="POST" role="form" id="'+this.id+'_form_gui" class="needs-validation" novalidate>\
                        <div class="form-group">\
                            <label>Default Page*</label>\
                            <input type="text" id="'+this.id+'_gui_default_page" class="form-control" placeholder="overview/welcome" required>\
                        </div>\
                        <div class="form-group">\
                            <label>Map API Key - used by the Map widget to draw interactive maps (<a target="_blank" href="http://developers.google.com/maps/documentation/embed/get-api-key">get it from here</a>)</label>\
                            <input type="text" id="'+this.id+'_gui_map_api_key" class="form-control">\
                        </div>\
                        <div class="form-check">\
                            <input type="checkbox" id="'+this.id+'_gui_check_for_updates" class="form-check-input">\
                            <label>Check for updates at login</label>\
                        </div>\
                        <div class="form-check">\
                            <input type="checkbox" id="'+this.id+'_gui_collapsed_sidebar" class="form-check-input">\
                            <label>Keep the sidebar collapsed for full-width pages</label>\
                        </div>\
                        <div class="form-check">\
                            <input type="checkbox" id="'+this.id+'_gui_live_feed" class="form-check-input">\
                            <label>Live Feed - show notifications for every new measure coming from sensors</label>\
                        </div>\
                        <div class="float-right">\
                          <button type="button" class="btn btn-primary" id="'+this.id+'_gui_save">Save</button>\
                        </div>\
                    </form>\
                </div>\
            </div>\
        ')
        var id = this.id
        var this_class = this
        
        // configure house form
        $('#'+this.id+'_form_house').on('submit', function (e) {
            // form is validated
            if ($('#'+this_class.id+'_form_house')[0].checkValidity()) {
                // build up the configuration file
                var configuration = {}
                $("#"+this_class.id+"_form_house :input").each(function(e){
                    var item = this.id.replace(this_class.id+"_house_", "")
                    var value = this.value
                    if (value != null && value != "") configuration[item] = $.isNumeric(value) ? parseFloat(value) : value
                });
                // save configuration
                var message = new Message(gui)
                message.recipient = "controller/config"
                message.command = "SAVE"
                message.args = "house"
                message.config_schema = gui.supported_house_config_schema
                message.set_data(configuration)
                gui.send(message)
                // close the modal
                gui.notify("success","House configuration saved successfully")
                return false
            }
            else {
                e.preventDefault();
                e.stopPropagation();
            }
            $('#'+this_class.id+'_form_house').addClass("was-validated")
        })
        $('#'+this.id+'_house_save').unbind().click(function(this_class) {
            return function () {
                $("#"+this_class.id+"_form_house").submit()
            };
        }(this))
        
        // configure gui form
        $('#'+this.id+'_form_gui').on('submit', function (e) {
            // form is validated
            if ($('#'+this_class.id+'_form_gui')[0].checkValidity()) {
                // build up the configuration file
                var configuration = {}
                $("#"+this_class.id+"_form_gui :input").each(function(e){
                    var item = this.id.replace(this_class.id+"_gui_", "")
                    if (this.value != null && this.value != "") {
                        if (this.type == "checkbox") configuration[item] = this.checked
                        else if ($.isNumeric(this.value)) configuration[item] = parseFloat(this.value)
                        else configuration[item] = this.value
                    }
                });
                // save configuration
                var message = new Message(gui)
                message.recipient = "controller/config"
                message.command = "SAVE"
                message.args = "gui/settings"
                message.config_schema = gui.settings_config_schema
                message.set_data(configuration)
                gui.send(message)
                // close the modal
                gui.notify("success","Web Interface configuration saved successfully")
                return false
            }
            else {
                e.preventDefault();
                e.stopPropagation();
            }
            $('#'+this_class.id+'_form_gui').addClass("was-validated")
        })
        $('#'+this.id+'_gui_save').unbind().click(function(this_class) {
            return function () {
                $("#"+this_class.id+"_form_gui").submit()
            };
        }(this))
        
        // request data
        this.add_configuration_listener("house", gui.supported_house_config_schema)
        this.add_configuration_listener("gui/settings", gui.settings_config_schema)
    }
    
        
    // close the widget
    close() {
    }    
    
    // receive data and load it into the widget
    on_message(message) {
    }
    
    // receive configuration
    on_configuration(message) {
        // receiving house configuration
        if (message.args == "house") {
            var data = message.get_data()
            // populate the form
            for (var configuration of ["name", "timezone", "language", "units", "latitude", "longitude"]) {
                $("#"+this.id+"_house_"+configuration).val(data[configuration])
            }
        }
        // receiving gui configuration
        else if (message.args == "gui/settings") {
            var data = message.get_data()
            // populate the form
            for (var configuration of ["default_page", "map_api_key"]) {
                $("#"+this.id+"_gui_"+configuration).val(data[configuration])
            }
            for (var configuration of ["check_for_updates", "live_feed", "collapsed_sidebar"]) {
                if (configuration in data) {
                    $("#"+this.id+"_gui_"+configuration).prop("checked", data["configuration"])
                }
            }
        }
    }
}