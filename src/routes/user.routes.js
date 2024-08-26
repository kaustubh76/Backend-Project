import { Router } from "express";
// This function will handle the user registration logic.
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
// This middleware handles file uploads.
import { upload } from "../middlewares/multer.middleware.js";
import jwt from "jsonwebtoken";
const { verify } = jwt;
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Creating a new instance of the router object using the Router function.
const router = Router()

// Defining a POST route at the '/register' path.
// This route will handle user registration.
// The 'upload.fields' middleware is applied to this route to handle file uploads for two fields: 
// After the files are uploaded, the 'registerUser' controller function is executed.
router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1},  
        {name: "coverImage", maxCount: 8}  
    ]),
    registerUser 
)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post( refreshAccessToken )
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user" ).get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar" ).patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-Image").patch(verifyJWT, upload.single("coverImage") , updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)


export default router
