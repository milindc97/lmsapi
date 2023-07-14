const db = require("../models");
const { user: User, role: Role, refreshToken: RefreshToken, programAllocation: ProgramAllocation,group:Group,userRequests: UserRequests, notificationTrans:NotificationTrans} = db;
var bcrypt = require("bcryptjs");
const { spawn } = require('child_process');
const mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
const Sentry = require('@sentry/node');

const agenda = require("../../agenda.js");
const moment = require('moment-timezone');

exports.getAllUsers = (req, res) => {

  User.aggregate([{ $match: { roles: "user",status:1 } }, { $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'groupDetails' } }], (err, data) => {
    if (err) {
      res.status(500).send({error:{ status: "error", message: "Something Went Wrong!" }});
    } else {
      res.status(200).send({
        status: "success",
        message: "All Users retrieved",
        data: data
      });
    }
  });
}

exports.getAllSessionActivityPrintData = async (req, res) => {
  let users = await User.find({roles:'user',status:1});
  let data = [];
  users.map((uData,index) => {
    if(uData.logoutTime != undefined && uData.lastLoginOn != undefined){
      if(moment(uData.logoutTime).tz('Asia/Kolkata').valueOf() > moment(uData.lastLoginOn).tz('Asia/Kolkata').valueOf()){
        uData.timeDuration = '-';
      }else{
        let lastLoginOn = moment(uData.lastLoginOn).tz('Asia/Kolkata');
        let logoutTime = moment(uData.logoutTime).tz('Asia/Kolkata');
        let duration = moment.duration(lastLoginOn.diff(logoutTime));
        let hh = duration.hours().toString().padStart(2, '0');
        let mm = duration.minutes().toString().padStart(2, '0');
        let ss = duration.seconds().toString().padStart(2, '0');
        uData.timeDuration = `${hh}:${mm}:${ss}`;
      }
    }else{
      uData.timeDuration = '-';
    }
    data.push({
      "SR": index+1,
      "Login Time":(uData['lastLoginOn'] != undefined)?moment(uData['lastLoginOn']).tz('Asia/Kolkata').format('DD MMM, YYYY hh:mm:ss a'):'',
      "Logout Time":(uData['logoutTime'] != undefined)?moment(uData['logoutTime']).tz('Asia/Kolkata').format('DD MMM, YYYY hh:mm:ss a'):'',
      "Emp Code": uData['employeeCode'],
      "Name": uData['salutation'] + ' ' + uData['firstName'] + ' ' + uData['lastName'],
      "Designation":uData['designation'],
      "Department":uData['department'],
      "Branch":uData['branch'],
      "cluster":uData['cluster'],
      "State": uData['state'],
      "Mobile": uData['mobile'],
      "Time Duration": (uData['timeDuration'] != '-')?moment(uData['timeDuration']).tz('Asia/Kolkata').format('DD MMM, YYYY hh:mm:ss a'):''
    })
  })
  res.status(200).send({
    status: "success",
    message: "All Users retrieved",
    data: data
  });
}

exports.getAllDepartments = async (req, res) => {
  let user = await User.aggregate(
    [
       // Second Stage
       {
        $match: { roles: "user",status:1 }
      },
      // First Stage
      {
        $group :
          {
            _id : "$department",
            count: { $sum: 1 }
          }
       },
      
     ]
   );
   res.status(200).send({
    status: "success",
    message: "All Departments retrieved",
    data: user
  });
}

exports.getAllProfilePicUpdation = async (req, res) => {
  let user = await User.find({photoStatus:"Pending"});
   res.status(200).send({
    status: "success",
    message: "All Users retrieved",
    data: user
  });
}

