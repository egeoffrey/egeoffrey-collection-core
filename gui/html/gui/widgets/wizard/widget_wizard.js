// widget wizard
class Widget_wizard extends Widget {
    constructor(id, widget, page) {
        super(id, widget)
        this.page = page
        this.sensor_tags = {
            "summary": ["icon_sensor"],
            "range": ["sensor"], 
            "value": ["sensor", "timestamp_sensor", "icon_sensor"], 
            "status": ["sensor", "timestamp_sensor"], 
            "control": ["sensor", "timestamp_sensor", "icon_sensor"], 
            "input": ["sensor", "timestamp_sensor", "icon_sensor"], 
            "button": ["icon_sensor"], 
            "calendar": ["sensor"], 
            "image": ["sensor"], 
            "text": ["sensor"], 
            "table": ["sensor"], 
            "counter": ["sensor"], 
            "tasks": ["sensor"], 
            "slider": ["sensor"], 
            "heartbeat": ["sensor"]
        }
        this.color_tags = {
            "summary": ["color"],
            "value": ["color"],
            "status": ["color_on", "color_off"], 
            "control": ["color", "color_on", "color_off"], 
            "input": ["color"], 
            "button": ["color"], 
            "counter": ["color"], 
            "slider": ["color"], 
        }
        $("#waiting_body").html('<i class="fas fa-spin fa-spinner"></i> Loading...')
        $("#waiting").modal()
    }
    
