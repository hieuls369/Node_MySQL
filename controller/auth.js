const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register = (req, res) => {
    console.log(req.body);

    const { name, email, password, passwordConfirm } = req.body;

    db.query('select email from user where email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error);
        }
        if (result.length > 0) {
            return res.render('register', {
                message: 'That email is already in use'
            })
        } else if (password != passwordConfirm) {
            return res.render('register', {
                message: 'The password do not match'
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('insert into user set ? ', {
            name: name,
            email: email,
            password: hashedPassword
        }, (error, result) => {
            if (error) {
                console.log(error);
            } else {
                return res.render('register', {
                    message: 'User registered'
                });
            }
        });

    });


}
exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).render('login', {
                message: 'Please provide an email and password'
            })
        }

        db.query('select  * from user where email = ?', [email], async (error, result) => {
            console.log(result);
            if(!result || !(await bcrypt.compare(password, result[0].password))){
                res.status(401).render('login', {
                    message: 'Email or Password is incorrect'
                })
            }else{
                const id = result[0].id;

                const token = jwt.sign({id: id}, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("The token is: " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ), httpOnly: true

                    
                }
                res.cookie('jwt', token, cookieOptions)
                res.status(200).redirect("/");
            }
        })

    } catch (error) {
        console.log(error);
    }
} 