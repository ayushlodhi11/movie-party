$(document).ready(function() {
    //Check if the user is rejoining
    //ps: This value is set by Express if browser session is still valid
    var user = $('#user').text();
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


    function initSocketIO() {
        // if(typeof session_id === "undefined" || user === ""){
        //     return
        // }
        /*
         Connect to socket.io on the server.
         */
        var host = window.location.host //.split(':')[0];
        var is_https = location.protocol === 'https:'
        var socket = io.connect((is_https ? 'https://' : 'http://') + host, {
            secure: is_https,
            reconnect: true,
            'try multiple transports': false,
            transports: ['websocket'], upgrade: false
        });
        var intervalID;
        var reconnectCount = 0;
        const messageContainer = document.getElementById('message-container')
        const messageForm = document.getElementById('send-container')
        const messageInput = document.getElementById('message-input')

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

        appendMessage('You joined')
        socket.emit('new-user', name)

        socket.on('chat-message', data => {
          appendMessage(`${data.name}: ${data.message}`)
        })

        socket.on('user-connected', name => {
          appendMessage(`${name} connected`)
        })

        socket.on('user-disconnected', name => {
          appendMessage(`${name} disconnected`)
        })

        messageForm.addEventListener('submit', e => {
          e.preventDefault()
          const message = messageInput.value
          appendMessage(`You: ${message}`)
          socket.emit('send-chat-message', message)
          messageInput.value = ''
        })

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}

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
            var struct = container.find('li.message:first');

            // if (struct.length < 1) {
            //     console.log("Could not handle: " + message);
            //     return;
            // }
            // get a new message view from struct template
            var messageView = struct.clone();

            // set time
            var time = (new Date()).toString("HH:mm:ss")
            var action = moviedata.play ? "Play" : "Pause";
            messageView.find('.message').html(message.user + ": <b> " + message.msg + ": " + action + "</b> <small>" + time+"</small>");
            container.find('ul').append(messageView.show());
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

});
