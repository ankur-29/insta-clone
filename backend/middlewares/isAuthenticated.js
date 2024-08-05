import jwt from 'jsonwebtoken';

export const isUserAuthenticated = (req, res, next) => {
    try{
        const token = req.cookies.access_token;
        if(!token) {
            return res.status(401).json({message : 'User not authenticated'});
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(!decode) {
            return res.status(400).json({message : 'Invalid Token'});
        }
        req.id = decode.id;
        next();
    } catch(err) {
        console.log(err);
    }
}