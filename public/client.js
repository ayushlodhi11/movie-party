$(document).ready(function() {
    //Check if the user is rejoining
    //ps: This value is set by Express if browser session is still valid
    var user = $('#user').text();
    var socket = undefined;
    var user_id = makeid();
    var autoUpdateingVideoAction = {seek: false, playPause: false};
    // show join box
    if (user === "") {
        $('#ask').show();
        $('#ask input').focus();
    } else { //rejoin using old session
        join(user);
    }

    // join on enter
    $('#ask input').keydown(function(event) {
        if (event.keyCode == 13) {
            $('#ask a').click();
        }
    });


    $('#ask a').click(function() {
        join($('#ask input').val());
    });


    var vid = document.getElementById("myVideo");

    // Assign an ontimeupdate event to the <video> element, and execute a function if the current playback position has changed
    vid.onseeked = function() {sendVideoUpdateActions("seek")};
    vid.onpause = function() {sendVideoUpdateActions("playPause")};
    vid.onplaying = function() {sendVideoUpdateActions("playPause")};

    function initSocketIO() {
        // if(typeof session_id === "undefined" || user === ""){
        //     return
        // }
        /*
         Connect to socket.io on the server.
         */
        var host = window.location.host //.split(':')[0];
        var is_https = location.protocol === 'https:'
        socket = io.connect((is_https ? 'https://' : 'http://') + host, {
            secure: is_https,
            reconnect: true,
            'try multiple transports': false,
            transports: ['websocket'], upgrade: false
        });
        var intervalID;
        var reconnectCount = 0;

        socket.on('connect', function() {
            console.log('connected');
            // send join message
            socket.emit('joinstream', JSON.stringify({session_id: session_id, type: "join"}));
        });
        socket.on('connecting', function() {
            console.log('connecting');
        });
        socket.on('disconnect', function() {
            console.log('disconnect');
            intervalID = setInterval(tryReconnect, 4000);
        });
        socket.on('connect_failed', function() {
            console.log('connect_failed');
        });
        socket.on('error', function(err) {
            console.log('error: ' + err);
        });
        socket.on('reconnect_failed', function() {
            console.log('reconnect_failed');
        });
        socket.on('reconnect', function() {
            console.log('reconnected ');
        });
        socket.on('reconnecting', function() {
            console.log('reconnecting');
        });

        var tryReconnect = function() {
            ++reconnectCount;
            if (reconnectCount == 5) {
                clearInterval(intervalID);
            }
            $.ajax('/')
                .success(function() {
                    console.log("http request succeeded");
                    //reconnect the socket AFTER we got jsessionid set
                    io.connect('http://' + host, {
                        reconnect: false,
                        'try multiple transports': false
                    });
                    clearInterval(intervalID);
                }).error(function(err) {
                    console.log("http request failed (probably server not up yet)");
                });
        };



        var container = $('div#msgs');


        socket.on(session_id, function(msg) {
            var message = JSON.parse(msg);
            var moviedata = message.moviedata;
            var action = message.action;
            var sender_user_id = message.user_id;
            var struct = container.find('li.message:first');

            // if (struct.length < 1) {
            //     console.log("Could not handle: " + message);
            //     return;
            // }
            // get a new message view from struct template
            var messageView = struct.clone();

            // set time
            var time = (new Date()).toString("HH:mm:ss")
            var state = moviedata.play ? "Play" : "Pause";
            var currentTime = moviedata.time;
            messageView.find('.message').html(message.user + ": <b> " + message.msg + ": " + state + "</b> <small> currentTime: "+currentTime+ "on: "+ time+"</small>");
            container.find('ul').prepend(messageView.show());
            // console.log(sender_user_id, user_id, message)
            if (sender_user_id !== undefined && sender_user_id != user_id){
            // console.log(sender_user_id, user_id, message)
                performVideoUpdateActions(moviedata);
            }
        });


        $('#channel #input .action').click(function(event) {
            event.preventDefault();
            var action = $(this).attr("id");
            var play = action == "play" ? true : false;
            var moviedata = {play: play, time: 1};
            socket.emit("socketstream", JSON.stringify({
                type: 'action',
                session_id: session_id,
                moviedata: moviedata
            }));
        });
    }


    function join(name) {
        $('#ask').hide();
        $('#channel').show();
        $('input#message').focus();


        $.post('/user', {
            "user": name
        }).success(function() {
            initSocketIO();
        }).error(function() {
            console.log("error");
        });
    }

    function sendVideoUpdateActions(type){
        var vid = document.getElementById("myVideo");
        console.log(autoUpdateingVideoAction[type])
        if(vid.controls && !autoUpdateingVideoAction[type]){
            var moviedata = getMovieData();

            socket.emit("socketstream", JSON.stringify({
                type: 'action',
                session_id: session_id,
                moviedata: moviedata,
                user_id: user_id
            }));
        }
        autoUpdateingVideoAction[type] = false
        console.log(autoUpdateingVideoAction)
        vid.controls = true
    }

    function performVideoUpdateActions(moviedata){
        var vid = document.getElementById("myVideo");
        vid.controls = false
        autoUpdateingVideoAction = {seek: true, playPause: true}
        var currentMoveieData = getMovieData();
        vid.currentTime = moviedata.time
        if(currentMoveieData.play != moviedata.play){
            if(moviedata.play){
                console.log("22")
                vid.play();
            }else{
                console.log("11")
                vid.pause();
            }
        }
    }

    function getMovieData(){
        var vid = document.getElementById("myVideo");
        return {play: !vid.paused, time: vid.currentTime}
    }

    function makeid() {
        var length = 5;
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

});