// GUI main class

class Gui extends Module {
    // What to do when initializing
    on_init() {
        this.username = "EGEOFFREY_USERNAME" in window ? window.EGEOFFREY_USERNAME : "guest"
        this.password = "EGEOFFREY_PASSWORD" in window ? window.EGEOFFREY_PASSWORD : ""
		this.remember_page = "EGEOFFREY_REMEMBER_PAGE" in window ? window.EGEOFFREY_REMEMBER_PAGE : 1
        // apply locale
        $("#popup_close").html(locale("gui.popup.close"))
        $("#wizard_close").html(locale("gui.wizard.close"))
        $("#wizard_delete").html(locale("gui.wizard.delete"))
        $("#wizard_save").html(locale("gui.wizard.save"))
        // map a subscribed topic with an array of widgets
        this.listeners = {}
        // map a requested configuration with its content (since a retained message, we need to keep track)
        this.configurations = {}
        // map a manifest with its content (since a retained message, we need to keep track)
        this.manifests = {}
        // map request_id with an array of the requesting widgets
        this.requests = {}
        // other settings
        this.house = {}
        this.settings = {}
        this.charts = {}
        this.users = {}
        this.groups = {}
        // date/time helper
        this.date = null
        // managed configuration schema
        this.page_config_schema = 1
        this.chart_config_schema = 1
        this.settings_config_schema = 2
        this.menu_config_schema = 1
        this.users_config_schema = 1
        this.groups_config_schema = 1
        // unmanaged configuration schema
        this.supported_sensors_config_schema = 1
        this.supported_house_config_schema = 1
        this.supported_rules_config_schema = 2
        this.supported_manifest_schema = 2
        // subscribe to required settings
        this.add_configuration_listener("house", this.supported_house_config_schema, true)
        this.add_configuration_listener("gui/settings", this.settings_config_schema, true)
        this.add_configuration_listener("gui/charts", this.chart_config_schema, true)
        this.add_configuration_listener("gui/users", this.users_config_schema, true)
        this.add_configuration_listener("gui/groups", this.groups_config_schema, true)
        // ensure the database can be reached
        this.database_ping_listener = null
        this.database_reachable = false
        // objects of the current page
        this.page = null
        this.page_listener = null
        this.menu = new Menu("menu")
        this.toolbar = new Toolbar("toolbar")
		this.first_page_loaded = false
		this.connections = new Connections()
        // set to true when waiting for a page
        this.waiting_for_page = false
        // loaded Google Maps
        this.maps_loaded = false
        // scheduler's events
        this.scheduler_events = []
        // flag set on when the user is logged in
        this.logged_in = false
        // keep track of all timers
        this.timers = []
		// remove any listener on the hash change, will be re-added later once the module is started
		window.onhashchange = null
        // show a loading page when waiting for a specific configuration
        this.configuration_to_wait = null
        // available icons (https://fontawesome.com/icons?d=gallery&q=help&m=free) 
        this.icons = ["","ad", "address-book", "address-card", "adjust", "air-freshener", "align-center", "align-justify", "align-left", "align-right", "allergies", "ambulance", "american-sign-language-interpreting", "anchor", "angle-double-down", "angle-double-left", "angle-double-right", "angle-double-up", "angle-down", "angle-left", "angle-right", "angle-up", "angry", "ankh", "apple-alt", "archive", "archway", "arrow-alt-circle-down", "arrow-alt-circle-left", "arrow-alt-circle-right", "arrow-alt-circle-up", "arrow-circle-down", "arrow-circle-left", "arrow-circle-right", "arrow-circle-up", "arrow-down", "arrow-left", "arrow-right", "arrow-up", "arrows-alt", "arrows-alt-h", "arrows-alt-v", "assistive-listening-systems", "asterisk", "at", "atlas", "atom", "audio-description", "award", "baby", "baby-carriage", "backspace", "backward", "bacon", "balance-scale", "ban", "band-aid", "barcode", "bars", "baseball-ball", "basketball-ball", "bath", "battery-empty", "battery-full", "battery-half", "battery-quarter", "battery-three-quarters", "bed", "beer", "bell", "bell-slash", "bezier-curve", "bible", "bicycle", "binoculars", "biohazard", "birthday-cake", "blender", "blender-phone", "blind", "blog", "bold", "bolt", "bomb", "bone", "bong", "book", "book-dead", "book-medical", "book-open", "book-reader", "bookmark", "bowling-ball", "box", "box-open", "boxes", "braille", "brain", "bread-slice", "briefcase", "briefcase-medical", "broadcast-tower", "broom", "brush", "bug", "building", "bullhorn", "bullseye", "burn", "bus", "bus-alt", "business-time", "calculator", "calendar", "calendar-alt", "calendar-check", "calendar-day", "calendar-minus", "calendar-plus", "calendar-times", "calendar-week", "camera", "camera-retro", "campground", "candy-cane", "cannabis", "capsules", "car", "car-alt", "car-battery", "car-crash", "car-side", "caret-down", "caret-left", "caret-right", "caret-square-down", "caret-square-left", "caret-square-right", "caret-square-up", "caret-up", "carrot", "cart-arrow-down", "cart-plus", "cash-register", "cat", "certificate", "chair", "chalkboard", "chalkboard-teacher", "charging-station", "chart-area", "chart-bar", "chart-line", "chart-pie", "check", "check-circle", "check-double", "check-square", "cheese", "chess", "chess-bishop", "chess-board", "chess-king", "chess-knight", "chess-pawn", "chess-queen", "chess-rook", "chevron-circle-down", "chevron-circle-left", "chevron-circle-right", "chevron-circle-up", "chevron-down", "chevron-left", "chevron-right", "chevron-up", "child", "church", "circle", "circle-notch", "city", "clinic-medical", "clipboard", "clipboard-check", "clipboard-list", "clock", "clone", "closed-captioning", "cloud", "cloud-download-alt", "cloud-meatball", "cloud-moon", "cloud-moon-rain", "cloud-rain", "cloud-showers-heavy", "cloud-sun", "cloud-sun-rain", "cloud-upload-alt", "cocktail", "code", "code-branch", "coffee", "cog", "cogs", "coins", "columns", "comment", "comment-alt", "comment-dollar", "comment-dots", "comment-medical", "comment-slash", "comments", "comments-dollar", "compact-disc", "compass", "compress", "compress-arrows-alt", "concierge-bell", "cookie", "cookie-bite", "copy", "copyright", "couch", "credit-card", "crop", "crop-alt", "cross", "crosshairs", "crow", "crown", "crutch", "cube", "cubes", "cut", "database", "deaf", "democrat", "desktop", "dharmachakra", "diagnoses", "dice", "dice-d20", "dice-d6", "dice-five", "dice-four", "dice-one", "dice-six", "dice-three", "dice-two", "digital-tachograph", "directions", "divide", "dizzy", "dna", "dog", "dollar-sign", "dolly", "dolly-flatbed", "donate", "door-closed", "door-open", "dot-circle", "dove", "download", "drafting-compass", "dragon", "draw-polygon", "drum", "drum-steelpan", "drumstick-bite", "dumbbell", "dumpster", "dumpster-fire", "dungeon", "edit", "egg", "eject", "ellipsis-h", "ellipsis-v", "envelope", "envelope-open", "envelope-open-text", "envelope-square", "equals", "eraser", "ethernet", "euro-sign", "exchange-alt", "exclamation", "exclamation-circle", "exclamation-triangle", "expand", "expand-arrows-alt", "external-link-alt", "external-link-square-alt", "eye", "eye-dropper", "eye-slash", "fast-backward", "fast-forward", "fax", "feather", "feather-alt", "female", "fighter-jet", "file", "file-alt", "file-archive", "file-audio", "file-code", "file-contract", "file-csv", "file-download", "file-excel", "file-export", "file-image", "file-import", "file-invoice", "file-invoice-dollar", "file-medical", "file-medical-alt", "file-pdf", "file-powerpoint", "file-prescription", "file-signature", "file-upload", "file-video", "file-word", "fill", "fill-drip", "film", "filter", "fingerprint", "fire", "fire-alt", "fire-extinguisher", "first-aid", "fish", "fist-raised", "flag", "flag-checkered", "flag-usa", "flask", "flushed", "folder", "folder-minus", "folder-open", "folder-plus", "font", "football-ball", "forward", "frog", "frown", "frown-open", "funnel-dollar", "futbol", "gamepad", "gas-pump", "gavel", "gem", "genderless", "ghost", "gift", "gifts", "glass-cheers", "glass-martini", "glass-martini-alt", "glass-whiskey", "glasses", "globe", "globe-africa", "globe-americas", "globe-asia", "globe-europe", "golf-ball", "gopuram", "graduation-cap", "greater-than", "greater-than-equal", "grimace", "grin", "grin-alt", "grin-beam", "grin-beam-sweat", "grin-hearts", "grin-squint", "grin-squint-tears", "grin-stars", "grin-tears", "grin-tongue", "grin-tongue-squint", "grin-tongue-wink", "grin-wink", "grip-horizontal", "grip-lines", "grip-lines-vertical", "grip-vertical", "guitar", "h-square", "hamburger", "hammer", "hamsa", "hand-holding", "hand-holding-heart", "hand-holding-usd", "hand-lizard", "hand-middle-finger", "hand-paper", "hand-peace", "hand-point-down", "hand-point-left", "hand-point-right", "hand-point-up", "hand-pointer", "hand-rock", "hand-scissors", "hand-spock", "hands", "hands-helping", "handshake", "hanukiah", "hard-hat", "hashtag", "hat-wizard", "haykal", "hdd", "heading", "headphones", "headphones-alt", "headset", "heart", "heart-broken", "heartbeat", "helicopter", "highlighter", "hiking", "hippo", "history", "hockey-puck", "holly-berry", "home", "horse", "horse-head", "hospital", "hospital-alt", "hospital-symbol", "hot-tub", "hotdog", "hotel", "hourglass", "hourglass-end", "hourglass-half", "hourglass-start", "house-damage", "hryvnia", "i-cursor", "ice-cream", "icicles", "id-badge", "id-card", "id-card-alt", "igloo", "image", "images", "inbox", "indent", "industry", "infinity", "info", "info-circle", "italic", "jedi", "joint", "journal-whills", "kaaba", "key", "keyboard", "khanda", "kiss", "kiss-beam", "kiss-wink-heart", "kiwi-bird", "landmark", "language", "laptop", "laptop-code", "laptop-medical", "laugh", "laugh-beam", "laugh-squint", "laugh-wink", "layer-group", "leaf", "lemon", "less-than", "less-than-equal", "level-down-alt", "level-up-alt", "life-ring", "lightbulb", "link", "lira-sign", "list", "list-alt", "list-ol", "list-ul", "location-arrow", "lock", "lock-open", "long-arrow-alt-down", "long-arrow-alt-left", "long-arrow-alt-right", "long-arrow-alt-up", "low-vision", "luggage-cart", "magic", "magnet", "mail-bulk", "male", "map", "map-marked", "map-marked-alt", "map-marker", "map-marker-alt", "map-pin", "map-signs", "marker", "mars", "mars-double", "mars-stroke", "mars-stroke-h", "mars-stroke-v", "mask", "medal", "medkit", "meh", "meh-blank", "meh-rolling-eyes", "memory", "menorah", "mercury", "meteor", "microchip", "microphone", "microphone-alt", "microphone-alt-slash", "microphone-slash", "microscope", "minus", "minus-circle", "minus-square", "mitten", "mobile", "mobile-alt", "money-bill", "money-bill-alt", "money-bill-wave", "money-bill-wave-alt", "money-check", "money-check-alt", "monument", "moon", "mortar-pestle", "mosque", "motorcycle", "mountain", "mouse-pointer", "mug-hot", "music", "network-wired", "neuter", "newspaper", "not-equal", "notes-medical", "object-group", "object-ungroup", "oil-can", "om", "otter", "outdent", "pager", "paint-brush", "paint-roller", "palette", "pallet", "paper-plane", "paperclip", "parachute-box", "paragraph", "parking", "passport", "pastafarianism", "paste", "pause", "pause-circle", "paw", "peace", "pen", "pen-alt", "pen-fancy", "pen-nib", "pen-square", "pencil-alt", "pencil-ruler", "people-carry", "pepper-hot", "percent", "percentage", "person-booth", "phone", "phone-slash", "phone-square", "phone-volume", "piggy-bank", "pills", "pizza-slice", "place-of-worship", "plane", "plane-arrival", "plane-departure", "play", "play-circle", "plug", "plus", "plus-circle", "plus-square", "podcast", "poll", "poll-h", "poo", "poo-storm", "poop", "portrait", "pound-sign", "power-off", "pray", "praying-hands", "prescription", "prescription-bottle", "prescription-bottle-alt", "print", "procedures", "project-diagram", "puzzle-piece", "qrcode", "question", "question-circle", "quidditch", "quote-left", "quote-right", "quran", "radiation", "radiation-alt", "rainbow", "random", "receipt", "recycle", "redo", "redo-alt", "registered", "reply", "reply-all", "republican", "restroom", "retweet", "ribbon", "ring", "road", "robot", "rocket", "route", "rss", "rss-square", "ruble-sign", "ruler", "ruler-combined", "ruler-horizontal", "ruler-vertical", "running", "rupee-sign", "sad-cry", "sad-tear", "satellite", "satellite-dish", "save", "school", "screwdriver", "scroll", "sd-card", "search", "search-dollar", "search-location", "search-minus", "search-plus", "seedling", "server", "shapes", "share", "share-alt", "share-alt-square", "share-square", "shekel-sign", "shield-alt", "ship", "shipping-fast", "shoe-prints", "shopping-bag", "shopping-basket", "shopping-cart", "shower", "shuttle-van", "sign", "sign-in-alt", "sign-language", "sign-out-alt", "signal", "signature", "sim-card", "sitemap", "skating", "skiing", "skiing-nordic", "skull", "skull-crossbones", "slash", "sleigh", "sliders-h", "smile", "smile-beam", "smile-wink", "smog", "smoking", "smoking-ban", "sms", "snowboarding", "snowflake", "snowman", "snowplow", "socks", "solar-panel", "sort", "sort-alpha-down", "sort-alpha-up", "sort-amount-down", "sort-amount-up", "sort-down", "sort-numeric-down", "sort-numeric-up", "sort-up", "spa", "space-shuttle", "spider", "spinner", "splotch", "spray-can", "square", "square-full", "square-root-alt", "stamp", "star", "star-and-crescent", "star-half", "star-half-alt", "star-of-david", "star-of-life", "step-backward", "step-forward", "stethoscope", "sticky-note", "stop", "stop-circle", "stopwatch", "store", "store-alt", "stream", "street-view", "strikethrough", "stroopwafel", "subscript", "subway", "suitcase", "suitcase-rolling", "sun", "superscript", "surprise", "swatchbook", "swimmer", "swimming-pool", "synagogue", "sync", "sync-alt", "syringe", "table", "table-tennis", "tablet", "tablet-alt", "tablets", "tachometer-alt", "tag", "tags", "tape", "tasks", "taxi", "teeth", "teeth-open", "temperature-high", "temperature-low", "tenge", "terminal", "text-height", "text-width", "th", "th-large", "th-list", "theater-masks", "thermometer", "thermometer-empty", "thermometer-full", "thermometer-half", "thermometer-quarter", "thermometer-three-quarters", "thumbs-down", "thumbs-up", "thumbtack", "ticket-alt", "times", "times-circle", "tint", "tint-slash", "tired", "toggle-off", "toggle-on", "toilet", "toilet-paper", "toolbox", "tools", "tooth", "torah", "torii-gate", "tractor", "trademark", "traffic-light", "train", "tram", "transgender", "transgender-alt", "trash", "trash-alt", "trash-restore", "trash-restore-alt", "tree", "trophy", "truck", "truck-loading", "truck-monster", "truck-moving", "truck-pickup", "tshirt", "tty", "tv", "umbrella", "umbrella-beach", "underline", "undo", "undo-alt", "universal-access", "university", "unlink", "unlock", "unlock-alt", "upload", "user", "user-alt", "user-alt-slash", "user-astronaut", "user-check", "user-circle", "user-clock", "user-cog", "user-edit", "user-friends", "user-graduate", "user-injured", "user-lock", "user-md", "user-minus", "user-ninja", "user-nurse", "user-plus", "user-secret", "user-shield", "user-slash", "user-tag", "user-tie", "user-times", "users", "users-cog", "utensil-spoon", "utensils", "vector-square", "venus", "venus-double", "venus-mars", "vial", "vials", "video", "video-slash", "vihara", "volleyball-ball", "volume-down", "volume-mute", "volume-off", "volume-up", "vote-yea", "vr-cardboard", "walking", "wallet", "warehouse", "water", "wave-square", "weight", "weight-hanging", "wheelchair", "wifi", "wind", "window-close", "window-maximize", "window-minimize", "window-restore", "wine-bottle", "wine-glass", "wine-glass-alt", "won-sign", "wrench", "x-ray", "yen-sign", "yin-yang"]
    }
    
