/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import Logo from "../Assets/logo4.png";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "react-scroll";  // Import from react-scroll



const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);

  // Menu options with corresponding links
  const menuOptions = [
    {
      text: "Home",
      icon: <HomeIcon />,
      link: "/",   // Add route paths here
    },
    {
      text: "About",
      icon: <InfoIcon />,
      link: "/about",  // Add route paths here
    },
    {
      text: "Testimonials",
      icon: <CommentRoundedIcon />,
      link: "/testimonials",  // Add route paths here
    },
    {
      text: "Contact",
      icon: <PhoneRoundedIcon />,
      link: "/contact",  // Add route paths here
    },
  ];

  return (
    <nav>
      {/* Logo */}
      <div className="nav-logo-container">
        <img src={Logo} alt="Logo" />
      </div>

      {/* Navbar links */}
      <div className="navbar-links-container">
        {/* Replace a tags with Link components */}
        <Link to="/" spy={true} smooth={true} offset={50} duration={500}>Home</Link>
        <Link to="about" spy={true} smooth={true} offset={-100} duration={500}>About</Link>
        <Link to="testimonials" spy={true} smooth={true} offset={-100} duration={500}>Testimonials</Link>
        <Link to="contact" spy={true} smooth={true} offset={-150} duration={500}>Contact</Link>

        {/* Buttons for sign up and login */}
        <RouterLink to="/signup" className="primary-button">Sign up</RouterLink>
        <RouterLink to="/login" className="primary-button">Login</RouterLink>
      </div>

      {/* Drawer for mobile menu */}
      <div className="navbar-menu-container">
        {/* You can add a button here to open the drawer */}
      </div>
      <Drawer open={openMenu} onClose={() => setOpenMenu(false)} anchor="right">
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setOpenMenu(false)}
          onKeyDown={() => setOpenMenu(false)}
        >
          <List>
            {menuOptions.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.link}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
    </nav>
  );
};

export default Navbar;
