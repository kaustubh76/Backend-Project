import { Router } from "express";
// This function will handle the user registration logic.
import { registerUser } from "../controllers/user.controller.js";
// This middleware handles file uploads.
import { upload } from "../middlewares/multer.middleware.js";

// Creating a new instance of the router object using the Router function.
const router = Router()

// Defining a POST route at the '/register' path.
// This route will handle user registration.
// The 'upload.fields' middleware is applied to this route to handle file uploads for two fields: 
// After the files are uploaded, the 'registerUser' controller function is executed.
router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1},  
        {name: "coberImage", maxCount: 8}  
    ]),
    registerUser 
)

export default router
