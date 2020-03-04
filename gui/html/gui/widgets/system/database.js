// Database widget
class Database extends Widget {
    constructor(id, widget) {
        super(id, widget)
        // add an empty box into the given column
        this.add_large_box(this.id, this.widget["title"])
    }
    
    format_size(size) {
        if (size > 1000000) return (Math.round((size/1000000)*100)/100)+" Mb"
        if (size > 1000) return (Math.round((size/1000)*100)/100)+" Kb"
        else return size+" bytes"
    }
    
    // draw the widget's content
    draw() {
        // IDs Template: _box, _title, _refresh, _popup, _body, _loading
        // IDs Widget: _table
        var body = "#"+this.id+"_body"
        // add table
        // 0: key
        // 1: count
        // 2: size
        // 3: start
        // 4: end
        // 5: value
        $(body).empty()
        $(body).append('<div class="text-muted float-left" id="'+this.id+'_header"></div>')
        var table = '\
            <table id="'+this.id+'_table" class="table table-bordered table-striped">\
                <thead>\
                    <tr><th>Key</th><th># Entries</th><th>Size</th><th>Oldest</th><th>Newest</th><th>Last Value</th></tr>\
                </thead>\
                <tbody></tbody>\
            </table>'
        $(body).append(table)
        // how to render the timestamp
        function render_timestamp(data, type, row, meta) {
            if (type == "display") return gui.date.timestamp_difference(gui.date.now(), data)
            else return data
        };
        // how to render a size
        var this_class = this
        function render_size(data, type, row, meta) {
            if (type == "display") {
                return this_class.format_size(data)
            }
            else return data
        };
        // define datatables options
        var options = {
            "responsive": true,
            "dom": "Zlfrtip",
            "fixedColumns": false,
            "paging": true,
            "lengthChange": false,
            "searching": true,
            "ordering": true,
            "info": true,
            "autoWidth": false,
            "columnDefs": [ 
                {
                    "targets" : [3, 4],
                    "render": render_timestamp,
                },
                {
                    "targets" : [2],
                    "render": render_size,
                },
                {
                    "className": "dt-center",
                    "targets": [1, 2, 3, 4]
                }
            ],
            "language": {
                "emptyTable": '<span id="'+this.id+'_table_text"></span>'
            }
        };
        // create the table
        $("#"+this.id+"_table").DataTable(options);
        $("#"+this.id+"_table_text").html('<i class="fas fa-spinner fa-spin"></i> Loading')
        // ask the database for statistics
        var message = new Message(gui)
        message.recipient = "controller/db"
        message.command = "STATS"
        this.send(message)
    }
    
    // receive data and load it into the widget
    on_message(message) {
        if (message.command == "STATS") {
            var table = $("#"+this.id+"_table").DataTable()
            var output = message.get_data()
            $("#"+this.id+"_header").html(output["database_type"]+" v"+output["database_version"]+" - database size "+this.format_size(output["database_size"]))
            var entries = output["keys"]
            for (var entry of entries) {
                table.row.add([entry[0], entry[1], entry[2], entry[3], entry[4], format_multiline(truncate(entry[5].replaceAll("\n", "<br>"), 100), 50)])
            }
            table.draw()
            table.responsive.recalc()
            if (table.data().count() == 0) $("#"+this.id+"_table_text").html('No data to display')
        }
    }
    
    // receive configuration
    on_configuration(message) {
    }
}