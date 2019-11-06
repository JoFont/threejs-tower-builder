const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();


const db = admin.firestore();

exports.createPlayer = functions.auth.user().onCreate((user) => {
    const userData = {
        uid: user.uid,
        name: user.displayName === null ? "Anonymous" : user.displayName,
        highScore: 0,
        scoreHistory: [],
        photoURL: user.photoURL
    };

    return db.doc(`players/${user.uid}`).set(userData);
});



exports.addToLeaderboard = functions.https.onCall((data, context) => {
    const score = data.score;
    const date = data.date;
    const user = context.auth;
    const name = data.name;
    
    return db.doc(`players/${user.uid}`).update({
        highScore: score,
        name: name,
        scoreHistory: admin.firestore.FieldValue.arrayUnion({score: score, date: date})
    });
});
