const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.refreshToken = require("./refreshToken.model");
db.questionBank = require("./questionBank.model");
db.question = require("./question.model");
db.module = require("./module.model");
db.course = require("./courses.model");
db.learningActivity = require("./learningActivity.model");
db.program = require("./program.model");
db.programAllocation = require("./programAllocation.model");
db.audit = require("./audit.model");
db.notification = require("./notification.model");
db.quizScore = require("./quizScore.model");
db.modulesWatch = require("./modulesWatch.model");
db.coursesWatch = require("./coursesWatch.model");
db.programsWatch = require("./programsWatch.model");
db.learningActivityWatch = require("./learningActivityWatch.model");
db.learningActivityModule = require("./learningActivityModule.model");
db.questionBanksWatch = require("./questionBanksWatch.model");
db.userRequests = require("./userRequests.model");
db.notificationTrans = require("./notificationTrans.model");
db.support = require("./support.model");
db.policy = require("./policy.model");
db.certificate = require("./certificates.model");
db.config = require("./config.model");
db.supporttransaction = require("./supportTransaction.model");
db.post = require("./post.model");
db.postlikes = require("./postlikes.model");
db.news = require("./news.model");
db.group = require("./group.model");
db.leaderboard = require("./leaderboard.model");
db.mail = require("./mail.model");
db.trainingGlimpse = require("./training-glimpse.model");
db.rewardPoints = require("./rewardPoints.model");
db.redeemItems = require("./redeemItems.model");
db.ceo = require("./ceo.model");
db.redeemReward = require("./redeemReward.model");
db.allocation = require("./allocation.model");
db.winners = require("./winners.model");
db.appversion = require("./appversion.model");

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;