exports.getAllUsersByPagination = async (req, res) => {
  const q = req.query.q || undefined;
  const page = parseInt(req.params.page) || 1;
  const limit = 200;
  const skip = (page - 1) * limit;
  const status = req.query.status || undefined;
  let currentDate = moment().tz('Asia/Kolkata');
  let yesterdayDate = moment().tz('Asia/Kolkata').subtract(1, 'days');
  let sevenDaysDate = moment().tz('Asia/Kolkata').subtract(7, 'days')
  let kpi = {
    total:0,
    today:0,
    sevenDay:0
  }
  kpi.total = await User.countDocuments({roles:'user',status:1,lastLoginOn:{$exists:true}});
  
  kpi.today = await User.countDocuments({roles:'user',status:1,lastLoginOn:{$exists:true,$gt:yesterdayDate,$lte:currentDate}});
  kpi.sevenDay = await User.countDocuments({roles:'user',status:1,lastLoginOn:{$exists:true,$gt:sevenDaysDate,$lte:currentDate}});
  if(status == 0 || status == 1){
    
    User.find({roles:"user",status:parseInt(status),$or: [ {firstName:{ $regex: new RegExp(q), $options: 'i' }},{lastName:{ $regex: new RegExp(q), $options: 'i' }},{email:{ $regex: new RegExp(q), $options: 'i' }},{employeeCode:{ $regex: new RegExp(q), $options: 'i' }},{department:{ $regex: new RegExp(q), $options: 'i' }},{designation:{ $regex: new RegExp(q), $options: 'i' }}]}).countDocuments().then(emps=>{
      const hasMore = emps > skip + limit;
      const totalPages = emps/limit;
      User.aggregate([{ $match: { roles: "user",status:parseInt(status), $or: [ {firstName:{ $regex: new RegExp(q), $options: 'i' }},{lastName:{ $regex: new RegExp(q), $options: 'i' }},{email:{ $regex: new RegExp(q), $options: 'i' }},{employeeCode:{ $regex: new RegExp(q), $options: 'i' }},{department:{ $regex: new RegExp(q), $options: 'i' }},{designation:{ $regex: new RegExp(q), $options: 'i' }}] } }, { $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'groupDetails' } },{ $sort: { firstName: 1 } },{ $skip: skip },
      { $limit: limit }], (err, data) => {
        if (err) {
          res.status(500).send({error:{ status: "error", message: "Role must not be Empty" }});
        } else {
          res.status(200).send({
            status: "success",
            message: "All Users retrieved",
            page:page,
            totalPages: Math.ceil(totalPages),
            hasMore:hasMore,
            totalEmp:emps,
            count:data.length,
            data: data,
            kpi:kpi
          });
        }
      });
    });  
  } else {
    User.find({roles:"user",$or: [ {firstName:{ $regex: new RegExp(q), $options: 'i' }},{lastName:{ $regex: new RegExp(q), $options: 'i' }},{email:{ $regex: new RegExp(q), $options: 'i' }},{employeeCode:{ $regex: new RegExp(q), $options: 'i' }},{department:{ $regex: new RegExp(q), $options: 'i' }},{designation:{ $regex: new RegExp(q), $options: 'i' }}]}).countDocuments().then(emps=>{
      const hasMore = emps > skip + limit;
      const totalPages = emps/limit;
      User.aggregate([{ $match: { roles: "user", $or: [ {firstName:{ $regex: new RegExp(q), $options: 'i' }},{lastName:{ $regex: new RegExp(q), $options: 'i' }},{email:{ $regex: new RegExp(q), $options: 'i' }},{employeeCode:{ $regex: new RegExp(q), $options: 'i' }},{department:{ $regex: new RegExp(q), $options: 'i' }},{designation:{ $regex: new RegExp(q), $options: 'i' }}] } }, { $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'groupDetails' } },{ $sort: { firstName: 1 } },{ $skip: skip },
      { $limit: limit }], (err, data) => {
        if (err) {
          res.status(500).send({error:{ status: "error", message: "Role must not be Empty" }});
        } else {
          res.status(200).send({
            status: "success",
            message: "All Users retrieved",
            page:page,
            totalPages: Math.ceil(totalPages),
            hasMore:hasMore,
            totalEmp:emps,
            count:data.length,
            data: data,
            kpi:kpi
          });
        }
      });
    });  
  }

  
}


exports.getAllUsersByStatus = (req, res) => {

  User.aggregate([{ $match: { roles: "user", status: req.body.status } },{ $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'groupDetails' } }], (err, data) => {
    if (err) {
      res.status(500).send({error:{ status: "error", message: "Role must not be Empty" }});
    } else {
      res.status(200).send({
        status: "success",
        message: "All Users retrieved",
        data: data
      });
    }
  });
}

exports.getAllUsersByDept = (req, res) => {

  User.aggregate([{ $match: { roles: "user", department: req.params.department, status:1 } }, { $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'groupDetails' } }], (err, data) => {
    if (err) {
      res.status(500).send({error:{ status: "error", message: "Role must not be Empty" }});
    } else {
      res.status(200).send({
        status: "success",
        message: "All Users retrieved",
        data: data
      });
    }
  });
}

exports.getAllUsersByGroup = (req, res) => {

  User.aggregate([{ $match: { roles: "user", group: mongoose.Types.ObjectId(req.params.group),status:1 } }, { $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'groupDetails' } }], (err, data) => {
    if (err) {
      res.status(500).send({error:{ status: "error", message: "Role must not be Empty" }});
    } else {
      res.status(200).send({
        status: "success",
        message: "All Users retrieved",
        data: data
      });
    }
  });
}

exports.getTotalEmployeeCount = async (req, res) => {
  let totalEmp = 0;
  let activeEmp = 0;
  let deacEmp = 0;
  let assEmp = 0;

  totalEmp = await User.find({ roles: "user" }).countDocuments();
  activeEmp = await User.find({ roles: "user",status: 1  }).countDocuments();
  deacEmp =  await User.find({ roles: "user", status: 0 }).countDocuments();
  assEmp = await ProgramAllocation.distinct("employeeId").countDocuments();

  res.status(200).send({
    status: "success",
    message: "All Users retrieved",
    totalEmp: totalEmp,
    activeEmp: activeEmp,
    deactiveEmp: deacEmp,
    assignedEmp: assEmp,
    pendingEmp: totalEmp - assEmp
  });

}

exports.insertLogoutTime = (req, res) => {
  User.findByIdAndUpdate(req.params.id, { $set: { logoutTime:moment().tz('Asia/Kolkata') } }, (err, data) => {
    if (err) {
      res.status(500).send({error:{ status: "error", message: err }});
    } else {
      res.status(200).send({
        status: "success",
        message: "User updated successfully",
        data: data
      });
    }
  });
}

exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(req.params.id, { $set: { profilephoto: req.body.profilephoto, firstName: req.body.firstName, lastName: req.body.last_name, salutation: req.body.salutation, email: req.body.email, mobile: req.body.mobile, dob: req.body.dob, gender: req.body.gender, department: req.body.department } }, (err, data) => {
    if (err) {
      res.status(500).send({error:{ status: "error", message: err }});
    } else {
      res.status(200).send({
        status: "success",
        message: "User updated successfully",
        data: data
      });
    }
  });
}

exports.update = (req, res) => {
  User.findByIdAndUpdate(req.params.id, { $set: req.body }, (err, data) => {
    if (err) {
      res.status(500).send({error:{ status: "error", message: err }});
    } else {
      if(req.body.profileUpdate){
        let notTrnasAr = [];
        notTrnasAr.push({
          userId: req.params.id,
          title: "Photo upload request submission",
          message: 'Your photo upload request has been submitted. You will be notified on approval.',
          image: req.body.dummyphoto,
          createdAt: moment().tz('Asia/Kolkata'),
          status: 0
        });
        NotificationTrans.insertMany(notTrnasAr);
      }
      res.status(200).send({
        status: "success",
        message: "User updated successfully",
        data: data
      });
    }
  });
}