	// notify the user about something
	notify(type, message) {
        toastr.options = {
            "closeButton": false,
            "preventDuplicates": true,
            "hideDuration": "500",
            "timeOut": "4000",
        }
        if (type == "danger") type = "error"
        if (type != "warning" && type != "success" && type != "info" && type != "error") type = "info"
        toastr[type](message)
	}
    
	// ask the user confirmation about something
	confirm(message, func) {
        bootbox.confirm({
            "message": message,
            "buttons": {
                "cancel": {
                    "label": '<i class="fas fa-times"></i> Cancel'
                },
                "confirm": {
                    "label": '<i class="fas fa-check"></i> Confirm'
                }
            },
            "callback": func
        });
	}
    
    // build a select input with available icons
    select_icon(id) {
        // add options for the icons
        for (var icon of this.icons) {
            $("#"+id).append('<option data-icon="fas fa-'+icon+'" value="'+icon+'">'+icon+'</option>');
        }
        // enable live searches
        $("#"+id).attr("data-live-search", "true")
        $("#"+id).addClass("bootstrap-select")
        // initialize bootstrap select
        $('#'+id).selectpicker();
    }
        
    // clear all running timers
    clear_timers() {
        for (var timer of this.timers) {
            clearInterval(timer)
        }
        this.timers = []
    }
    
