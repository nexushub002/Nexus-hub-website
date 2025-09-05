// ProductCart.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    if (!product) {
        return <div>Loading...</div>; // or return null
    }

    const {
        _id,
        name,
        priceRange,
        moq,
        images = [],
    } = product;

    const handleProductCardClick = () => {
        console.log(_id);
        const slug = name.toLowerCase().split(" ").join("-");
        console.log("Navigating with product id:", product._id);

        navigate(`/product-detail/${_id}`);
    };

    const mainImage = images[0] || "";

    return (
        <div>
            <div className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-all p-3 w-64"
                onClick={handleProductCardClick}
                style={{ cursor: "pointer" }}>
                {/* Product Image */}
                <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded-lg">
                    <img
                        src={mainImage}
                        alt={product.name}
                        className="object-cover w-full h-full"
                    />
                </div>

                {/* Product Details */}
                <div className="mt-3">
                    {/* Title */}
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="text-lg font-bold text-gray-900 mt-1">
                        ${product.priceRange?.min} - ${product.priceRange?.max}
                    </div>

                    {/* MOQ */}
                    <p className="text-xs text-gray-500 mt-1">
                        MOQ: {product.moq}
                    </p>

                    {/* Verified + Years */}
                    {/* <div className="flex items-center gap-2 mt-2">
            {product.verified && (
                <span className="text-xs bg-blue-100 text-blue-600 font-medium px-2 py-1 rounded">
                Verified
                </span>
            )}
            <span className="text-xs text-gray-500">{product.years} yrs • CN</span>
            </div> */}
                </div>
            </div>
        </div>
    )
}

export default ProductCard