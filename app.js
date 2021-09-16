const express = require('express')
const mysql = require('mysql2')     // Module cho phép sử dụng cơ sở dữ liệu mySQL 
const mqtt = require('mqtt')        // Module cho phép sử dụng giao thức mqtt
const path = require('path')

const app = express()

app.use(express.static("public"))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const port = process.env.PORT || 6060
const server = require("http").Server(app)
const io = require('socket.io')(server)

app.get('/', (req, res) => {
    res.render('dashboard')
})

app.get('/history', (req, res) => {
    res.render('history')
})

app.get('/user', (req, res) => {
    res.render('user')
})

server.listen(port, () => {
    console.log("Running on port: " + port);
});

//-------------------------------CONNECT MQTT, SUBCRIBE TOPIC------------------------------
var client = mqtt.connect('mqtt://broker.emqx.io');

client.on("connect", function () {//create a listener, waits for the connect event and calls a callback function
    console.log("MQTT CONNECT = " + client.connected);//The on_connect event sets a flag called connected to true.
});

client.subscribe("home/dht11");

// -------------------------------------------------CONNECT SQL---------------------------------------------
var con = mysql.createConnection({
    host: 'asian-database.cwjqhs6n9ucg.ap-southeast-1.rds.amazonaws.com',
    port: '3306',
    user: 'root',
    password: '12345678',
    database: 'rdsDatabase'
    // host: 'localhost',
    // user: 'root',
    // port: 3306,
    // password: '1234',
    // database: 'myDatabase'
});

//---------------------------------------------CREATE TABLE in MySQL-------------------------------------------------
var checkTable = "show tables like 'sensors';"
function createTable(){
    con.connect(function (err) {
        if (err) throw err;
        console.log("MySQL CONNECTED");
        var sql = "CREATE TABLE IF NOT EXISTS sensors (ID int(10) not null primary key auto_increment, Time datetime not null, Temperature int(3) not null, Humidity int(3) not null, Lux int(3) not null )"
        con.query(sql, function (err) {
            if (err)
                throw err;
            console.log("Table CREATED");
        });
    })
} 

// //---------------------------------------- MQTT -> SQL --------------------------------------------
var humi_graph = [];
var temp_graph = [];
var date_graph = [];
var lux_graph = [];
var newTemp
var newHumi
var newLux
var progress = 0;

client.on('message', function (topic, message, packet) {//create a listener for this event (subscribed topic)
    console.log("Topic: " + topic)
    console.log("Message: " + message)
    const objData = JSON.parse(message)// {"Tempertature" = XX; "Humidity" = XX}
    if (topic == "home/dht11") {
        progress = 1;
        newTemp = objData.Temperature;
        newHumi = objData.Humidity;
        newLux = objData.Lux;
    }

    if (progress == 1) {
        progress = 0
        con.query(checkTable, function (err, result, fields) {
            if (err) throw err;
            if (result.length == 1) {
                console.log("Insert into Database")
                var n = new Date()
                var Date_and_Time = n.getFullYear() + "-" + (n.getMonth() + 1) + "-" + (n.getDate() + 1) + " " + (n.getHours() - 17) + ":" + n.getMinutes() + ":" + n.getSeconds();

                var sql = "INSERT INTO sensors (Time, Temperature, Humidity, Lux) VALUES ('" + Date_and_Time.toString() + "', '" + newTemp + "', '" + newHumi + "', '" + newLux + "')"
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Table INSERTED: " + Date_and_Time + " " + newTemp + " " + newHumi + " " + newLux)
                });

                //push to chart
                var sql1 = "SELECT * FROM sensors ORDER BY ID DESC limit 8"
                con.query(sql1, function (err, result, fields) {
                    if (err) throw err;
                    console.log("FROM sensors ORDER BY ID DESC limit 8");
                    i = 0;
                    result.forEach(function (value) {
                        // console.log("Time:" + value.Time.toString().slice(4, 24) + "; " + "Temperature:" + value.Temperature + "; " + "Humidity:" + value.Humidity + "; " + "Lux:" + value.Lux);
                        date_graph[i] = value.Time.toString().slice(4, 24);
                        humi_graph[i] = value.Humidity;
                        temp_graph[i] = value.Temperature;
                        lux_graph[i] = value.Lux;
                        i++;
                    })
                    //may be
                    io.sockets.emit("server-update-graph", { date_graph, temp_graph, humi_graph, lux_graph });
                });
            }
            else{
                console.log("Table doesn't exist, create a table");
                createTable()
            }
        });
    }
})

//----Socket-------------------------------------
io.on('connection', function (socket) {
    socket.on("disconnect", function()
    {
    });

    socket.on("client-send-data", function (data) {
        console.log(data);
        if (data == "on") {
            console.log("Bật")
            client.publish("led", 'on');
        }
        else if (data == "off"){
            console.log("Tắt")
            client.publish("led", 'off');
        }
    });

    con.query(checkTable, function (err, result, fields) {
        if (err) throw err;
        if (result.length == 1) {
            // get all data
            var fullData = "SELECT * FROM sensors ORDER BY ID DESC"
            con.query(fullData, function (err, result, fields) {
                if (err) throw err;
                console.log("Full Database selected");
                var tempFulldata = []
                var m_time
                result.forEach(function (value) {
                    m_time = value.Time.toString().slice(4, 24);
                    tempFulldata.push({ id: value.ID, time: m_time, temp: value.Temperature, humi: value.Humidity, lux: value.Lux })
                })
                socket.emit('full_database', tempFulldata)
            });

            //get 8 newest row data and push to chart
            var sql1 = "SELECT * FROM sensors ORDER BY ID DESC limit 8"
            con.query(sql1, function (err, result, fields) {
                if (err) throw err;
                console.log("Push to chart");
                i = 0;
                result.forEach(function (value) {
                    date_graph[i] = value.Time.toString().slice(4, 24);
                    humi_graph[i] = value.Humidity;
                    temp_graph[i] = value.Temperature;
                    lux_graph[i] = value.Lux;
                    i++;
                });
                socket.emit("server-update-graph", { date_graph, temp_graph, humi_graph, lux_graph });
            });
        }
        else{
            console.log("Table doesn't exist, create a table");
            createTable()
        }   
    })
})