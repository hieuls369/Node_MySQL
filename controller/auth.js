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

        db.query('select  * from user where email = ?')

    } catch (error) {
        console.log(error);
    }
} 