    // show a waiting screen until the given configuration is received
    wait_for_configuration(id, message) {
        $("#waiting_body").html('<i class="fas fa-spin fa-spinner"></i> '+message)
        $("#waiting").modal()
        setTimeout(function(this_class, id) {
            return function() {
            this_class.configuration_to_wait = id
            };
        }(this, id), 1000);
    }
    
    // unload the current page
    unload_page() {
        // clear all timers
        this.clear_timers()
        // clear all previously cached settings
        this.requests = {}
        // unsubscribe from all previously subscribed objects
        for (var topic in this.listeners) {
            // rebuild the array of registered widgets
            var new_listener = []
            for (var widget of this.listeners[topic]) {
                // keep only persistent widgets
                if (widget.persistent) new_listener.push(widget)
            }
            this.listeners[topic] = new_listener
            // if there are no more widgets listening for that topic, remove the listener
            if (this.listeners[topic].length == 0) {
                // TODO: do not remove mandatory topics
                this.remove_listener(topic)
                delete this.listeners[topic]
            }
        }
        // close the old page
        if (this.page != null) this.page.close()
    }
    
    // load the page requested in window.hash
    load_page() {
        this.unload_page()
        // move to the top of the page
        window.scrollTo(0,0)
        var page_id = location.hash.replace('#','')
        // remove arguments from the page_id
        if (page_id.includes("=")) {
            var split = page_id.split("=")
            page_id = split[0]
        }
        // if no page is provided, load the default_page
        if (page_id == "") {
            window.location.hash = '#'+gui.settings["default_page"]
            return
        }
        // keep track of the current page
        if (this.remember_page) this.connections.set_page(page_id)
		// if loading the page for the first time, draw the menu and toolbar (otherwise unload_page() would reset pending requests)
		if (! this.first_page_loaded) {
			this.menu.draw()
			this.toolbar.draw()
			this.first_page_loaded = true
		}
        // load system pages
        if (page_id.startsWith("__")) {
            this.page = new Page("SYSTEM", page_id, "")
        }
        // load user's custom page
        else {
            this.waiting_for_page = true
            if (this.page_listener != null) this.remove_listener(this.page_listener)
            this.page_listener = this.add_configuration_listener("gui/pages/"+page_id, this.page_config_schema)
        }
    }

