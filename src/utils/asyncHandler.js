// Define a function 'asyncHandler' that takes a 'requestHandler' function as an argument.
const asyncHandler = (requestHandler) => {

    // Return a new function that takes 'req' (request), 'res' (response), and 'next' (next middleware) as arguments.
    return async (req, res, next) => {

        // Call the 'requestHandler' function and ensure it returns a resolved promise.
        // If the promise is rejected (i.e., an error occurs), pass the error to the 'next' middleware to handle it.
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
    };
}
export { asyncHandler }


// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
        
//     } catch (error) {
//         res.status(err.code || 500 ).json ({
//             success: false,
//             message: err.message 
//         })
//     }
// }