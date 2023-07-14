const db = require("../../models");
const mongoose = require('mongoose');
const data = process.argv[2];
const dataArray = JSON.parse(data);
const userData = JSON.parse(process.argv[3]);
const chunkLength = process.argv[4];
const chunkI = process.argv[5];
console.log(chunkLength,chunkI);
const moment = require('moment-timezone');

if (!data) {
  console.log('No data received from API call');
  process.exit(1);
}



db.mongoose.ConnectionStates;
// console.log(db.mongoose.ConnectionStates);

(async () => {

  await mongoose.connect('mongodb://fusionProduction:fusion97Production@115.112.190.170:27017/admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log('Connected to database');
  })
  .catch((error) => {
    // console.error(`Error connecting to database: ${error}`);
  });

  await convertGroupCodetoId();

})();

async function convertGroupCodetoId(){
  
  for(let i = 0;i<dataArray.length;i++){
    dataArray[i].activeWallApproval = (dataArray[i].activeWallApproval == 'true' || dataArray[i].activeWallApproval == 'TRUE' || dataArray[i].activeWallApproval== true) ? true:false;
    dataArray[i].status = (dataArray[i].status == 'Active' || dataArray[i].status == 'active' || dataArray[i].status== 1) ? 1:0;
    if(dataArray[i].group !== "" && dataArray[i].group !== undefined && dataArray[i].group !== null){
      let g = dataArray[i].group.replace("G","");
      let group = await db.group.find({code:g}).limit(1).exec();
      await db.user.findOneAndUpdate({employeeCode:dataArray[i].employeeCode}, { $set: {group:group[0]._id,activeWallApproval:Boolean(dataArray[i].activeWallApproval)} });
    }else {
      await db.user.findOneAndUpdate({employeeCode:dataArray[i].employeeCode}, { $set: {group:null,activeWallApproval:Boolean(dataArray[i].activeWallApproval)} });
    }

    if((i == dataArray.length-1) && (parseInt(chunkLength)*1) == (parseInt(chunkI)*1)+1){
      console.log("Sync Completed");
        let notData = {
            userId:userData._id,
            title:"Employee Import Completed",
            message:"Great! Employee data has been updated.",
            createdAt:moment().tz('Asia/Kolkata'),
            status:0
        };
        await db.notificationTrans.create(notData);
        process.exit(1);
    }
  }
  
}