    // draw the widget's content
    draw(row=null) {
        // clear up the modal
        $("#wizard_body").html("")
        $("#wizard_title").html("Widget Configuration")
        // build the form
        $("#wizard_body").append('\
            <form method="POST" role="form" id="'+this.id+'_form" class="needs-validation" novalidate>\
                <ul class="nav nav-tabs" id="'+this.id+'_tabs" role="tablist">\
                    <li class="nav-item">\
                        <a class="nav-link active" id="'+this.id+'_tab_general" data-toggle="pill" href="#'+this.id+'_tab_general_content" role="tab" aria-controls="'+this.id+'_tab_general_content" aria-selected="true">General</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_summary" data-toggle="pill" href="#'+this.id+'_tab_summary_content"  role="tab" aria-controls="'+this.id+'_tab_summary_content" aria-selected="false">Widget Summary</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_timeline" data-toggle="pill" href="#'+this.id+'_tab_timeline_content"  role="tab" aria-controls="'+this.id+'_tab_timeline_content" aria-selected="false">Widget Timeline</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_range" data-toggle="pill" href="#'+this.id+'_tab_range_content"  role="tab" aria-controls="'+this.id+'_tab_range_content" aria-selected="false">Widget Range</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_value" data-toggle="pill" href="#'+this.id+'_tab_value_content"  role="tab" aria-controls="'+this.id+'_tab_value_content" aria-selected="false">Widget Value</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_status" data-toggle="pill" href="#'+this.id+'_tab_status_content"  role="tab" aria-controls="'+this.id+'_tab_status_content" aria-selected="false">Widget Status</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_control" data-toggle="pill" href="#'+this.id+'_tab_control_content"  role="tab" aria-controls="'+this.id+'_tab_control_content" aria-selected="false">Widget Control</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_input" data-toggle="pill" href="#'+this.id+'_tab_input_content"  role="tab" aria-controls="'+this.id+'_tab_input_content" aria-selected="false">Widget Input</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_button" data-toggle="pill" href="#'+this.id+'_tab_button_content"  role="tab" aria-controls="'+this.id+'_tab_button_content" aria-selected="false">Widget Button</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_calendar" data-toggle="pill" href="#'+this.id+'_tab_calendar_content"  role="tab" aria-controls="'+this.id+'_tab_calendar_content" aria-selected="false">Widget Calendar</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_image" data-toggle="pill" href="#'+this.id+'_tab_image_content"  role="tab" aria-controls="'+this.id+'_tab_image_content" aria-selected="false">Widget Image</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_map" data-toggle="pill" href="#'+this.id+'_tab_map_content"  role="tab" aria-controls="'+this.id+'_tab_map_content" aria-selected="false">Widget Map</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_text" data-toggle="pill" href="#'+this.id+'_tab_text_content"  role="tab" aria-controls="'+this.id+'_tab_text_content" aria-selected="false">Widget Text</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_table" data-toggle="pill" href="#'+this.id+'_tab_table_content"  role="tab" aria-controls="'+this.id+'_tab_table_content" aria-selected="false">Widget Table</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_counter" data-toggle="pill" href="#'+this.id+'_tab_counter_content"  role="tab" aria-controls="'+this.id+'_tab_counter_content" aria-selected="false">Widget Counter</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_tasks" data-toggle="pill" href="#'+this.id+'_tab_tasks_content"  role="tab" aria-controls="'+this.id+'_tab_tasks_content" aria-selected="false">Widget Tasks</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_logs" data-toggle="pill" href="#'+this.id+'_tab_logs_content"  role="tab" aria-controls="'+this.id+'_tab_logs_content" aria-selected="false">Widget Logs</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_notifications" data-toggle="pill" href="#'+this.id+'_tab_notifications_content"  role="tab" aria-controls="'+this.id+'_tab_notifications_content" aria-selected="false">Widget Notifications</a>\
                    </li>\
                    \
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_slider" data-toggle="pill" href="#'+this.id+'_tab_slider_content"  role="tab" aria-controls="'+this.id+'_tab_slider_content" aria-selected="false">Widget Slider</a>\
                    </li>\
                    <li class="nav-item d-none">\
                        <a class="nav-link" id="'+this.id+'_tab_heartbeat" data-toggle="pill" href="#'+this.id+'_tab_heartbeat_content"  role="tab" aria-controls="'+this.id+'_tab_heartbeat_content" aria-selected="false">Widget Heartbeat</a>\
                    </li>\
                    \
                    <li class="nav-item">\
                        <a class="nav-link" id="'+this.id+'_tab_permissions" data-toggle="pill" href="#'+this.id+'_tab_permissions_content"  role="tab" aria-controls="'+this.id+'_tab_permissions_content" aria-selected="false">Permissions</a>\
                    </li>\
                    \
                </ul>\
                <div class="tab-content">\
                    <div class="tab-pane fade show active" id="'+this.id+'_tab_general_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_general">\
                        <div class="form-group">\
                            <label>Title*</label>\
                            <input type="text" id="'+this.id+'_general_title" value="" class="form-control" placeholder="title of the widget">\
                        </div>\
                        <div class="form-group">\
                            <label>Size of the widget*</label>\
                            <select id="'+this.id+'_general_size" class="form-control" required>\
                                <option value="1">1</option>\
                                <option value="2">2</option>\
                                <option value="3">3</option>\
                                <option value="4">4</option>\
								<option value="5">5</option>\
                                <option value="6">6</option>\
                                <option value="7">7</option>\
                                <option value="8">8</option>\
                                <option value="9">9</option>\
                                <option value="10">10</option>\
                                <option value="11">11</option>\
                                <option value="12">12</option>\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Widget Type*</label>\
                            <select id="'+this.id+'_general_widget" class="form-control" required>\
                                <option value=""></option>\
                                <option value="summary">Summary - display the latest value together with min/max of yesterday/today</option>\
                                <option value="value">Value - display the latest value of a sensor</option>\
                                <option value="timeline">Timeline - display a timeline chart</option>\
                                <option value="range">Range - display a chart with min and max values</option>\
                                <option value="status">Status - display an on/off status</option>\
                                <option value="control">Control an on/off switch</option>\
                                <option value="input">Input - display an input box</option>\
                                <option value="button">Button - display a button and associate actions</option>\
                                <option value="calendar">Calendar - display a calendar for scheduling events</option>\
                                <option value="image">Image - display an image stored in a sensor</option>\
                                <option value="map">Map - display a map plotting positions stored in a sensor</option>\
                                <option value="text">Text - display a text statically or from a sensor</option>\
                                <option value="table">Table - display a dynamic table</option>\
                                <option value="counter">Counter - display counter of the values stored in a sensor</option>\
                                <option value="tasks">Tasks - display a to-do list</option>\
                                <option value="notifications">Notifications - list the latest notifications</option>\
                                <option value="chatbot">Chatbot - display the interactive chatbot</option>\
                                <option value="slider">Slider - display a range slider</option>\
								<option value="heartbeat">Heartbeat - display an elapsed since last heartbeat</option>\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Widget Offset</label>\
                            <select id="'+this.id+'_general_offset" class="form-control">\
                                <option value=""></option>\
                                <option value="1">1</option>\
                                <option value="2">2</option>\
                                <option value="3">3</option>\
                                <option value="4">4</option>\
                                <option value="5">5</option>\
                                <option value="6">6</option>\
                                <option value="7">7</option>\
                                <option value="8">8</option>\
                                <option value="9">9</option>\
                                <option value="10">10</option>\
                                <option value="11">11</option>\
                                <option value="12">12</option>\
                            </select>\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_summary_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_summary">\
                        <div class="form-group">\
                            <label>Sensors to Plot*</label>\
                            <div id="'+this.id+'_summary_sensors"></div>\
                            <br>\
                            <div class="form-group">\
                                <button type="button" class="btn btn-default float-right" id="'+this.id+'_summary_sensors_add"><i class="fas fa-plus"></i> Add Sensor</button>\
                            </div>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon</label>\
                            <select id="'+this.id+'_summary_icon" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Color of the icon</label>\
                            <select id="'+this.id+'_summary_color" class="form-control">\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon from a sensor</label>\
                            <select id="'+this.id+'_summary_icon_sensor" class="form-control"></select>\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_timeline_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_timeline">\
                        <div class="form-group">\
                            <label>Sensors to Plot*</label>\
                            <div id="'+this.id+'_timeline_sensors"></div>\
                            <br>\
                            <div class="form-group">\
                                <button type="button" class="btn btn-default float-right" id="'+this.id+'_timeline_sensors_add"><i class="fas fa-plus"></i> Add Sensor</button>\
                            </div>\
                        </div>\
                        <div class="form-group">\
                            <label>Display Aggregated Data</label>\
                            <select id="'+this.id+'_timeline_group_by" class="form-control">\
                                <option value="">Show series with latest measures</option>\
                                <option value="hour">Show series with hourly averages</option>\
                                <option value="day">Show series with daily averages</option>\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Chart Style</label>\
                            <input type="text" id="'+this.id+'_timeline_style" class="form-control" placeholder="Style of the chart. Default to spline">\
                        </div>\
                        <div class="form-group">\
                            <label>Custom Series to Display</label>\
                            <input type="text" id="'+this.id+'_timeline_series" class="form-control" placeholder="if displaying a custom series like \'sum\'">\
                        </div>\
                        <div class="form-group">\
                            <label>Custom Timeframe</label>\
                            <input type="text" id="'+this.id+'_timeline_timeframe" class="form-control" placeholder="Custom timeframe in the format last_24_hours. Best fit if not selected">\
                        </div>\
                        <div class="form-check">\
                            <input type="checkbox" class="form-check-input" id="'+this.id+'_timeline_no_range">\
                            <label class="form-check-label"><b>Range with Min and Max is Displayed for First Sensor. Check for Not Displaying</b></label>\
                        </div><br>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_range_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_range">\
                        <div class="form-group">\
                            <label>Sensor*</label>\
                            <select id="'+this.id+'_range_sensor" class="form-control" required></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Display Aggregated Data</label>\
                            <select id="'+this.id+'_range_group_by" class="form-control">\
                                <option value="">Show series with latest measures</option>\
                                <option value="hour">Show series with hourly averages</option>\
                                <option value="day">Show series with daily averages</option>\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Custom Timeframe</label>\
                            <input type="text" id="'+this.id+'_range_timeframe" class="form-control" placeholder="Custom timeframe in the format last_24_hours. Best fit if not selected">\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_value_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_value">\
                        <div class="form-group">\
                            <label>Sensor*</label>\
                            <select id="'+this.id+'_value_sensor" class="form-control" required></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon</label>\
                            <select id="'+this.id+'_value_icon" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Color of the icon</label>\
                            <select id="'+this.id+'_value_color" class="form-control">\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Elapsed from a different sensor</label>\
                            <select type="text" id="'+this.id+'_value_timestamp_sensor" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon from a sensor</label>\
                            <select id="'+this.id+'_value_icon_sensor" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Widget Style</label>\
                            <input type="text" id="'+this.id+'_value_variant" class="form-control" placeholder="1 (default) for small box, 2 for larger box">\
                        </div>\
                        <div class="form-group">\
                            <label>Value in green if between this range</label>\
                            <input type="text" id="'+this.id+'_value_color_success" class="form-control" placeholder="The range (e.g. 0-60) or the value for applying the color">\
                        </div>\
                        <div class="form-group">\
                            <label>Value in yellow if between this range</label>\
                            <input type="text" id="'+this.id+'_value_color_warning" class="form-control" placeholder="The range (e.g. 61-80) or the value for applying the color">\
                        </div>\
                        <div class="form-group">\
                            <label>Value in red if between this range</label>\
                            <input type="text" id="'+this.id+'_value_color_danger" class="form-control" placeholder="The range (e.g. 81-100) or the value for applying the color">\
                        </div>\
                        <div class="form-group">\
                            <label>Normalize the value to a percentage between the following range</label>\
                            <input type="text" id="'+this.id+'_value_normalize" class="form-control" placeholder="e.g. 1.8-33">\
                        </div>\
                        <div class="form-group">\
                            <label>Show All Link</label>\
                            <input type="text" id="'+this.id+'_value_link" class="form-control" placeholder="link for the \'Show All\' link. Applicable for style 2 widgets only">\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_status_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_status">\
                        <div class="form-group">\
                            <label>Sensor*</label>\
                            <select id="'+this.id+'_status_sensor" class="form-control" required></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon when ON (default: plug)</label>\
                            <select id="'+this.id+'_status_icon_on" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Color when ON (default: green)</label>\
                            <select id="'+this.id+'_status_color_on" class="form-control">\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Text when ON (default: ON)</label>\
                            <input type="text" id="'+this.id+'_status_text_on" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon when OFF (default: power-off)</label>\
                            <select id="'+this.id+'_status_icon_off" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Color when OFF (default: red)</label>\
                            <select id="'+this.id+'_status_color_off" class="form-control">\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Text when OFF (default: OFF)</label>\
                            <input type="text" id="'+this.id+'_status_text_off" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Elapsed from a different sensor</label>\
                            <select id="'+this.id+'_status_timestamp_sensor" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Widget Style</label>\
                            <input type="text" id="'+this.id+'_status_variant" class="form-control" placeholder="1 (default) for small box, 2 for larger box">\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_control_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_control">\
                        <div class="form-group">\
                            <label>Associated Sensor*</label>\
                            <select id="'+this.id+'_control_sensor" class="form-control" required></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Additional Actions to Execute</label>\
                            <div id="'+this.id+'_control_actions"></div>\
                            <br>\
                            <div class="form-group">\
                                <button type="button" class="btn btn-default float-right" id="'+this.id+'_control_actions_add"><i class="fas fa-plus"></i> Add Action</button>\
                            </div>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon</label>\
                            <select id="'+this.id+'_control_icon" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Color of the icon</label>\
                            <select id="'+this.id+'_control_color" class="form-control">\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Text when ON (default: On)</label>\
                            <input type="text" id="'+this.id+'_control_text_on" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon when ON</label>\
                            <select id="'+this.id+'_control_icon_on" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Color when ON</label>\
                            <select id="'+this.id+'_control_color_on" class="form-control">\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Text when OFF (default: Off)</label>\
                            <input type="text" id="'+this.id+'_control_text_off" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon when OFF</label>\
                            <select id="'+this.id+'_control_icon_off" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Color when OFF</label>\
                            <select id="'+this.id+'_control_color_off" class="form-control">\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Elapsed from a different sensor</label>\
                            <select id="'+this.id+'_control_timestamp_sensor" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon from a sensor</label>\
                            <select id="'+this.id+'_control_icon_sensor" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Widget Style</label>\
                            <input type="text" id="'+this.id+'_control_variant" class="form-control" placeholder="1 (default) for small box, 2 for larger box">\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_input_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_input">\
                        <div class="form-group">\
                            <label>Sensor*</label>\
                            <select id="'+this.id+'_input_sensor" class="form-control" required></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon</label>\
                            <select id="'+this.id+'_input_icon" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Color of the icon</label>\
                            <select id="'+this.id+'_input_color" class="form-control">\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Elapsed from a different sensor</label>\
                            <select id="'+this.id+'_input_timestamp_sensor" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon from a sensor</label>\
                            <select id="'+this.id+'_input_icon_sensor" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Widget Style</label>\
                            <input type="text" id="'+this.id+'_input_variant" class="form-control" placeholder="1 (default) for small box, 2 for larger box">\
                        </div>\
                        <div class="form-group">\
                            <label>Allowed Values</label>\
                            <input type="text" id="'+this.id+'_input_allowed_values" class="form-control" placeholder="e.g. ON,OFF">\
                        </div>\
                        <div class="form-group">\
                            <label>Allowed Range</label>\
                            <input type="text" id="'+this.id+'_input_allowed_range" class="form-control" placeholder="e.g. 10-30">\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_button_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_button">\
                        <div class="form-group">\
                            <label>Text*</label>\
                            <input type="text" id="'+this.id+'_button_text" class="form-control" placeholder="the text of the button" required>\
                        </div>\
                        <div class="form-group">\
                            <label>Actions to Execute*</label>\
                            <div id="'+this.id+'_button_actions"></div>\
                            <br>\
                            <div class="form-group">\
                                <button type="button" class="btn btn-default float-right" id="'+this.id+'_button_actions_add"><i class="fas fa-plus"></i> Add Action</button>\
                            </div>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon</label>\
                            <select id="'+this.id+'_button_icon" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Color of the icon</label>\
                            <select id="'+this.id+'_button_color" class="form-control">\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon from a sensor</label>\
                            <select id="'+this.id+'_button_icon_sensor" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Widget Style</label>\
                            <input type="text" id="'+this.id+'_button_variant" class="form-control" placeholder="1 (default) for small box, 2 for larger box">\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_calendar_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_calendar">\
                        <div class="form-group">\
                            <label>Sensor*</label>\
                            <select id="'+this.id+'_calendar_sensor" class="form-control" required></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Event Time Step (Minutes)</label>\
                            <input type="text" id="'+this.id+'_calendar_time_step" class="form-control" placeholder="minimum configurable time step for an event. Default to 15 minutes">\
                        </div>\
                        <div class="form-group">\
                            <label>Event Default Value</label>\
                            <input type="text" id="'+this.id+'_calendar_default_value" class="form-control" placeholder="default value when creating a new event">\
                        </div>\
                        <div class="form-group">\
                            <label>Display Event Template</label>\
                            <input type="text" id="'+this.id+'_calendar_event_template" class="form-control" placeholder="how to display the calendar\'s value with the %value% placeholder replaced with the actual value">\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_image_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_image">\
                        <div class="form-group">\
                            <label>Sensor*</label>\
                            <select id="'+this.id+'_image_sensor" class="form-control" required></select>\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_map_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_map">\
                        <div class="form-group">\
                            <label>Sensors with Positions*</label>\
                            <div id="'+this.id+'_map_sensors"></div>\
                            <br>\
                            <div class="form-group">\
                                <button type="button" class="btn btn-default float-right" id="'+this.id+'_map_sensors_add"><i class="fas fa-plus"></i> Add Sensor</button>\
                            </div>\
                        </div>\
                        <div class="form-group">\
                            <label>Map Type</label>\
                            <select id="'+this.id+'_map_map_type" class="form-control">\
                                <option value=""></option>\
                                <option value="roadmap">displays the default road map view</option>\
                                <option value="satellite">displays satellite images</option>\
                                <option value="hybrid">displays a mixture of normal and satellite views</option>\
                                <option value="terrain">displays a physical map based on terrain information</option>\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Timeframe to display in days</label>\
                            <input type="text" id="'+this.id+'_map_timeframe" class="form-control" placeholder="display positions for this number of past days (default 7 days)">\
                        </div>\
                        <div class="form-check">\
                            <input type="checkbox" class="form-check-input" id="'+this.id+'_map_tracking">\
                            <label class="form-check-label"><b>Track movements with a line among positions</b></label>\
                        </div><br>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_text_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_text">\
                        <div class="form-group">\
                            <label>Sensor</label>\
                            <select id="'+this.id+'_text_sensor" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Static Text</label>\
                            <input type="text" id="'+this.id+'_text_text" class="form-control" placeholder="static text to be displayed. HTML allowed">\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_table_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_table">\
                        <div class="form-group">\
                            <label>Associated Sensor</label>\
                            <select id="'+this.id+'_table_sensor" class="form-control" required></select>\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_counter_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_counter">\
                        <div class="form-group">\
                            <label>Associated Sensor*</label>\
                            <select id="'+this.id+'_counter_sensor" class="form-control" required></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon</label>\
                            <select id="'+this.id+'_counter_icon" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Color of the box</label>\
                            <select id="'+this.id+'_counter_color" class="form-control">\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Timeframe</label>\
                            <input type="text" id="'+this.id+'_counter_timeframe" class="form-control" placeholder="timeframe to query in the format last_24_hours, default to the last 24 hours">\
                        </div>\
                        <div class="form-group">\
                            <label>Scope</label>\
                            <input type="text" id="'+this.id+'_counter_scope" class="form-control" placeholder="scope of the database to query, default to sensors">\
                        </div>\
                        <div class="form-group">\
                            <label>Show All Link</label>\
                            <input type="text" id="'+this.id+'_counter_link" class="form-control" placeholder="link for the \'Show All\' link">\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_tasks_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_tasks">\
                        <div class="form-group">\
                            <label>Sensor*</label>\
                            <select id="'+this.id+'_tasks_sensor" class="form-control" required></select>\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_logs_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_logs">\
                        <div class="form-group">\
                            <label>Filter by Value</label>\
                            <input type="text" id="'+this.id+'_logs_show_only" class="form-control" placeholder="filter the table with this value" required>\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_notifications_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_notifications">\
                        <div class="form-group">\
                            <label>Filter by Value</label>\
                            <input type="text" id="'+this.id+'_notifications_show_only" class="form-control" placeholder="filter the table with this value" required>\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_slider_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_slider">\
                        <div class="form-group">\
                            <label>Sensor whose value has to be displayed*</label>\
                            <select id="'+this.id+'_slider_sensor" class="form-control" required></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Icon</label>\
                            <select id="'+this.id+'_slider_icon" class="form-control"></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Color of the icon</label>\
                            <select id="'+this.id+'_slider_color" class="form-control">\
                            </select>\
                        </div>\
                        <div class="form-group">\
                            <label>Widget Style</label>\
                            <input type="text" id="'+this.id+'_slider_variant" class="form-control" placeholder="1 (default) for small box, 2 for larger box">\
                        </div>\
                        <div class="form-group">\
                            <label>Minimum value of the slider</label>\
                            <input type="text" id="'+this.id+'_slider_min_value" class="form-control" placeholder="e.g. 100">\
                        </div>\
                        <div class="form-group">\
                            <label>Maximum value of the slider</label>\
                            <input type="text" id="'+this.id+'_slider_max_value" class="form-control" placeholder="e.g. 500">\
                        </div>\
                        <div class="form-group">\
                            <label>Step between values of the slider</label>\
                            <input type="text" id="'+this.id+'_slider_step" class="form-control" placeholder="e.g. 10">\
                        </div>\
                        <div class="form-check">\
                            <input type="checkbox" class="form-check-input" id="'+this.id+'_slider_show_percentage">\
                            <label class="form-check-label"><b>Normalize the values to a percentage</b></label>\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_heartbeat_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_heartbeat">\
                        <div class="form-group">\
                            <label>Sensor whose elapsed has to be displayed*</label>\
                            <select id="'+this.id+'_heartbeat_sensor" class="form-control" required></select>\
                        </div>\
                        <div class="form-group">\
                            <label>Widget Style</label>\
                            <input type="text" id="'+this.id+'_heartbeat_variant" class="form-control" placeholder="1 (default) for small box, 2 for larger box">\
                        </div>\
                    </div>\
                    \
                    <div class="tab-pane fade" id="'+this.id+'_tab_permissions_content" role="tabpanel" aria-labelledby="'+this.id+'_tab_permissions">\
                        <div class="form-group">\
                            <label>Authorized Groups</label>\
                            <div id="'+this.id+'_permissions_groups"></div>\
                            <br>\
                            <div class="form-group">\
                                <button type="button" class="btn btn-default float-right" id="'+this.id+'_permissions_groups_add"><i class="fas fa-plus"></i> Add Group</button>\
                            </div>\
                        </div>\
                    </div>\
                    \
                </div>\
            </form>\
        ')
        // for icons initialize select
        gui.select_icon(this.id+'_value_icon')
        gui.select_icon(this.id+'_control_icon')
        gui.select_icon(this.id+'_summary_icon')
        gui.select_icon(this.id+'_input_icon')
        gui.select_icon(this.id+'_button_icon')
        gui.select_icon(this.id+'_counter_icon')
        gui.select_icon(this.id+'_slider_icon')
        gui.select_icon(this.id+'_status_icon_on')
        gui.select_icon(this.id+'_status_icon_off')
        gui.select_icon(this.id+'_control_icon_on')
        gui.select_icon(this.id+'_control_icon_off')
        // for sensors, initialize select
        for (var widget_type in this.sensor_tags) {
            for (var sensor_tag of this.sensor_tags[widget_type]) {
                this.select_sensor(this.id+"_"+widget_type+"_"+sensor_tag)
            }
        }
        // for colors, initialize select
        for (var widget_type in this.color_tags) {
            for (var color_tag of this.color_tags[widget_type]) {
                this.select_color(this.id+"_"+widget_type+"_"+color_tag)
            }
        }

        // add a link to the advanced editor
        $("#wizard_body").append('<br><a id="'+this.id+'_advanced_editor" class="float-right text-primary d-none">Advanced Editor</a>')
        $("#"+this.id+"_advanced_editor").unbind().click(function(this_class) {
            return function () {
                $('#wizard').unbind('hidden.bs.modal')
                $("#wizard").modal("hide")
                gui.unload_page()
                window.location.hash = "#__configuration="+this_class.page.page_id 
            };
        }(this));
        // populate the form
        var simple_types = {}
        simple_types["general"] = ["title", "size", "widget", "offset"]
        simple_types["summary"] = ["icon", "color", "icon_sensor"]
        simple_types["value"] = ["sensor", "icon", "color", "timestamp_sensor", "icon_sensor", "variant", "link", "color_success", "color_warning", "color_danger","normalize"]
        simple_types["timeline"] = ["group_by", "timeframe", "style", "series"]
        simple_types["range"] = ["sensor", "group_by", "timeframe"]
        simple_types["status"] = ["sensor", "color_on", "icon_on", "text_on", "color_off", "icon_off", "text_off", "timestamp_sensor", "variant"]
        simple_types["control"] = ["sensor", "icon", "color", "text_on", "color_on", "icon_on", "text_off", "color_off", "icon_off", "timestamp_sensor", "icon_sensor", "variant"]
        simple_types["input"] = ["sensor", "icon", "color", "timestamp_sensor", "icon_sensor", "variant", "allowed_values", "allowed_range"]
        simple_types["button"] = ["text", "icon", "color", "icon_sensor", "variant"]
        simple_types["calendar"] = ["sensor", "time_step", "default_value", "event_template"]
        simple_types["image"] = ["sensor"]
        simple_types["text"] = ["sensor", "text"]
        simple_types["table"] = ["sensor"]
        simple_types["counter"] = ["sensor", "icon", "color", "timeframe", "scope", "link"]
        simple_types["tasks"] = ["sensor"]
        simple_types["logs"] = ["show_only"]
        simple_types["notifications"] = ["show_only"]
        simple_types["map"] = ["map_type", "timeframe"]
        simple_types["slider"] = ["sensor", "icon", "color", "variant", "min_value", "max_value", "step"]
		simple_types["heartbeat"] = ["sensor", "variant"]
        var array_types = {}
        array_types["summary"] = ["sensors"]
        array_types["timeline"] = ["sensors"]
        array_types["control"] = ["actions"]
        array_types["button"] = ["actions"]
        array_types["map"] = ["sensors"]
        array_types["permissions"] = ["groups"]
        var checkbox_types = {}
        checkbox_types["timeline"] = ["no_range"]
        checkbox_types["map"] = ["tracking"]
        checkbox_types["slider"] = ["show_percentage"]
        // editing the widget, fill in the values
        if (this.widget != null) {
            // general tab elements
            for (var key of ["title", "size", "widget", "offset"]) {
                if (! (key in this.widget)) continue
                $("#"+this.id+"_general_"+key).val(this.widget[key])
            }
            // permission tab elements
            if ("allow" in this.widget) {
                for (var i = 0; i < this.widget["allow"].length; i++) {
                    var value = this.widget["allow"][i]
                    this.add_array_item(id+'_permissions_groups', value)
                }
            }
            // widget-specific simple elements
            for (var type in simple_types) {
                if (this.widget["widget"] == type) {
                    for (var key of simple_types[type]) {
                        if (! (key in this.widget)) continue
                        if ($("#"+this.id+"_"+type+"_"+key).hasClass("bootstrap-select")) $("#"+this.id+"_"+type+"_"+key).selectpicker("val", this.widget[key])
                        else $("#"+this.id+"_"+type+"_"+key).val(this.widget[key])
                    }
                }
            }
            // widget-specific array elements
            for (var type in array_types) {
                if (this.widget["widget"] == type) {
                    for (var key of array_types[type]) {
                        if (! (key in this.widget)) continue
                        for (var i = 0; i < this.widget[key].length; i++) {
                            var value = this.widget[key][i]
                            this.add_array_item(this.id+'_'+type+'_'+key, value)
                        }
                    }
                }
            }
            // widget-specific checkbox elements
            for (var type in checkbox_types) {
                if (this.widget["widget"] == type) {
                    for (var key of checkbox_types[type]) {
                        if (! (key in this.widget)) continue
                        $("#"+this.id+"_"+type+"_"+key).prop("checked", this.widget[key])
                    }
                }
            }
        }
        // configure permission tab
        $("#"+this.id+'_permissions_groups_add').unbind().click(function(this_class, id) {
            return function () {
                this_class.add_array_item(id)
            };
        }(this, this.id+'_permissions_groups'));
        // configure add buttons
        for (var type in array_types) {
            for (var key of array_types[type]) {
                // configure add button
                $("#"+this.id+'_'+type+'_'+key+"_add").unbind().click(function(this_class, id) {
                    return function () {
                        this_class.add_array_item(id)
                    };
                }(this, this.id+'_'+type+'_'+key));
            }
        }
        // configure _widget type selector
        $('#'+this.id+'_general_widget').unbind().change(function(this_class) {
            return function () {
                var type = $('#'+this_class.id+'_general_widget').val()
                // show up only the relevant tab
                $("#"+this_class.id+"_tabs .nav-link").each(function(e){
                    var nav_id = $(this).attr("id")
                    // always keep general
                    if (nav_id.endsWith("_general") || nav_id.endsWith("_permissions")) return
                    var is_hidden = $("#"+nav_id).parent('li').hasClass("d-none")
                    // unhide requested tab
                    if (nav_id.endsWith("_"+type)) {
                        if (is_hidden) $("#"+nav_id).parent('li').removeClass("d-none")
                    }
                    // hide all other tabs
                    else {
                        if (! is_hidden) $("#"+nav_id).parent('li').addClass("d-none")
                    }
                });
            };
        }(this))
        // refresh the widget type
        $('#'+this.id+'_general_widget').trigger("change")
        // configure what to do when submitting the form
        var this_class = this
        $('#'+this.id+'_form').on('submit', function (e) {
            // remove all hidden tabs otherwise will cause issue during validation
            $("#"+this_class.id+"_tabs .nav-link").each(function(e){
                var nav_id = $(this).attr("id")
                // always keep general
                if (nav_id.endsWith("_general") || nav_id.endsWith("_permissions")) return
                var is_hidden = $("#"+nav_id).parent('li').hasClass("d-none")
                // unhide requested tab
                if (! nav_id.endsWith("_"+type)) {
                    if (is_hidden) $("#"+nav_id+"_content").remove()
                }
            });
            // disable the widget type select since we deleted them
            $("#"+this_class.id+"_general_widget").prop("disabled", true) 
            // form is validated
            if ($('#'+this_class.id+'_form')[0].checkValidity()) {
                // build up the data structure
                var widget = {}
                // general tab elements
                for (var item of ["title", "size", "widget", "offset"]) {
                    var value = $("#"+this_class.id+"_general_"+item).val()
                    if (value == "") continue
                    widget[item] = $.isNumeric(value) ? parseFloat(value) : value
                }
                // permissions tab elements
                $("#"+this_class.id+"_permissions_groups :input[type=text]").each(function(e){
                    if (! ("allow" in widget)) widget["allow"] = []
                    widget["allow"].push(this.value)
                });
                // widget-specific simple elements
                for (var type in simple_types) {
                    if (widget["widget"] == type) {
                        for (var key of simple_types[type]) {
                            var value = $("#"+this_class.id+"_"+type+"_"+key).val()
                            if (value != "") widget[key] = $.isNumeric(value) ? parseFloat(value) : value
                        }
                    }
                }
                // widget-specific array elements
                for (var type in array_types) {
                    if (widget["widget"] == type) {
                        for (var key of array_types[type]) {
                            $("#"+this_class.id+"_"+type+"_"+key+" :input[type=text]").each(function(e){
                                if (! (key in widget)) widget[key] = []
                                widget[key].push(this.value)
                            });
                        }
                    }
                }
                // widget-specific checkbox elements
                for (var type in checkbox_types) {
                    if (widget["widget"] == type) {
                        for (var key of checkbox_types[type]) {
                            var value = $("#"+this_class.id+"_"+type+"_"+key).prop("checked")
                            widget[key] = value
                        }
                    }
                }
                // if a new widget we need to add a new column first
                if (row != null) {
                    var offset = "offset" in widget ? widget["offset"] : 0
                    this_class.id = this_class.page.add_column(row, this_class.get_random(), widget["size"], offset)
                }
                // update the widget
                this_class.page.add_widget(this_class.id, widget)
                // enable edit mode
                $("#"+this_class.id+" .edit_page_item").removeClass("d-none")
                $("#"+this_class.id+" .no_edit_page_item").addClass("d-none")
                // close the modal
                $("#wizard").modal("hide")
                gui.notify("info","Changes to the widget will not be persistent until the page will be saved")
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
        // request available sensors
        this.add_configuration_listener("sensors/#", gui.supported_sensors_config_schema)
        // show the modal
       setTimeout(function(this_class) {
            return function() {
             $("#waiting").modal("hide")
             $("#wizard").modal()
            };
        }(this), 2000);
    }
    
    // return a random number
    get_random() {
        var min = 1; 
        var max = 100000;
        return Math.floor(Math.random() * (+max - +min)) + +min;
    }
    
    // add an array item to the widget wizard form
    add_array_item(id, value="") {
        var i = this.get_random()
        var html = '\
            <div class="row" id="'+this.id+'_row_'+i+'">\
                <div class="col-11">\
                    <input type="text" id="'+this.id+'_value_'+i+'" class="form-control" value="'+value+'" required>\
                </div>\
                <div class="col-1">\
                    <button type="button" class="btn btn-default">\
                        <i class="fas fa-times text-red" id="'+this.id+'_remove_'+i+'"></i>\
                    </button>\
                </div>\
            </div>\
        '
        $("#"+id).append(html)
        // configure remove button
        $("#"+this.id+"_remove_"+i).unbind().click(function(id, i) {
            return function () {
                $("#"+id+"_row_"+i).remove()
            };
        }(id, i));
    }
    
    // build a select input with available sensors
    select_sensor(id) {
        $("#"+id).attr("data-live-search", "true")
        $("#"+id).addClass("bootstrap-select")
        $('#'+id).append('<option value=""></option>')
        // initialize bootstrap select
        $('#'+id).selectpicker();
    }
    
    // build a select input with available colors
    select_color(id) {
        $("#"+id).addClass("bootstrap-select")
        $('#'+id).append('<option style="background: white; color: #fff;" value=""></option>')
        $('#'+id).append('<option style="background: black; color: #fff;" value="black">black</option>')
        $('#'+id).append('<option style="background: gray; color: #fff;" value="gray">gray</option>')
        $('#'+id).append('<option style="background: silver; color: #000;" value="silver">silver</option>')
        $('#'+id).append('<option style="background: white; color: #000;" value="white">white</option>')
        $('#'+id).append('<option style="background: aqua; color: #000;" value="aqua">aqua</option>')
        $('#'+id).append('<option style="background: blue; color: #fff;" value="blue">blue</option>')
        $('#'+id).append('<option style="background: navy; color: #fff;" value="navy">navy</option>')
        $('#'+id).append('<option style="background: teal; color: #fff;" value="teal">teal</option>')
        $('#'+id).append('<option style="background: green; color: #fff;" value="green">green</option>')
        $('#'+id).append('<option style="background: olive; color: #fff;" value="olive">olive</option>')
        $('#'+id).append('<option style="background: lime; color: #000;" value="lime">lime</option>')
        $('#'+id).append('<option style="background: yellow; color: #000;" value="yellow">yellow</option>')
        $('#'+id).append('<option style="background: orange; color: #fff;" value="orange">orange</option>')
        $('#'+id).append('<option style="background: red; color: #fff;" value="red">red</option>')
        $('#'+id).append('<option style="background: fuchsia; color: #fff;" value="fuchsia">fuchsia</option>')
        $('#'+id).append('<option style="background: purple; color: #fff;" value="purple">purple</option>')
        $('#'+id).append('<option style="background: maroon; color: #fff;" value="maroon">maroon</option>')
        $('#'+id).append('<option style="background: black; color: #fff;" value="black">black</option>')
        // initialize bootstrap select
        $('#'+id).selectpicker();
    }
    
    // receive data and load it into the widget
    on_message(message) {
    }
    
    // receive configuration
    on_configuration(message) {
        if (message.args.startsWith("sensors/")) {
            var sensor_id = message.args.replace("sensors/", "")
            var sensor = message.get_data()
            var icon = "icon" in sensor ? sensor["icon"] : "microchip"
            var description = "description" in sensor ? sensor["description"]+" ["+sensor_id+"]" : sensor_id
            // for each select expecting a sensor, add the option
            for (var widget_type in this.sensor_tags) {
                for (var sensor_tag of this.sensor_tags[widget_type]) {
                    $('#'+this.id+"_"+widget_type+"_"+sensor_tag).append('<option data-icon="fas fa-'+icon+'" value="'+sensor_id+'">'+description+'</option>')
                    $('#'+this.id+"_"+widget_type+"_"+sensor_tag).selectpicker("refresh")
                    if (this.widget != null && this.widget["widget"] == widget_type && sensor_tag in this.widget) {
                        $('#'+this.id+"_"+widget_type+"_"+sensor_tag).selectpicker("val", this.widget[sensor_tag])
                    }
                }
            }
        }
    }
}