import express,  { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


interface MyJwtPayload extends JwtPayload {
    userId: string;
}  

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const auth = (req:Request, res:Response, next:NextFunction) => {

    const openPaths = ['/login', '/signup'];
  
    if (openPaths.includes(req.path)) {
        return next();
    } else {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(403).json({ message: 'Verification error' });
                }
                req.headers['userId'] = (decoded as MyJwtPayload).userId;
                next()
            })
        } else {
            next();
        }
    }


  
}

export default auth