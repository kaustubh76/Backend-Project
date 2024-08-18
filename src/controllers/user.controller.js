import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User} from "../models/user.model.js";

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

   const {fullname, email, username, password} = req.body
   console.log("email: ", email)

//   ------------------- BEGINNER CHOICE-------------------------
//    if(fullname === ""){
//          throw new ApiError(400, "Fullname is required")
//    }


//    ------------------- INTERMEDIATE CHOICE-------------------------
    if(
        [fullname, email, username, password].some((field) => field?.trim() === "" )
    ){
        throw new ApiError(400, "All fields are required")
    }
    
    const existedUser = User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(400, "User already exists")
    }
})

export {registerUser}