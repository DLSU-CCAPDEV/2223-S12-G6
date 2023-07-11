const controller =
{
    home: function(req,res)
    {
        res.render('index',{
            lin:"login",
            user:"LOGIN"
        });
    },
    redirectHome: function(req,res)
    {
        res.redirect('/');
    },
    Profile: function(req,res)
    {
        res.render('editProfile');
    },
    login: function(req,res)
    {
        res.render('login');
    },
    register: function(req,res)
    {
        res.render('index');
    },
    review: function(req,res)
    {
        res.render('index');
    }
}

module.exports = controller;