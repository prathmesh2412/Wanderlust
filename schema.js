const joi = require("joi");

module.exports.listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        location: joi.string().required(),
        country: joi.string().required(),
        price: joi.number().required().min(0),
        image: joi.alternatives().try(
            joi.string().allow(""),
            joi.object({
                url: joi.string().allow(""),
                filename: joi.string().allow("")
            })
        ).allow(null),
        category: joi.string()
          .valid('Beach','Mountains','City','Countryside','Island','Historical','Adventure','Pool','Camping','Farm','Arctic','Boat')
          .required(),
    }).required(),
});

module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required(),
    }).required(),
});