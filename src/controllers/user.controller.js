import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export {registerUser}