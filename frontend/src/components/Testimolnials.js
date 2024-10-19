import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    image: "https://i.pinimg.com/736x/3d/96/eb/3d96eba59a324ac1570e174fd5bb5e94.jpg",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    rating: 5,
  },
  {
    id: 2,
    name: "Jane Smith",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Q1ntVhsGAubjlUXlkUfQGhLOj0Q2tCD7DQ&s",
    text: "Proin gravida nibh vel velit auctor aliquet.",
    rating: 5,
  },
  {
    id: 3,
    name: "Mary Johnson",
    image: "https://i.pinimg.com/736x/9c/0c/04/9c0c0433aeeab0b6227da3b4a1f28258.jpg",
    text: "Curabitur blandit tempus porttitor.",
    rating: 5,
  },
  {
    id: 4,
    name: "James Lee",
    image: "https://static.tvtropes.org/pmwiki/pub/images/hiroshi_nohara.png",
    text: "Vivamus sagittis lacus vel augue laoreet rutrum.",
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
    <div className="testimonial-slider" style={{ width: '80%', margin: '0 auto', textAlign: 'center' }}>
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
