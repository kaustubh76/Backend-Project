import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"

// Export a middleware function to verify JWT tokens
export const verifyJWT = asyncHandler( async (req, _, next) => {
    try {
        // Extract the token from cookies or Authorization header
        // The '?.' is the optional chaining operator, used to safely access nested properties
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")

        if(!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        // Verify the token using the secret key stored in environment variables
        // jwt.verify() decodes the token and checks its validity
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // Find the user in the database using the ID from the decoded token
        // .select() is used to exclude password and refreshToken fields from the result
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        // If no user is found, throw a not found error
        if(!user){
            // TODO: Discuss about frontend handling of this error
            throw new ApiError(404, "User not found")
        }

        // Attach the user object to the request for use in subsequent middleware or route handlers
        req.user = user;

        // Call the next middleware in the chain
        next()
    } catch (error) {
        // If any error occurs during the process, throw an invalid token error
        // The '?.' operator is used to safely access the error message property
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})