exports.updateImportUser = async (req, res) => {

  try{
    const date = moment().tz('Asia/Kolkata');

    const currentDate = moment.tz(date, 'Asia/Kolkata');
    await agenda.schedule(currentDate, 'userImport',{ data:  JSON.stringify(req.body.data), userdata: JSON.stringify(req.userData)});
    // const data = JSON.stringify(req.body.data);
    // const userdata = JSON.stringify(req.userData);

    // const CHUNK_SIZE = 500; // Number of records to send in each chunk
    // const dataArray = JSON.parse(data);

    // // Split the data into chunks
    // const chunks = [];
    // for (let i = 0; i < dataArray.length; i += CHUNK_SIZE) {
    //   chunks.push(dataArray.slice(i, i + CHUNK_SIZE));
    // }

    // let chunkLength = chunks.length;
    // for (let i = 0; i <chunks.length;i++) {
    //   let chunk = chunks[i];

    //   const child = spawn('node', ['./app/controllers/background/userImport.js',JSON.stringify(chunk),userdata,chunkLength,i],{
    //     stdio: 'inherit',
    //   });
      
    //   child.on('error', (err) => {
    //     Sentry.captureException(new Error('Error starting background process '+ err))
    //     console.error(`Error starting background process: ${err}`);
    //   });

    //   child.on('exit', (code) => {
    //     console.log(`Child process completed with code ${code}`);
    //   });

    // }

    res.status(200).send({
      status: "success",
      message: `${req.body.data.length} records updating in background. Notification will be received once process completed`,
    });
  } catch(error){
    Sentry.captureException(new Error('Error '+ error))
    console.log(error);
  }

}



exports.singleUser = (req, res) => {
  User.findById(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({error:{ status: "error", message: err }});
    } else {
      res.status(200).send({
        status: "success",
        message: "Single User retrieved",
        data: data
      });
    }
  });
}

exports.changeUserPassword = (req, res) => {

  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      res.status(500).send({error:{ status: "error", message: err }});
      return;
    }

    let passwordIsValid = bcrypt.compareSync(
      req.body.currentPassword,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(500).send({error:{
        status: "error",
        message: "Invalid Current Password!",
      }});
    }

    User.findByIdAndUpdate(req.params.id, { $set: { password: bcrypt.hashSync(req.body.newPassword, 8) } }, (err, data) => {
      if (err) {
        res.status(500).send({error:{ status: "error", message: err }});
      } else {
        res.status(200).send({
          status: "success",
          message: "Password changed successfully"
        });
      }
    });

  });

}
exports.birthdaysonweek = (req, res) => {

  User.aggregate([
    {
      $project: {
        firstName: 1,
        lastName: 1,
        salutation: 1,
        birthDate: { $dateFromParts: { 'year': { $year: moment().tz('Asia/Kolkata') }, 'month': { $month: '$dob' }, 'day': { $dayOfMonth: '$dob' } } },
      },
    },
    {
      $match: {
        $expr: {
          $eq: [{ $week: '$birthDate' }, { $week: moment().tz('Asia/Kolkata') }],
        },
      }
    },
    {
      $sort: {
        birthDate: 1
      }
    }
  ], (err, data) => {
    if (err) {
      res.status(500).send({error:{ status: "error", message: err }});
    }
    for (let i in data) {
      var currentDate = moment().tz('Asia/Kolkata');
      currentDate.add(1, 'day');
      var curDate = moment().tz('Asia/Kolkata');
      curDate.subtract(1, 'day');

      if (moment().tz('Asia/Kolkata').date() === moment(data[i].birthDate).tz('Asia/Kolkata').date() && (moment().tz('Asia/Kolkata').month() + 1) === moment(data[i].birthDate).tz('Asia/Kolkata').month()) {
        data[i].day = "Today";
      }
      if (moment(currentDate).tz('Asia/Kolkata').date() === moment(data[i].birthDate).tz('Asia/Kolkata').date() && (moment().tz('Asia/Kolkata').month() + 1) === moment(data[i].birthDate).tz('Asia/Kolkata').month()) {
        data[i].day = "Tomorrow";
      }
      if (moment(curDate).tz('Asia/Kolkata').date() === moment(data[i].birthDate).tz('Asia/Kolkata').date() && (moment().tz('Asia/Kolkata').month() + 1) === moment(data[i].birthDate).tz('Asia/Kolkata').month()) {
        data[i].day = "Yesterday";
      }
    }
    setTimeout(() => {
      res.status(200).send({
        status: "success",
        message: "Password changed successfully",
        data: data
      });
    }, 1000);


  })
};

