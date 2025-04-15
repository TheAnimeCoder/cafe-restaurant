import React, { useRef, useEffect, useState } from "react";
import "./Slider2.css";

const Slider2 = () => {
  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const descriptions = [
    {
      title: "Aloo Pakora",
      description: "Creamy, rich, tomato-based curry",
      recipe: "Cook tomato gravy, add paneer",
      imgSrc: "/images/aloopakora.jpeg",
      allergicIngredients: "Dairy (paneer, cream, yogurt), Gluten (naan bread), Cashews (gravy base, if used)",
    },
    {
      title: "Chilli Chicken",
      description: "Spicy, tangy, crispy chicken bites",
      recipe: "Marinate, fry, sauté, mix sauces",
      imgSrc: "/images/chillichicken.jpeg",
      allergicIngredients: "Soy sauce (contains soy and gluten), Egg (potential allergen), Flour (may contain gluten), Cornflour (possible corn allergy), Chili sauce (may contain additives or allergens), Vinegar (potential sulfite sensitivity).",
    },
    {
      title: "Dark Chocolate Ice Cream",
      description: "Rich, layered, chocolate sundae.",
      recipe: "Layer ice cream, add toppings.",
      imgSrc: "/images/darkchocolateicecream.jpeg",
      allergicIngredients: "Dairy (milk, cream, ice cream), Chocolate (potential allergen), Nuts (some toppings may contain nuts), Soy (in chocolate or some ice cream).",
    },
    {
      title: "Paneer Kathi Roll",
      description: "Spicy, flavorful, paneer-filled wrap.",
      recipe: "Marinate paneer, sauté, wrap paratha.",
      imgSrc: "/images/paneerkathiroll.jpeg",
      allergicIngredients: "Paneer (dairy allergy), Yogurt (dairy allergy), Wheat-based paratha/roti (gluten sensitivity), Bell peppers (nightshade allergy), Cilantro chutney (may contain sulfites or allergens from specific spices).",
    },
    {
      title: "Pizza",
      description: "Cheesy, spicy, veggie-loaded pizza.",
      recipe: "Prepare dough, add toppings, bake.",
      imgSrc: "/images/pizza.jpeg",
      allergicIngredients: "Cheese (dairy allergy), Wheat crust (gluten sensitivity), Jalapeños (nightshade allergy), Corn (corn allergy), Tomato sauce (nightshade allergy).",
    },
    {
      title: "Strawberry Ice Cream",
      description: "Sweet, fruity, frozen dessert.",
      recipe: "Blend ingredients, churn, then freeze.",
      imgSrc: "/images/strawberryicecream.jpeg",
      allergicIngredients: "Dairy (milk, cream), Potential additives/preservatives.",
    },
  ];

  useEffect(() => {
    const slider = sliderRef.current;
    let isDragging = false;
    let startX = 0;
    let currentRotation = 0;

    const handleMouseDown = (e) => {
      isDragging = true;
      startX = e.clientX;
      slider.style.animation = "none";
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const rotation = Math.max(currentRotation + deltaX / 5, 0); // Restrict rotation to one direction
      slider.style.transform = `perspective(1000px) rotateY(${rotation}deg)`;
      const newIndex = Math.round(rotation / (360 / descriptions.length)) % descriptions.length;
      setCurrentIndex(newIndex >= 0 ? newIndex : descriptions.length + newIndex);
    };

    const handleMouseUp = () => {
      isDragging = false;
      const transform = slider.style.transform;
      const match = transform.match(/rotateY\((-?\d+\.?\d*)deg\)/);
      if (match) {
        currentRotation = parseFloat(match[1]);
        const newIndex = Math.round(currentRotation / (360 / descriptions.length)) % descriptions.length;
        setCurrentIndex(newIndex >= 0 ? newIndex : descriptions.length + newIndex);
      }
      slider.style.animation = "autoRun 20s linear infinite";

      // Update description box with the front-facing card's data
      const frontCardIndex = Math.round(currentRotation / (360 / descriptions.length)) % descriptions.length;
      setCurrentIndex(frontCardIndex >= 0 ? frontCardIndex : descriptions.length + frontCardIndex);
    };

    slider.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      slider.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [descriptions]);

  useEffect(() => {
    const slider = sliderRef.current;
    let animationFrame;

    const updateDescriptionDuringAnimation = () => {
      const computedStyle = window.getComputedStyle(slider);
      const transform = computedStyle.transform;
      const match = transform.match(/matrix3d\((.+)\)/);
      if (match) {
        const values = match[1].split(', ');
        const angle = Math.atan2(values[2], values[0]) * (180 / Math.PI); // Corrected axis for rotation
        const normalizedAngle = (angle < 0 ? 360 + angle : angle) % 360;
        const frontCardIndex = Math.round(normalizedAngle / (360 / descriptions.length)) % descriptions.length;
        setCurrentIndex(frontCardIndex >= 0 ? frontCardIndex : descriptions.length + frontCardIndex);
      }
      animationFrame = requestAnimationFrame(updateDescriptionDuringAnimation);
    };

    updateDescriptionDuringAnimation();

    return () => cancelAnimationFrame(animationFrame);
  }, [descriptions]);

  useEffect(() => {
    const slider = sliderRef.current;

    const handleScroll = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      const rotation = currentIndex * (360 / descriptions.length) + delta * (360 / descriptions.length);
      const newIndex = Math.round(rotation / (360 / descriptions.length)) % descriptions.length;
      setCurrentIndex(newIndex >= 0 ? newIndex : descriptions.length + newIndex);
      slider.style.transform = `perspective(1000px) rotateY(${rotation}deg)`;
    };

    slider.addEventListener("wheel", handleScroll);

    return () => {
      slider.removeEventListener("wheel", handleScroll);
    };
  }, [currentIndex, descriptions]);

  useEffect(() => {
    const slider = sliderRef.current;
    let animationFrame;

    const updateBannerBackground = () => {
      const computedStyle = window.getComputedStyle(slider);
      const transform = computedStyle.transform;
      const match = transform.match(/matrix3d\((.+)\)/);
      if (match) {
        const values = match[1].split(', ');
        const angle = Math.atan2(values[2], values[0]) * (180 / Math.PI);
        const normalizedAngle = (angle < 0 ? 360 + angle : angle) % 360;
        const frontCardIndex = Math.round(normalizedAngle / (360 / descriptions.length)) % descriptions.length;
        const validIndex = frontCardIndex >= 0 ? frontCardIndex : descriptions.length + frontCardIndex;

        // Update banner background
        const banner = document.querySelector('.banner');
        if (banner && descriptions[validIndex]?.imgSrc) {
          banner.style.backgroundImage = `url(${descriptions[validIndex].imgSrc})`;
        }
      }
      animationFrame = requestAnimationFrame(updateBannerBackground);
    };

    updateBannerBackground();

    return () => cancelAnimationFrame(animationFrame);
  }, [descriptions]);

  useEffect(() => {
    const updateBannerBackground = () => {
      const validIndex = currentIndex % descriptions.length;

      // Update banner background
      const banner = document.querySelector('.banner');
      if (banner && descriptions[validIndex]?.imgSrc) {
        banner.style.backgroundImage = `url(${descriptions[validIndex].imgSrc})`;
      }
    };

    updateBannerBackground();
  }, [currentIndex]);

  useEffect(() => {
    const slider = sliderRef.current;

    const handleMouseEnter = () => {
      slider.style.animationPlayState = "paused";
    };

    const handleMouseLeave = () => {
      slider.style.animationPlayState = "running";
    };

    const handleMouseDown = (e) => {
      e.preventDefault();
      slider.isDragging = true;
      slider.startX = e.clientX;
      slider.currentRotation = parseFloat(slider.style.transform.replace(/[^0-9.-]/g, '')) || 0;
    };

    const handleMouseMove = (e) => {
      if (!slider.isDragging) return;
      const deltaX = e.clientX - slider.startX;
      const rotation = slider.currentRotation + deltaX / 5;
      slider.style.transform = `perspective(1000px) rotateY(${rotation}deg)`;
    };

    const handleMouseUp = () => {
      slider.isDragging = false;
    };

    slider.addEventListener("mouseenter", handleMouseEnter);
    slider.addEventListener("mouseleave", handleMouseLeave);
    slider.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      slider.removeEventListener("mouseenter", handleMouseEnter);
      slider.removeEventListener("mouseleave", handleMouseLeave);
      slider.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="banner shadow">
      <div className="slider" ref={sliderRef} style={{ "--quantity": descriptions.length }}>
        {descriptions.map((item, index) => (
          <div
            key={index}
            className={`item ${index === currentIndex ? 'active' : ''}`}
            style={{ "--position": index + 1 }}
          >
            <img src={item.imgSrc} alt={item.title} />
          </div>
        ))}
      </div>

      <div className="description-container">
        <h3>{descriptions[currentIndex].title}</h3>
        <p>{descriptions[currentIndex].description}</p>
        <p><strong>Recipe:</strong> {descriptions[currentIndex].recipe}</p>
        <p><strong>Allergic Ingredients:</strong> {descriptions[currentIndex].allergicIngredients}</p>
      </div>
    </div>
  );
};

export default Slider2;