const MongoClient = require('mongodb').MongoClient;
const process = require('process');

// Connection URL
const url = process.env.MONGO_URL;

// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect(function(err) {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Connected successfully to server");

    const db = client.db();

    const OrganizationDashboard = db.collection('OrganizationDashboard');
    const Dashboard = db.collection('Dashboard');
    (async () => {
        let all = await OrganizationDashboard.count();
        let done = 0;
        OrganizationDashboard.find().forEach(function(orgDash) {
            Dashboard.updateMany({_id: orgDash.dashboardId}, {$set: {organizationId: orgDash.organizationId}}, (err, _) => {
                console.log(++done + " / " + all);
            });
        });
    })();

});