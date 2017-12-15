
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendNotification = functions.database.ref('/rooms/{roomId}').onWrite((event) => {
    const data = event.data;
    console.log('Message received');
    var ref = event.data.ref;
    ref.update({
        "messageCount": data.numChildren()
    });

    const payLoad = {
        notification:{
            title: 'Message received',
            body: 'You have message in ${data.val().name}',
            sound: "default"
        }
    };

    const options = {
        priority: "high",
        timeToLive: 60*60*2
    };

    return admin.messaging().sendToTopic("notifications", payLoad, options);
});