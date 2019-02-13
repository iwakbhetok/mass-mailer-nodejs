/*
 * File Name : Server.js
 * Task : Run Server and fetch multiple emails from DB to send reminder
 * Invoke all the email task at once and update DB once the email is sent 
*/

/*
 * Load all the required modules 
*/
var smtpTransport = require('nodemailer-smtp-transport');
var async = require("async");
var http = require("http");
var nodemailer = require("nodemailer");
// This will store emails needed to send.
var listofemails = [  "abdul.gofur@1011.id", "abdul.createit@gmail.com", "elzapratamaputra@gmail.com"]; 
// Will store email sent successfully.
var success_email = [];
// Will store email whose sending is failed. 
var failure_email = [];

var transporter;

/* Loading modules done. */

function massMailer() {
	var self = this;
	transporter = nodemailer.createTransport(smtpTransport({
        pool: true,
        host: "mail.kuismilioner.com",
        port: 465,
        secure: true, // use TLS
        auth: {
          user: "newsletter@kuismilioner.com",
          pass: "yourpassword"
        },
        tls: {rejectUnauthorized: false},
        debug:true
    })
);

	// Fetch all the emails from database and push it in listofemails
	self.invokeOperation();
};

/* Invoking email sending operation at once */

massMailer.prototype.invokeOperation = function() {
	var self = this;
	async.each(listofemails,self.SendEmail,function(){
		console.log(success_email);
		console.log(failure_email);
	});
}

/* 
* This function will be called by multiple instance.
* Each instance will contain one email ID
* After successfull email operation, it will be pushed in failed or success array.
*/

massMailer.prototype.SendEmail = function(Email,callback) {
	console.log("Sending email to " + Email);
	var self = this;
	self.status = false;
	// waterfall will go one after another
	// So first email will be sent
	// Callback will jump us to next function
	// in that we will update DB
	// Once done that instance is done.
	// Once every instance is done final callback will be called.
	async.waterfall([
		function(callback) {				
			var mailOptions = {
				from: '"Kuismilioner" newsletter@kuismilioner.com',
				to: Email,
				subject: 'Hi ! This is newsletter from Kuismilioner Updated', 
                text: "Hello Kuismilioner !",
                html:"<p>HTML version of <b>the message</b> updated.</p><br><img src='https://www.cloudamqp.com/img/screens/new-rabbitmq-manager.jpg'>"
			};
			transporter.sendMail(mailOptions, function(error, info) {				
				if(error) {
					console.log(error)
					failure_email.push(Email);
				} else {
					self.status = true;
					success_email.push(Email);
				}
				callback(null,self.status,Email);
			});
		},
		function(statusCode,Email,callback) {
				console.log("Will update DB here for " + Email + "With " + statusCode);
				callback();
		}
		],function(){
			//When everything is done return back to caller.
			callback();
	});
}

new massMailer(); //lets begin
