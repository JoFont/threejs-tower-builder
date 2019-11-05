const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();


const db = admin.firestore();

exports.createPlayer = functions.auth.user().onCreate((user) => {
    const userData = {
        uid: user.uid,
        name: user.displayName,
        highScore: 0,
        scoreHistory: [],
        photoURL: user.photoURL
    };

    return db.doc(`players/${user.uid}`).set(userData);
});


// TODO: UPDATE THIS, CLIENT NEEDS TO FETCH AND THEN SEND REQUEST TO UPDATE;
// TODO: LIKE THIS IT'S NOT WORKING
exports.addToLeaderboard = functions.https.onCall((data, context) => {
    const score = data.score;
    const date = data.date;
    const user = context.auth.uid;
    
    let fetchedData = db.doc(`players/${user}`).get();
    return fetchedData;
    // return highScore;

    // let finalScore = score > highScore ? score : highScore;

    // return db.doc(`players/${user.uid}`).update({
    //     highScore: finalScore,
    //     scoreHistory: admin.firestore.FieldValue.arrayUnion({score: score, date: date})
    // });
});
