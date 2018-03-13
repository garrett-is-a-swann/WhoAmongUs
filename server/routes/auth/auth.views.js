const express = require('express')
const router = express.Router();

const db = require('../../db')

function checkUsername(username) {
    return new Promise((resolve, reject)=> {
        if(/^[a-zA-Z0-9._!@$~|-]{4,64}$/.exec(username) == null) {
            resolve({success:false, message:'Error: Improper format for username.'})
        }
        return db.query('SELECT username FROM wau.userlogin WHERE username = $1', [username], (err, res) => {
            if(err) {
                reject(err);
                return;
            }
            if(res.rowCount) {
                const resp = {success: false, message:res.rows[0].username+' has been taken.'}
                resolve(resp)
            }
            else {
                const resp = {success: true, message:username+' is available.'}
                resolve(resp);
            }
        })
    })

}

function checkPassword(password) {
    return new Promise((resolve, reject) => {
        if(/[!-~]{8,64}/.exec(password) == null) {
            resolve({success:false, message:'Error: Improper format for password.'});
            return;
        }
        if( /(?=.*[a-z])/.exec(password) == null
            || /(?=.*[A-Z])/.exec(password) == null
            || /(?=.*[!-@[-`{-~])/.exec(password) == null)
        {
            resolve({success:false, message:'Error: Improper format for password.'});
            return;
        }
        resolve({success:true, message:'Valid password.'});
    });
}

function checkEmail(email) {
    return new Promise((resolve, reject) => {
        if( email == undefined || email.length == 0 ) {
            resolve({success: true, message: 'Email is optional'});
            return;
        }
        if(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.exec(email) == null) {
            resolve({success:false, message:'Error: Improper format for email.'});
        }
        return db.query('SELECT email FROM wau.user WHERE email = $1;', [email], (err, res) => {
            if(err) {
                reject(err);
                return;
            }
            if(res.rowCount) {
                resolve({success: false, message:res.rows[0].email+' has been taken.'});
                return;
            }
            else {
                resolve({success: true, message:email+' is available.'});
                return;
            }
        });
    });
}

function checkForm(form) {
    return new Promise(async (resolve, reject) => {
        var formCheck = {
            username:await checkUsername(form.username)
            ,password:await checkPassword(form.password)
            ,email:await checkEmail(form.email)
        }
        console.log(formCheck.username.success , formCheck.password.success , formCheck.email.success);
        if( formCheck.username.success && formCheck.password.success && formCheck.email.success ) {
            resolve({success:true, message:'All methods passed checks'})
            return;
        }
        resolve({success:false, message:'Error: One or methods failed checks.', json:formCheck});
    });
}

module.exports = {
    checkUsername: checkUsername,
    checkEmail: checkEmail,
    checkForm: checkForm
}
