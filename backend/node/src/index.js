const express = require("express");
const bodyParser = require("body-parser");

const { PORT } = require('./config/serverconfig');
const ApiRoutes = require('./routes/index');

const db=require('./models/index');
//const city =require("./models/city");
const {Medicine}= require('./models/index');
const cors = require("cors");


const setupAndStartServer = async()=>{

    const app=express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use('/api',ApiRoutes);

    app.listen(PORT,async ()=>{
        console.log(`server started at ${PORT}`);
    /*
    if(process.env.SYNC_DB){
        db.sequelize.sync({alter:true})
            .then(() => console.log('Database synced successfully'))
            .catch((err) => console.log('Database sync failed', err));
    }
    */
        
    });

}

setupAndStartServer();