import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import sejal from "../Assets/sejal_photo.jpeg"
import Roshani from "../Assets/roshani_photo.jpeg"


const testimonials = [
  {
    id: 1,
    name: "Sejal Ingale",
    image: sejal,
    text: "A very good platform to find all services in one place",
    rating: 5,
  },
  {
    id: 2,
    name: "Akash Choudhary",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Q1ntVhsGAubjlUXlkUfQGhLOj0Q2tCD7DQ&s",
    text: "Seamless sharing experience, awesome!",
    rating: 5,
  },
  {
    id: 3,
    name: "Roshani Dubey",
    image: Roshani,
    text: "Easy sharing with intutive UI",
    rating: 5,
  },
  {
    id: 4,
    name: "Abhishek Bharambe",
    image: "https://static.tvtropes.org/pmwiki/pub/images/hiroshi_nohara.png",
    text: "Cool got everything on this one platform !",
    rating: 5,
  },
];

const TestimonialSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  return (
    <div className="testimonial-slider" id="testimonials" style={{ width: '80%', margin: '0 auto', textAlign: 'center' }}>
      <p className="primary-subheading">Testimonial</p>
      <Slider {...settings}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial">
            <div className="image-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <img
                src={testimonial.image}
                alt={testimonial.name}
                style={{ borderRadius: '50%', width: '150px', height: '150px' }}
              />
            </div>
            <p>{testimonial.text}</p>
            <div className="stars" style={{ color: '#fcb742' }}>
              {'★'.repeat(testimonial.rating)}
            </div>
            <h3>{testimonial.name}</h3>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TestimonialSlider;
