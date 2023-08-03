const { parse } = require('dotenv');
const db = require('../models/db.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const controller =
{
    home: function(req,res)
    {
        console.log(req.session.user);
        if(req.session.user==null)
        {
            res.render('index',
            {
                lin:"login",
                user:'LOGIN'
            });
        }
        else
        {
            res.render('index',
            {
                lin:"editProfile",
                user:req.session.user,
                picture:req.session.picture
            })
        }
    },

    redirectHome: function(req,res)
    {
        res.redirect('/');
    },

    Profile: function(req,res)
    {
        db.getUserReviews(req.session.user, function(reviews)
        {
            console.log(reviews);
            res.render('editProfile',
            {
                pic: req.session.picture,
                name: req.session.user,
                email: req.session.email,
                desc: req.session.desc,
                review: reviews

            });
        });
        
    },

    login: function(req,res)
    {
        res.render('login');        
    },

    register: function(req,res)
    {
        res.render('register');
    },

    registerThru : function(req,res)
    {
        var email = req.body.email;
        var name = req.body.uname;
        var pass = req.body.psw;
        var pic = req.body.avatar;
        var desc = req.body.desc;
        var msg = "Error! Email or Username already taken!";

        bcrypt.hash(pass,saltRounds,function(err,hash)
        {
            var document =
            {
                email: email,
                name : name,
                pass : hash,
                pic : pic,
                desc: desc
            }
                db.regAcc(document,function(flag)
            {
                if(flag)
                {
                    res.render('login');
                }
                else
                {
                    res.render('register',
                    {
                        msg:msg
                    })
                }
            });
        });
    },

    rev : function(req,res)
    {  
        var store = req.query.storeName;
        console.log(store);
        if(req.session.user===null)
            var link = "login";
        else
            var link = "ReviewForUserAccessOnly";

        db.getStoreReviews(store,req.session.user,function(reviews)
        {
            console.log(reviews);
            res.render('ReviewForUserAccessOnly',
            {
                name:req.session.user,
                storeName: store,
                link : link,
                review:reviews
            });
        });
    },

    postRev : async function(req,res)
    {
        var store = req.body.storeName;
        var comment = req.body.commentInput;
        var picture = req.body.imageInput;
        var rating = req.body.stars;
        
        await db.createCollection(store);
        var doc = 
        {
            user : req.session.user,
            comment : comment,
            picture: picture,
            rating : rating,
            helpcount : 0,
            num : 0,
            userPic : req.session.picture,
            hidden : '',
            revID: ''
        }
        db.insertReview(doc,store, function(reviews)
        {
            res.render('ReviewForUserAccessOnly',
            {
                name:req.session.user,
                storeName:store,
                link: 'ReviewForUserAccessOnly',
                review:reviews
            });
        });
    },

    loginIndex : function(req,res)
    {
        console.log("LOGGING IN FROM CONTROLLER!");
        var pass = req.body.psw;
        var doc = {
            name : req.body.uname
        }
        db.findAcc(doc,function(result)
        {
            if(result!==null)
            {
                bcrypt.compare(pass,result.pass,function(err,equal)
                {
                    if(equal)
                    {
                        req.session.user = result.name;
                        req.session.picture = result.pic;
                        req.session.email = result.email;
                        req.session.desc = result.desc;
                        res.render('index',
                        {
                            lin:"editProfile",
                            user:result.name,
                            picture:result.pic
                        }); 
                    }
                    else
                    {
                        res.render('login',
                        {
                            error: "Incorrect Password"
                        });
                    }
                })
                
            }
            else
            {
                console.log("Going back to the corner");
                res.render('login',
                {
                    error: "No User Found in Databse"
                });
            }
            
        })
    },

    logOut : function(req,res)
    {
        req.session.user    = null;
        req.session.picture = null;
        req.session.email   = null;
        req.session.desc    = null;

        res.redirect('/');
    },

    updateH : function(req,res)
    {
        var name = req.query.name
        var comm = req.query.comment;
        var num = parseInt(req.query.num);
        var store = req.query.store;
        var value = parseInt(req.query.value);

        var query = 
        {
            user : name,
            comment : comm,
            num : num
        }
        console.log(query);
        db.updateRevCount(query,value,store, function(final)
        {
            console.log(final);
            res.type('text/plain');
            res.write(""+final);
            res.end();
        });
    },

    updateC : function(req,res)
    {
        var name = req.query.name;
        var comm = req.query.comment;
        var num = parseInt(req.query.num);
        var store = req.query.store;
        var value = req.query.value.toString();
        var strFR = value.replace(/\s+/g,'-');
        var revID = name+strFR+num;
        console.log("Saved " + revID + "|");
        var query = {
            user : name,
            comment: comm,
            num: num
        };

        db.updateRevCom(query,store, value, revID);

        res.type('text/plain');
        res.write(value.length+"+"+value+"+"+revID);
        res.end();
    },

    delete : function(req, res)
    {
        var store = req.query.store;
        var value = req.query.value;

        var query = {
            revID : value
        };

        try
        {
            db.deleteRev(query,store);
            res.type('text/plain');
            res.write('true');
        }
        catch(error)
        {
            res.type('text/plain');
            res.write('false');
        }
        res.end();
    },

    validateEmail : async function(req,res)
    {
        var email = req.query.email;

        var doc = 
        {
            email:email
        }

        var acc = await db.findAcc(doc,function(result)
        {
            if(result!==null)
            {
                res.type('text/plain');
                res.write('gagi-wag');
                
            }
            
        })
        res.end();
    },

    validateName : async function(req,res)
    {
        var name = req.query.name;

        var doc = 
        {
            name:name
        }

        var acc = await db.findAcc(doc,function(result)
        {
            if(result!==null)
            {
                res.type('text/plain');
                res.write('gagi-wag');
                
            }
            
        })
        res.end();
    }
}

module.exports = controller;