    // What to do just after connecting
    on_connect() {
        $("#status").html('<i class="fas fa-circle text-success"></i> <span style="cursor: default">'+window.EGEOFFREY_GATEWAY_HOSTNAME+'</span>');
    }
    
    // return true if the current user is authorized to access the item, false otherwise
    is_authorized(authorized_groups) {
        // for each authorized group, check if the current user belong to one of them
        for (var group of authorized_groups) {
            if (! (group in this.groups)) continue
            if (this.groups[group].includes(this.username)) return true
        }
        return false
    }
    
    // check if the user is authenticated
    is_authenticated() {
        // authenticate the user
        if (! (this.username in this.users)) this.logout()
        var user = this.users[this.username]
        if ("password" in user && user["password"] != this.password) this.logout()
        var icon = user["icon"] != "" ? user["icon"] : "user"
        $("#user_icon").addClass("fa-"+icon)
        $("#user_fullname").html(user["fullname"])
    }

    // log out the user
    logout() {
        this.logged_in = false
        // clear all timers
        this.clear_timers()
        this.join()
    }
    
    // animate the logo
    animate_logo() {
        var element = $("#logo");
        var duration = 200
        var deg = 15
        var target_degrees = deg;
        $({degrees: target_degrees - deg}).animate({degrees: target_degrees}, {
            duration: duration,
            step: function(now) {
                element.css({
                    transform: 'rotate(' + now + 'deg)'
                });
            },
            complete: function() {
                var target_degrees = 0;
                $({degrees: target_degrees + deg}).animate({degrees: target_degrees}, {
                    duration: duration,
                    step: function(now) {
                        element.css({
                            transform: 'rotate(' + now + 'deg)'
                        });
                    },
                    complete: function() {
                        var target_degrees = - deg;
                        $({degrees: target_degrees + deg}).animate({degrees: target_degrees}, {
                            duration: duration,
                            step: function(now) {
                                element.css({
                                    transform: 'rotate(' + now + 'deg)'
                                });
                            },
                            complete: function() {
                                var target_degrees = 0;
                                $({degrees: target_degrees - deg}).animate({degrees: target_degrees}, {
                                    duration: duration,
                                    step: function(now) {
                                        element.css({
                                            transform: 'rotate(' + now + 'deg)'
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    
    // What to do after starting
    on_start() {
        // ensure the user is authenticated
        this.is_authenticated()
        // user logged in successfully
        this.logged_in = true
        $("#body").html('<center><i class="fas fa-spin fa-spinner"></i> Loading...</center>')
        // periodically send keepalive messages to keep connection open (default timeout is 60 seconds)
        setInterval(function(this_class) {
            return function() {
                var message = new Message(gui)
                message.recipient = "*/*"
                message.command = "KEEPALIVE"
                message.args = "0"
                this_class.send(message)
            };
        }(this), 20000);
        // ping controller/db to ensure it is up and running
        this.database_ping_listener = this.add_inspection_listener("+/+", "+/+", "PONG", "#")
        var message = new Message(gui)
        message.recipient = "controller/db"
        message.command = "PING"
        this.send(message)
        // if a page is requested, load it
        this.load_page()
        // whenever the hash changes, load the requested page
        window.onhashchange = function() {
            gui.load_page()
        }
        // animate the logo icon
        this.animate_logo()
    }
        
    // What to do when exiting
    on_stop() {
        var user = this.users[this.username]
        if (user != null) $("#user_icon").removeClass("fa-"+user["icon"])
    }
    
    // What to do when disconnecting
    on_disconnect() {
        $("#status").html('<i class="fas fa-circle text-danger"></i> <span style="cursor: default">'+window.EGEOFFREY_GATEWAY_HOSTNAME+'</span>');
    }
  
    // What to do when receiving a request for this module
    on_message(message) {
        var delivered = 0
        // dispatch the message to the requesting widget if there is an associated request_id
        var request_id = message.get_request_id()
        if (request_id in this.requests) {
            var widget = this.requests[request_id]
            widget.on_message(message)
            delete this.requests[request_id]
            delivered++
        }
        // deliver the message to any widget waiting for a message on that topic
        if (delivered == 0) {
            for (var topic in this.listeners) {
                // deliver the message to all the listeners
                if (topic_matches_sub(topic, message.topic)) {
                    for (var widget of this.listeners[topic]) {
                        widget.on_message(message)
                        delivered++
                    }
                }
            }
        }
        // keep track of received manifest files
        if (message.command == "MANIFEST") this.manifests[message.args] = message
        // handle ping response from database
        if (! this.database_reachable && message.command == "PONG" && message.sender == "controller/db") {
            this.database_reachable = true
            this.remove_listener(this.database_ping_listener)
            delivered++
        }
        if (delivered == 0) this.log_warning("undelivered message: "+message.dump())
    }
    
    // What to do when receiving a new/updated configuration for this module
    on_configuration(message) {
        // TODO: how to handle sensors/pages/menu removed from config
        if (message.is_null) return
        // hide the waiting screen if received the configuration we were waiting for
        if (this.configuration_to_wait != null && message.args == this.configuration_to_wait) {
            $("#waiting").modal("hide")
            this.configuration_to_wait = null
        }
        // load the page
        if ((this.waiting_for_page && message.args.startsWith("gui/pages/") ) || (this.page != null && message.args == this.page.page_id)) {
            if (message.config_schema != this.page_config_schema) {
                return false
            }
            this.log_debug("Received "+message.args)
            this.page = new Page("USER", message.args, message.get_data())
            this.waiting_for_page = false
        }
        // load charts
        else if (message.args == "gui/charts") {
            if (message.config_schema != this.chart_config_schema) {
                return false
            }
            for (var chart_name in message.get_data()) {
                var chart = message.get(chart_name)
                // if a template is defined, merge the template configuration with the chart configuration
                if ("template" in chart) {
                    this.charts[chart_name] = Object.assign({}, this.charts[chart["template"]], chart)
                }
                else this.charts[chart_name] = chart
            }
        }
        else if (message.args == "house") {
            if (! this.is_valid_configuration(["units", "timezone", "language", "name"], message.get_data())) return false
            this.house = message.get_data()
            // set house name
			$("#house_name").html(this.house["name"].replaceAll(" ","&nbsp;"))
			// populate available connection select
			$("#connections").empty()
			$("#connections").append(new Option("Go To", "__select__"));
			var connections = this.connections.get()
			if (connections != null) {
				// for each saved connection
				for (var connection_id in connections["connections"]) {
					var connection = connections["connections"][connection_id]
					// add a new option to the select
					$("#connections").append(new Option(connection["EGEOFFREY_ID"]+"/"+connection["EGEOFFREY_USERNAME"]+" ("+connection["EGEOFFREY_GATEWAY_HOSTNAME"]+":"+connection["EGEOFFREY_GATEWAY_PORT"]+")", connection_id));
				}
			}
			// configure change event for the session select
			$('#connections').unbind().change(function(this_class) {
				return function () {
					var connection_id = $('#connections').val()
					if (connection_id == "__select__") return
					// restore the selected session
					this_class.connections.restore(connection_id)
					// enable auto logon
					window.EGEOFFREY_AUTOLOGON = 1
					// logout from the current session
					this_class.logout()
				};
			}(this))
            // set house time
            this.date = new DateTimeUtils(message.get("timezone"))
            $("#house_time").html(gui.date.format_timestamp())
            setInterval(function() {
                if (gui.date != null) $("#house_time").html(gui.date.format_timestamp())
            }, 1000);
        }
        else if (message.args == "gui/settings") {
            if (! this.is_valid_configuration(["default_page", "check_for_updates"], message.get_data())) return false
            this.settings = message.get_data()
            // collapse the sidebar if configured
            if ("collapsed_sidebar" in this.settings) {
                if (this.settings["collapsed_sidebar"] && ! $("#index_body").hasClass("sidebar-collapse")) $("#index_body").addClass("sidebar-collapse")
                if (! this.settings["collapsed_sidebar"] && $("#index_body").hasClass("sidebar-collapse")) $("#index_body").removeClass("sidebar-collapse")
            }
            // enable live feed if configured
            if ("live_feed" in this.settings) {
                if (this.settings["live_feed"] && ! this.toolbar.live_feed) this.toolbar.live_feed = true
                if (! this.settings["live_feed"] && this.toolbar.live_feed) this.toolbar.live_feed = false
            }
        }
        else if (message.args == "gui/users") {
            this.users = message.get_data()
            // ensure the user is still authenticated
            this.is_authenticated()
        }
        else if (message.args == "gui/groups") {
            this.groups = message.get_data()
        }
        this.log_debug("Received configuration "+message.args)
        // keep track of the configuration file
        this.configurations[message.args] = message
        // deliver the configuration to any widget waiting for it
        for (var topic in this.listeners) {
            // deliver the message to all the listeners
            if (topic_matches_sub(topic, message.topic)) {
                for (var widget of this.listeners[topic]) {
                    widget.on_configuration(message)
                }
            }
        }
    }
}
