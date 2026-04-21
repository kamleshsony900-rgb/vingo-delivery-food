import shopModel from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image;

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    let shop = await shopModel.findOne({ owner: req.userId });

    if (!shop) {
      // CREATE
      shop = await shopModel.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.userId,
      });
    } else {
      // UPDATE
      shop.name = name ?? shop.name;
      shop.city = city ?? shop.city;
      shop.state = state ?? shop.state;
      shop.address = address ?? shop.address;
      if (image) shop.image = image;

      await shop.save();
    }

    // Proper populate
    await shop.populate(["owner", "items"]);

    return res.status(201).json(shop);

  } catch (error) {
    return res.status(500).json({ message: `create shop error: ${error.message}` });
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await shopModel
      .findOne({ owner: req.userId })
      .populate("owner").populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    return res.status(200).json(shop);

  } catch (error) {
    return res.status(500).json({ message: `get my shop error: ${error.message}` });
  }
};


export const getShopByCity = async (req, res) => {
     try {
      const {city} = req.params;

      const shops = await shopModel.find({
        city:{$regex:new RegExp(`^${city}$`, "i")}
      }).populate("items")

      if(!shops){
        return res.status(400).json({ message: "Shop not found" });
      }

       return res.status(200).json(shops);
      
     } catch (error) {
       return res.status(500).json({ message: `get shop by city error: ${error.message}` });
     }
}
