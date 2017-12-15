
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendNotification = functions.database.ref('/rooms/{roomId}').onWrite((event) => {
    const data = event.data;
    console.log('Message received');
    if(!data.changed()){
        console.log('Nothing changed');
        return;
    }else{
        console.log(data.val());
    }
    console.log('roomId = ', event.params.roomId);
    console.log('data.numChildren() = ', data.numChildren());
    console.log('data.val().name = ', data.val().name);

    var ref = event.data.ref;
    ref.update({
        "messageCount": data.numChildren()
    });

    const payLoad = {
        notification:{
            title: event.params.roomId,
            body: data.val().name,
            sound: "default"
        }
    };

    const options = {
        priority: "high",
        timeToLive: 60*60*2
    };

    return admin.messaging().sendToTopic("notifications", payLoad, options);
});

// exports.sendFollowerNotification = functions.database.ref('/rooms/{followedUid}/{followerUid}').onWrite(event => {
//   const followerUid = event.params.followerUid;
//   const followedUid = event.params.followedUid;
//   // If un-follow we exit the function.
//   if (!event.data.val()) {
//     return console.log('User ', followerUid, 'un-followed user', followedUid);
//   }
//   console.log('We have a new follower UID:', followerUid, 'for user:', followerUid);

//   // Get the list of device notification tokens.
//   const getDeviceTokensPromise = admin.database().ref(`/users/${followedUid}/notificationTokens`).once('value');

//   // Get the follower profile.
//   const getFollowerProfilePromise = admin.auth().getUser(followerUid);

//   return Promise.all([getDeviceTokensPromise, getFollowerProfilePromise]).then(results => {
//     const tokensSnapshot = results[0];
//     const follower = results[1];

//     // Check if there are any device tokens.
//     if (!tokensSnapshot.hasChildren()) {
//       return console.log('There are no notification tokens to send to.');
//     }
//     console.log('There are', tokensSnapshot.numChildren(), 'tokens to send notifications to.');
//     console.log('Fetched follower profile', follower);

//     // Notification details.
//     const payload = {
//       notification: {
//         title: 'You have a new follower!',
//         body: `${follower.displayName} is now following you.`,
//         icon: follower.photoURL
//       }
//     };

//     // Listing all tokens.
//     const tokens = Object.keys(tokensSnapshot.val());

//     // Send notifications to all tokens.
//     return admin.messaging().sendToDevice(tokens, payload).then(response => {
//       // For each message check if there was an error.
//       const tokensToRemove = [];
//       response.results.forEach((result, index) => {
//         const error = result.error;
//         if (error) {
//           console.error('Failure sending notification to', tokens[index], error);
//           // Cleanup the tokens who are not registered anymore.
//           if (error.code === 'messaging/invalid-registration-token' ||
//               error.code === 'messaging/registration-token-not-registered') {
//             tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
//           }
//         }
//       });
//       return Promise.all(tokensToRemove);
//     });
//   });
// });