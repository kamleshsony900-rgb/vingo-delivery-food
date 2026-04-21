import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { serverUrl, MyContext } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

const EditItem = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openAlertBox } = useContext(MyContext); // context for toast
  const { itemId } = useParams();
  const { myShopData } = useSelector((state) => state.owner);

  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("");
  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState(null);

  const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ];

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  // Fetch current item by ID
  useEffect(() => {
    const handleGetItemById = async () => {
      setLoading(true);
      try {
        const result = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, { withCredentials: true });
        setCurrentItem(result?.data);
      } catch (err) {
        openAlertBox("error", err.response?.data?.message || "Failed to fetch item");
      } finally {
        setLoading(false);
      }
    };
    handleGetItemById();
  }, [itemId, openAlertBox]);

  // Set form values when currentItem is loaded
  useEffect(() => {
    if (currentItem) {
      setName(currentItem?.name || "");
      setPrice(currentItem?.price || 0);
      setCategory(currentItem?.category || "");
      setFoodType(currentItem?.foodType || "");
      setFrontendImage(currentItem?.image || "");
    }
  }, [currentItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Frontend validation
    if (!name?.trim()) {
      openAlertBox("error", "Item name is required");
      setLoading(false);
      return;
    }
    if (!category) {
      openAlertBox("error", "Category is required");
      setLoading(false);
      return;
    }
    if (!foodType) {
      openAlertBox("error", "Food type is required");
      setLoading(false);
      return;
    }
    if (!price || Number(price) <= 0) {
      openAlertBox("error", "Price must be positive");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(`${serverUrl}/api/item/edit-item/${itemId}`, formData, { withCredentials: true });
      dispatch(setMyShopData(result.data));
      openAlertBox("success", "Item updated successfully!");
      navigate("/");
    } catch (err) {
      openAlertBox("error", err.response?.data?.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center flex-col items-center p-6 bg-linear-to-br from-orange-50 relative to-white min-h-screen">
      <div className="absolute top-2.5 left-2.5 z-10 mb-2.5" onClick={() => navigate("/")}>
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
      </div>

      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-4">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">Edit Food</div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Name */}
          <input
            type="text"
            placeholder="Enter Item Name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />

          {/* Image */}
          <input
            type="file"
            accept="image/*"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={handleImage}
          />
          {frontendImage && (
            <img src={frontendImage} alt="image" className="w-full h-48 object-cover border rounded-lg mt-4" />
          )}

          {/* Price */}
          <input
            type="number"
            placeholder="Price"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setPrice(e.target.value)}
            value={price}
          />

          {/* Category */}
          <select
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            <option value="">Select Category</option>
            {categories.map((cate, i) => (
              <option value={cate} key={i}>{cate}</option>
            ))}
          </select>

          {/* Food Type */}
          <select
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setFoodType(e.target.value)}
            value={foodType}
          >
            <option value="veg">Veg</option>
            <option value="non veg">Non-Veg</option>
          </select>

          {/* Submit */}
          <button
            className="w-full bg-[#ff4d2d] text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditItem;