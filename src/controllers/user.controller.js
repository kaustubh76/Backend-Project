import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens =  async(userId) => {
    try {
        const User = await User.findById(userId)
        const refreshToken= user.generateRefreshToken
        const accessToken = user.generateAccessToken

        user.refreshToken = refreshToken
        await user.save({ValiditeBeforeState: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something in build issue")
    }
}

const registerUser = asyncHandler(async (req,res) => {
   // Get user details from frontend
   // validation of data form == not empty
   //check if user already exist:username, email
   // check for images, check for avatar
   // upload them to cloudinary , avatar
   // create user object - create entry in db
   // remove password and refresh token field from response
   // check fro user creation 
   // return response 

    // Get user details from frontend
   const {fullname, email, username, password} = req.body
   console.log("email: ", email)

//   ------------------- BEGINNER CHOICE-------------------------
//    if(fullname === ""){
//          throw new ApiError(400, "Fullname is required")
//    }


   // validation of data form == not empty

//    ------------------- INTERMEDIATE CHOICE-------------------------
    if(
        [fullname, email, username, password].some((field) => field?.trim() === "" )
    ){
        throw new ApiError(400, "All fields are required")
    }
    
    //check if user already exist:username, email

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    // check for images, check for avatar
    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(res.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

       // upload them to cloudinary , avatar

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // create user object - create entry in db

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    // remove password and refresh token field from response

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check fro user creation 

    if (!createdUser) {
        throw new ApiError(500, "User creation failed")
    }
    
    // return response 

    return res.status(201).json(
        new ApiResponse(201, "User created successfully", createdUser)
    )


})

const loginUser = asyncHandler(async (req, res) => {
    // Get user details from frontend
    // validation of data form == not empty
    // check if user already exist:username, email
    // find the user
    // check if password is correct
    // generate access and refresh token
    // send cookie

    const {email, username, password} = req.body

    if(!(username || email)) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = User.findOne({
        $or: [{ email }, { username }] // mongodb operators
    })

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiError(401, "Password is incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
        
    }

    res.status(200).cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    // If the user itself want to save the token locally
    .json(                      
        // This is the .data form from utils folder in ApiResponse.js file
        new ApiResponse(200, 
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )  
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    // Get the refresh token from the cookie
    // Find the user
    // Remove the refresh token
    // Send response

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {new: true}
    )

    const options = {
        httpOnly: true,
        secure: true,
        
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{}, "User logged out successfully"))

    
})

const refreshAccessToken = asyncHandler( async (req, res) => {
    // Access the refreshAccessToken -> cookies
    // Verify the incoming token -> JWT
    // Find the user -> _id
    // Check if the incoming token is same as the stored token
    // Generate new access and refresh token

   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken
   if(!incomingRefreshToken) {
         throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, emv.process.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(404, "User not found")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {accessToken , refreshToken: newRefreshToken}, "AccessTOken refreshed successfully"  
        )
    )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh TOken")
    }
})

export {registerUser, loginUser, logoutUser, refreshAccessToken }