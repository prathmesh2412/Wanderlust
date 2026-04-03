const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// passport-local-mongoose uses a default export; require() returns
// an object with the function on the `default` property in CommonJS builds.
// grab the function itself so schema.plugin receives a function.
const passportLocalMongoose =
  require("passport-local-mongoose").default ||
  require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },

    // ✅ Profile Image
    image: {
        url: {
            type: String,
            default: "https://via.placeholder.com/150?text=Avatar"
        },
        filename: String
    }
});

userSchema.plugin(passportLocalMongoose); //Automatically username, Hashing, salting, hash it automatically implemente

module.exports = mongoose.model("User", userSchema);