exports.updateStatusUser = (req, res) => {
  User.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } }, (err, data) => {
    if (err) {
      res.status(500).send({error:{ status: "error", message: err }});
    } else {
      res.status(200).send({
        status: "success",
        message: "User status updated successfully",
        data: data
      });
    }
  });
}

exports.updateProfileStatusUser = async (req, res) => {
  let user = await User.findById(req.params.id);
  let dummyphoto =  user.dummyphoto;
  if(req.body.photoStatus == 'Approve'){
    User.findByIdAndUpdate(req.params.id, { $set: { photoStatus: req.body.photoStatus,profilephoto:user.dummyphoto,dummyphoto:"" } }, (err, data) => {
      if (err) {
        res.status(500).send({error:{ status: "error", message: err }});
      } else {
        let notTrnasAr = [];
        notTrnasAr.push({
          userId: req.params.id,
          title: "Photo upload request approved",
          message: 'Your photo upload request has been approved.',
          image: dummyphoto,
          createdAt: moment().tz('Asia/Kolkata'),
          status: 0
        });
        NotificationTrans.insertMany(notTrnasAr);
        res.status(200).send({
          status: "success",
          message: "User status updated successfully",
          data: data
        });
      }
    });
  }else{
    User.findByIdAndUpdate(req.params.id, { $set: { photoStatus: req.body.photoStatus,photoRemark:req.body.photoRemark,dummyphoto:"" } }, (err, data) => {
      if (err) {
        res.status(500).send({error:{ status: "error", message: err }});
      } else {
        let notTrnasAr = [];
        notTrnasAr.push({
          userId: req.params.id,
          title: "Photo upload request rejected",
          message: 'Your photo upload request has not been approved. <br>' +req.body.photoRemark,
          image: dummyphoto,
          createdAt: moment().tz('Asia/Kolkata'),
          status: 0
        });
        NotificationTrans.insertMany(notTrnasAr);
        res.status(200).send({
          status: "success",
          message: "User status updated successfully",
          data: data
        });
      }
    });
  }
 
}

exports.updateActiveWallStatusUser = (req, res) => {
  
  User.findByIdAndUpdate(req.params.id, { $set: { activeWallApproval: req.body.status } }, (err, data) => {
    if (err) {
      res.status(500).send({error:{ status: "error", message: err }});
    } else {
      res.status(200).send({
        status: "success",
        message: "User status updated successfully",
        data: data
      });
    }
  });
}

exports.getUserHeadKpi = async (req, res) => {
  let notOnRole = 0;
  let newEnroll = 0;
  let totalEmp = 0;
  let activeEmp = 0;
  let inactiveEmp = 0;

  totalEmp = await User.find({ roles: "user" }).countDocuments();
  activeEmp = await User.find({ status: 1 }).countDocuments();
  inactiveEmp = await User.find({ status: 0 }).countDocuments();
  notOnRole =  await UserRequests.find({}).countDocuments();
  newEnroll = await UserRequests.find({status: 1}).countDocuments();

  res.status(200).send({
    status: "success",
    message: "All Users retrieved",
    totalEmp: totalEmp,
    activeEmp: activeEmp,
    inactiveEmp: inactiveEmp,
    notOnRole: notOnRole,
    newEnroll: newEnroll
  });

}



exports.getAdminAllUsers =async (req, res) => {

  let adminUsers = await User.find({roles:"admin", $or: [{isSuperAdmin:{$eq:false}},{isSuperAdmin:{$exists:false}}]}).exec();
  res.status(200).send({
    status: "success",
    message: "All Users retrieved",
    data: adminUsers
  });
  
}

exports.createUser = (req, res) => {
  
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    mobile: req.body.mobile,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    status: 1,
    roles:req.body.roles
  });

  user.save((err, user) => {
    console.log(err);
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    res.status(200).send({ message: "User was created successfully!" });
  });
};