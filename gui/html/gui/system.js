// handle system pages layouts
class System {
    get_layout(page_id) {
        if (page_id == "__sensor") {
            if (! gui.is_authorized(["house_admins"])) return
            if (! location.hash.includes("=")) return
            var request = location.hash.split("=")
            var sensor_id = request[1]
            var page_layout = [
                {
                    "sensor_id": [
                        {
                            "title": "Summary",
                            "size": 3,
                            "widget": "summary",
                            "icon": "microchip",
                            "sensors": [ 
                              sensor_id
                            ]
                        },
                        {
                            "title": "Timeline",
                            "size": 9,
                            "widget": "timeline",
                            "sensors": [
                              sensor_id
                            ]
                        }
                    ]
                },
                {
                    "": [
                        {
                            "title": "Hourly Timeline",
                            "size": 12,
                            "widget": "timeline",
                            "group_by": "hour",
                            "sensors": [ 
                              sensor_id
                            ]
                        }
                    ]
                },
                {
                    "": [
                        {
                            "title": "Daily Timeline",
                            "size": 12,
                            "widget": "timeline",
                            "group_by": "day",
                            "sensors": [
                              sensor_id
                            ]
                        }
                    ]
                }
            ]
            // replace the sensor_id placeholder with the actual sensor_id
            Object.defineProperty(page_layout[0], sensor_id, Object.getOwnPropertyDescriptor(page_layout[0], "sensor_id"));
            delete page_layout[0]["sensor_id"];
            return page_layout
        }
        else if (page_id == "__sensor_wizard") {
            if (! gui.is_authorized(["house_admins"])) { this.unauthorized(); return }
            var widget_object = new Sensor_wizard("sensor_wizard", {})
            widget_object.draw()
        }
        else if (page_id == "__rule_wizard") {
            if (! gui.is_authorized(["house_admins"])) { this.unauthorized(); return }
            var widget_object = new Rule_wizard("rule_wizard", {})
            widget_object.draw()
        }
        else if (page_id == "__module_wizard") {
            if (! gui.is_authorized(["house_admins"])) { this.unauthorized(); return }
            var widget_object = new Module_wizard("module_wizard", {})
            widget_object.draw()
        }
        else if (page_id == "__menu_item_wizard") {
            if (! gui.is_authorized(["house_admins"])) { this.unauthorized(); return }
            var widget_object = new Menu_item_wizard("menu_item_wizard", {})
            widget_object.draw()
        }
        else if (page_id == "__menu_folder_wizard") {
            if (! gui.is_authorized(["house_admins"])) { this.unauthorized(); return }
            var widget_object = new Menu_folder_wizard("menu_folder_wizard", {})
            widget_object.draw()
        }
        else if (page_id == "__notifications") {
            var page_layout = [ 
                {
                    "Notification Center": [
                    {
                        "size": 12,
                        "text": "Let's have a look if we have any interesting <b>notifications</b>. Notifications are generated whenever a configured rule triggers. If for example you want to be notified whenever the temperature of you refrigerator is too high, create a rule, schedule its execution and whenever the temperature will be higher than a configured threshold you will be notified. If you are an admin, you can configure your rules from the <a href='#__rules'>RULES</a> page so to trigger notifications generating <b>E-mail, Slack alerts, SMS messages, etc.</b> whenever a configured condition is met. Notifications can also be reviewed from the web interface thorugh the widgets below.",
                        "title": "Create your rules and receive notifications",
                        "widget": "text"
                      }
                    ]
                },
                {
                    "": [
                      {
                        "color": "red",
                        "icon": "ban",
                        "link": "__notifications=ALERT",
                        "scope": "alerts",
                        "sensor": "alert",
                        "size": 4,
                        "title": "Alerts",
                        "widget": "counter"
                      },
                      {
                        "color": "yellow",
                        "icon": "exclamation-triangle",
                        "link": "__notifications=WARNING",
                        "scope": "alerts",
                        "sensor": "warning",
                        "size": 4,
                        "title": "Warnings",
                        "widget": "counter"
                      },
                      {
                        "color": "info",
                        "icon": "info",
                        "link": "__notifications=INFO",
                        "scope": "alerts",
                        "sensor": "info",
                        "size": 4,
                        "title": "Informational",
                        "widget": "counter"
                      }
                    ]
                },
                {
                    "": [ 
                        { 
                            "title": "Latest Notifications", 
                            "size": 12, 
                            "widget": "notifications" 
                        } 
                    ] 
                } 
            ]
            return page_layout
        }
        else if (page_id == "__chatbot") {
            var page_layout = [ 
                {
                    "Meet eGeoffrey": [
                      {
                        "size": 12,
                        "title": "Inteact with eGeoffrey in realtime",
                        "widget": "text",
                        "text": "Yes, you can <b>interact</b> with eGeoffrey. He is not the most easygoing entity but knows his stuff. <br>Say hi to him, ask about your registered sensors, trigger interactively your configured rules, eGeoffrey will do his best to <b>answer accordingly</b>! eGeoffrey is your e-butler who will take care of your house on your behalf <b>no need to configure anything</b>. The same level of interaction is also possible through Slack, Telegram, an attached microphone etc. by installing the required packages from our Marketplace."
                      }
                    ]
                },
                {
                    "": [
                      {
                        "size": 12,
                        "title": "Chat with me!",
                        "widget": "chatbot"
                      }
                    ]
                }
            ]
            return page_layout
        }
        else if (page_id == "__measures") {
            var page_layout = [
                {
                    "Wha'ts new from your Sensors": [
                        {
                            "size": 12,
                            "title": "eGeoffrey and its sensors",
                            "text": "Let's have a look what's going on now and which <b>data has recently come in</b> from your sensors. No need to refresh anything, whenever a new value comes in will be immediately shown up at the top of the table! <br>A sensor in eGeoffrey is a sort of <b>dataset</b>, a logical container of <b>one or more values</b>: it can hold just a single piece of data or a timeseries. Sensor's values can come from an <b>associated service</b> (e.g. a url with an image, a command to run, etc.), from <b>actions triggered by a rule</b> or from your <b>interaction with widgets</b> on this interface.",
                            "widget": "text"
                        }
                    ]
                },
                {
                    "": [
                        {
                            "show_only": "value",
                            "size": 12,
                            "title": "Latest data from your sensors",
                            "widget": "notifications"
                        }
                    ]
                }
            ]
            return page_layout
        }
        else if (page_id == "__configuration") {
            if (! gui.is_authorized(["egeoffrey_admins"])) { this.unauthorized(); return }
            var page_layout = [ { "": [ { "title": "Configuration Editor", "size": 12, "widget": "__configuration" } ] } ]
            return page_layout
        }
        else if (page_id == "__database") {
            if (! gui.is_authorized(["egeoffrey_admins"])) { this.unauthorized(); return }
            var page_layout = [ { "": [ { "title": "Database Inspector", "size": 12, "widget": "__database" } ] } ]
            return page_layout
        }
        else if (page_id == "__gateway") {
            if (! gui.is_authorized(["egeoffrey_admins"])) { this.unauthorized(); return }
            var page_layout = [ { "": [ { "title": "Gateway Inspector", "size": 12, "widget": "__gateway" } ] } ]
            return page_layout
        }
        else if (page_id == "__setup") {
            if (! gui.is_authorized(["house_admins"])) { this.unauthorized(); return }
            var page_layout = [ 
                { 
                    "Your House": 
                        [ 
                            { 
                                "title": " ", 
                                "size": 12, 
                                "widget": "text",
                                "text": '<i class="fas fa-question-circle text-blue"></i> From this page you can go through very simple steps to perform a basic setup of your house like giving it a name, setting up its position etc. You can also configure common settings of this web interface. For more information on this page, visit our <a target="_new" href="https://docs.egeoffrey.com/setup/house/">Documentation Portal</a>'
                            } 
                        ] 
                },
                { 
                    "": 
                        [ 
                            { 
                                "title": "House Setup", 
                                "size": 12, 
                                "widget": "__setup" 
                            } 
                        ] 
                } 
            ]
            return page_layout
        }
        else if (page_id == "__pages") {
            if (! gui.is_authorized(["house_admins"])) { this.unauthorized(); return }
            var page_layout = [ 
                { 
                    "Create Your Custom Pages": 
                        [ 
                            { 
                                "title": " ", 
                                "size": 12, 
                                "widget": "text",
                                "text": '<i class="fas fa-question-circle text-blue"></i> A page is what you ultimately access through the web interface and is used to display sensors\' contents in a variatiy of ways. A page is made up of multiple rows and every row have one or more widget (in columns). Once your page is ready, you need to add a menu entry in order to access it from the main menu. For more information on this page, visit our <a target="_new" href="https://docs.egeoffrey.com/configure/pages/">Documentation Portal</a>'
                            } 
                        ] 
                },
                { 
                    "": 
                        [ 
                            { 
                                "title": '<i class="fa fa-columns"></i> Custom Pages',
                                "size": 12, 
                                "widget": "__pages" 
                            } 
                        ] 
                } 
            ]
            return page_layout
        }
        else if (page_id == "__menu") {
            if (! gui.is_authorized(["house_admins"])) { this.unauthorized(); return }
            var page_layout = [ 
                { 
                    "Customize Your Menu": 
                        [ 
                            { 
                                "title": " ", 
                                "size": 12, 
                                "widget": "text",
                                "text": '<i class="fas fa-question-circle text-blue"></i> The "MY HOUSE" area of the left menu contains the links to user-defined pages and it is completely up to you the way you want to organize your contents. Since your pages will be ultimately accessible through the menu, you need to link them by creating a so-called menu item. Menu items have to belong to a menu folder so that pages which are logically linked together can be grouped. For more information on this page, visit our <a target="_new" href="https://docs.egeoffrey.com/configure/pages/">Documentation Portal</a>'
                            } 
                        ] 
                },
                { 
                    "": 
                        [ 
                            { 
                                "title": '<i class="fa fa-folder-open"></i> Menu Folders', 
                                "size": 12, 
                                "widget": "__menu_folders" 
                            }
                        ] 
                },
                { 
                    "": 
                        [ 
                            { 
                                "title": '<i class="fa fa-copy"></i> Menu Items', 
                                "size": 12, 
                                "widget": "__menu_items" 
                            }
                        ] 
                } 
            ]
            return page_layout
        }
        else if (page_id == "__users") {
            if (! gui.is_authorized(["house_admins"])) { this.unauthorized(); return }
            var page_layout = [ 
                { 
                    "Manage Your Users": 
                        [ 
                            { 
                                "title": "", 
                                "size": 12, 
                                "widget": "text",
                                "text": '<i class="fas fa-question-circle text-blue"></i> You can optionally configure different users to access the web interface or set/change the password the out-of-the-box users admin and guest. Managing users is not strictly required in eGeoffrey but in case you want to prevent anonymous users to access or give different users access to different pages, you can start exploring these functionalities. For more information on this page, visit our <a target="_new" href="https://docs.egeoffrey.com/configure/users/">Documentation Portal</a>'
                            } 
                        ] 
                },
                { 
                    "": 
                        [ 
                            { 
                                "title": '<i class="fa fa-users"></i> Users and Groups', 
                                "size": 12, 
                                "widget": "__users" 
                            } 
                        ] 
                } 
            ]
            return page_layout
        }
        else if (page_id == "__logs") {
            if (! gui.is_authorized(["egeoffrey_admins"])) { this.unauthorized(); return }
            var page_layout = [ { "": [ { "title": "Log Inspector", "size": 12, "widget": "__logs" } ] } ]
            return page_layout
        }
        else if (page_id == "__modules") {
            if (! gui.is_authorized(["egeoffrey_admins"])) { this.unauthorized(); return }
            var page_layout = [ 
                { 
                    "Running Modules": 
                        [ 
                            { 
                                "title": " ", 
                                "size": 12, 
                                "widget": "text",
                                "text": '<i class="fas fa-question-circle text-blue"></i> A module is defined as a unit providing a specific functionality to eGeoffrey. Once you install a package, this provides one or more modules. There are different kind of modules: Controller are modules part of the eGeoffrey core (e.g. interact with the database, collect data from sensors, run alerting rules, etc.), interaction are modules responsible for interacting with the user (e.g. through Slack, a microphone, etc.), notification are modules responsible for notifying the user about something (e.g. through email, slack, text messages, etc.), service are modules responsible for interfacing with a specific device or protocol to retrieve data or control actuators (e.g. a weather service, a webcam, a MySensors device, Zigbee protocol, etc.), gui are modules responsible for running the eGeoffrey GUI. For more information on this page, visit our <a target="_new" href="https://docs.egeoffrey.com/configure/modules/">Documentation Portal</a>'
                            } 
                        ] 
                },
                { 
                    "": 
                        [ 
                            { 
                                "title": '<i class="fa fa-server"></i> Modules', 
                                "size": 12, 
                                "widget": "__modules" 
                            } 
                        ] 
                } 
            ]
            return page_layout
        }
        else if (page_id == "__packages") {
            if (! gui.is_authorized(["egeoffrey_admins"])) { this.unauthorized(); return }
            var page_layout = [ 
                { 
                    "Installed Packages": 
                        [ 
                            { 
                                "title": '', 
                                "size": 12, 
                                "widget": "text",
                                "text": '<i class="fas fa-question-circle text-blue"></i> A package is defined as one or more modules (e.g. functionalities) packaged together. It may also include sample contents such as sensors, rules or pages. Packages are what you can find in the eGeoffrey\'s Marketplace and it is what you install when you need specific new skills added to your eGeoffrey. For more information on this page, visit our <a target="_new" href="https://docs.egeoffrey.com/configure/packages/">Documentation Portal</a>'
                            } 
                        ] 
                },
                { 
                    "": 
                        [ 
                            { 
                                "title": '<i class="fa fa-cubes"></i> Packages', 
                                "size": 12, 
                                "widget": "__packages" 
                            } 
                        ] 
                } 
            ]
            return page_layout
        }
        else if (page_id == "__rules") {
            if (! gui.is_authorized(["house_admins"])) { this.unauthorized(); return }
            var page_layout = [ 
                { 
                    "Manage Your Rules": 
                        [ 
                            { 
                                "title": " ", 
                                "size": 12, 
                                "widget": "text",
                                "text": '<i class="fas fa-question-circle text-blue"></i> Rules can execute specific tasks periodically or upon specific conditions. A rule is defined as a set constants (e.g. static values) and variables (e.g. values coming from sensors) combined in conditions. Notifications are generated whenever a configured rule triggers. Rules can also execute additional actions (e.g. set a value to a sensor, trigger another rule, etc.). For more information on this page, visit our <a target="_new" href="https://docs.egeoffrey.com/configure/rules/">Documentation Portal</a>'
                            } 
                        ] 
                },
                { 
                    "": 
                        [ 
                            { 
                                "title": '<i class="fa fa-cogs"></i> Configured Rules', 
                                "size": 12, 
                                "widget": "__rules" 
                            } 
                        ] 
                } 
            ]
            return page_layout
        }
        else if (page_id == "__sensors") {
            if (! gui.is_authorized(["house_admins"])) { this.unauthorized(); return }
            var page_layout = [ 
                { 
                    "Manage Your Sensors": 
                        [ 
                            { 
                                "title": " ", 
                                "size": 12, 
                                "widget": "text",
                                "text": '<i class="fas fa-question-circle text-blue"></i> A sensor is defined as a dataset, a logical container of one or more values. it can hold just a single piece of data or a timeseries. Values can come from an associated service (e.g. a url with an image, a command to run, etc.), from actions triggered by a rule or from your interaction with widgets on the web interface. A sensor is made of an id (e.g. the way you will references it) and additional information like retention policies, associated services, etc. For more information on this page, visit our <a target="_new" href="https://docs.egeoffrey.com/configure/sensors/">Documentation Portal</a>'
                            } 
                        ] 
                },
                { 
                    "": 
                        [ 
                            { 
                                "title": '<i class="fa fa-microchip"></i> Registered Sensors', 
                                "size": 12, 
                                "widget": "__sensors" 
                            } 
                        ] 
                } 
            ]
            return page_layout
        }
        else if (page_id == "__welcome") {
            var page_layout = [
              {
                "I'm eGeoffrey, your e-butler": [
                  {
                    "size": 12,
                    "title": '<i class="fas fa-robot"></i>  Welcome!',
                    "text": 'Through the eGeoffrey\'s web user interface you can control any aspect of your <b>personal e-butler</b>. It is the easiest and simplest way to <b>configure</b> your eGeoffrey\'s instance, register new <b>sensors</b>, <b>view your data</b>, control your <b>actuators</b>, configure <b>rules</b> which will trigger one or more notification upon specific conditions. And how data is displayed is completely up to you, you can <b>organize</b> your contents in the way you like the most and create new, custom pages. No need to edit complicated configuration files, everything can be accomplished from here!',
                    "widget": "text"
                  }
                ]
              },
              {
                "": [
                  {
                    "size": 12,
                    "text": 'Either if you are a user or an admin, the best way to start is to have a look at our <b><a target="_new" href="https://docs.egeoffrey.com/configure/workflow/">Documentation Portal</a></b> for step-by-step instructions and HOW TOs in which you will learn how to: <ul><li><b>Define what you want to do and install the relevant packages</b>: eGeoffrey is modular and its capabilities are build up in self-contained components. Those are what you see listed in the <b><a target="_new" href="https://marketplace.egeoffrey.com">Marketplace</a></b>. Define first what you want to do (e.g. get temperature measures from the Internet, trigger a MySensors relay, etc.), find in the Marketplace the package providing this capability (e.g. the module in eGeoffrey\'s vocabulary) and install it; </li><li><b>Configure the newly installed module:</b> once the package is installed, the new functionalities will be ready to be leveraged. Most of the modules tough requires some basic configuration to start up (e.g. the API key of the cloud-based weather service, the serial port to connect to, etc.). One special kind of module is called "service", this is the one your sensors can leverage to get data in automatically; </li><li><b>Add a new sensor and associate it to a service:</b> register a new sensor, give it a name, tell eGeoffrey which format it has to expect your data in, if it has to apply any automatic aggregation or retention policies, which service it has to be associated with for getting data in or performing actions; </li><li><b>Once the sensor starts getting data, visualize it:</b> customize the web interface to make your data showing up in the way you like the most. Add new pages and different widgets to e.g. see the latest value of a sensor, control your actuators, etc. </li><li><b>Set conditions which would make rules triggering notifications:</b> execute specific tasks periodically or when given conditions are met by evaluating your sensors\' data and generate notifications;</li></ul><br>And for any additional question, in our <b><a target="_new" href="https://forum.egeoffrey.com">Forum</a></b> you can meet our community, get useful advices and share best practices.',
                    "title": '<i class="fas fa-book-open"></i> Getting Started',
                    "widget": "text"
                  }
                ]
              },
              {
                "": [
                  {
                    "size": 12,
                    "title": '<i class="fas fa-bug"></i> Found a bug or looking for enhancements?',
                    "text": 'If you discovered a bug or want to submit an enhancement request, you are encouraged to visit first both our <b><a target="_new" href="https://forum.egeoffrey.com">Forum</a></b> to ensure the issue has bot been discussed already by other users and visit our and <b><a target="_new" href="https://github.com/egeoffrey">Github</a></b> page, where you can find for each eGeoffrey components opened issues and enhancement requests submitted by other users. If you cannot find what you are looking for, simply open up a new issue!',
                    "widget": "text"
                  }
                ]
              },
              {
                "": [
                  {
                    "size": 12,
                    "title": '<i class="fas fa-code"></i> Willing to contribute?',
                    "text": 'eGeoffrey skills\' are endless and, whatever skill you have in mind, eGeoffrey will <b>learn</b> it to satisfy your needs with its best smile. And maybe another user has already taught his eGeoffrey to do exactly what you needed. if you want to extend eGeoffrey and make it better, visit our website for <b><a target="_new" href="https://developer.egeoffrey.com">Developers</a></b> to understand more about its architecture and internals and guidelines on how to contribute.',
                    "widget": "text"
                  }
                ]
              }
            ]
            return page_layout
        }
    }
    
    // print an error message when the user is not authorized to access the page
    unauthorized() {
        $("#body").empty()
        $("#body").append('<center><h3>You are not authorized to access this page</h3></center>');
    }
}